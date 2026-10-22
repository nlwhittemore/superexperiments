import { after } from "next/server";
import { NextResponse } from "next/server";
import type Anthropic from "@anthropic-ai/sdk";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { loadInterviewContext } from "@/lib/interview/context";
import { buildInterviewSystemPrompt } from "@/lib/interview/prompt";
import {
  insertMessage,
  runInterviewTurn,
  type SendFn,
} from "@/lib/interview/engine";
import { MODELS } from "@/lib/anthropic";
import { assessInterview } from "@/lib/analysis/assess";

export const maxDuration = 300;

const OPEN_STATUSES = ["setup", "active", "analyzing"];
const STALE_LOCK_MS = 120_000;

export async function POST(
  request: Request,
  { params }: { params: Promise<{ token: string }> },
) {
  const { token } = await params;
  const ctx = await loadInterviewContext(token);
  if (!ctx) {
    return NextResponse.json({ error: "Invalid link" }, { status: 404 });
  }
  if (!OPEN_STATUSES.includes(ctx.engagement.status)) {
    return NextResponse.json(
      { error: "This audit is no longer accepting responses." },
      { status: 409 },
    );
  }

  let body: { id?: string; text?: string; start?: boolean };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
  const isStart = body.start === true;
  const text = (body.text ?? "").trim();
  if (!isStart && !text) {
    return NextResponse.json({ error: "Message is empty" }, { status: 400 });
  }
  if (!isStart && text.length > 8000) {
    return NextResponse.json({ error: "Message too long" }, { status: 400 });
  }

  const db = supabaseAdmin();

  // Find or create the interview row.
  let { data: interview } = await db
    .from("interviews")
    .select("id, status")
    .eq("participant_id", ctx.participant.id)
    .maybeSingle();

  if (!interview) {
    const { data: created, error } = await db
      .from("interviews")
      .insert({
        participant_id: ctx.participant.id,
        model: MODELS.interview,
      })
      .select("id, status")
      .single();
    if (error || !created) {
      // Unique violation means a concurrent request created it — refetch.
      const { data: refetched } = await db
        .from("interviews")
        .select("id, status")
        .eq("participant_id", ctx.participant.id)
        .single();
      interview = refetched;
    } else {
      interview = created;
      await db
        .from("participants")
        .update({ status: "started", started_at: new Date().toISOString() })
        .eq("id", ctx.participant.id)
        .eq("status", "invited");
    }
  }
  if (!interview) {
    return NextResponse.json({ error: "Could not open interview" }, { status: 500 });
  }
  if (interview.status === "completed") {
    return NextResponse.json(
      { error: "This interview is already complete." },
      { status: 409 },
    );
  }

  // Claim the generation lock (guards against concurrent streams).
  const staleBefore = new Date(Date.now() - STALE_LOCK_MS).toISOString();
  const { data: claimed } = await db
    .from("interviews")
    .update({ generating_since: new Date().toISOString() })
    .eq("id", interview.id)
    .or(`generating_since.is.null,generating_since.lt.${staleBefore}`)
    .select("id");
  if (!claimed || claimed.length === 0) {
    return NextResponse.json(
      { error: "A response is already being generated." },
      { status: 409 },
    );
  }
  const releaseLock = async () => {
    await db
      .from("interviews")
      .update({ generating_since: null })
      .eq("id", interview.id);
  };

  try {
    if (isStart) {
      const { count } = await db
        .from("interview_messages")
        .select("id", { count: "exact", head: true })
        .eq("interview_id", interview.id);
      if ((count ?? 0) > 0) {
        await releaseLock();
        return NextResponse.json(
          { error: "Interview already started" },
          { status: 409 },
        );
      }
      await insertMessage(
        interview.id,
        "user",
        [{ type: "text", text: "<interview_start/>" }],
        true,
        body.id,
      );
    } else {
      await insertMessage(
        interview.id,
        "user",
        [{ type: "text", text }],
        false,
        body.id,
      );
    }

    const { data: rows } = await db
      .from("interview_messages")
      .select("role, content")
      .eq("interview_id", interview.id)
      .order("created_at", { ascending: true });

    const messages = (rows ?? []).map((r) => ({
      role: r.role as "user" | "assistant",
      content: r.content as Anthropic.Messages.ContentBlockParam[],
    }));

    const system = buildInterviewSystemPrompt({
      companyName: ctx.company.name,
      participantName: ctx.participant.name,
      participantRole: ctx.participant.role_title,
      introMessage: ctx.template.intro_message,
      questions: ctx.questions,
    });

    // Auto-assessment must be registered in handler scope, before the
    // Response is returned — not from inside stream callbacks.
    let resolveDone!: (completed: boolean) => void;
    const done = new Promise<boolean>((r) => (resolveDone = r));
    if (ctx.engagement.auto_assess) {
      after(async () => {
        const completed = await done;
        if (!completed) return;
        try {
          await assessInterview(interview.id);
        } catch (e) {
          console.error("[interview] auto-assess failed:", e);
        }
      });
    }

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      start(controller) {
        let gone = false;
        const send: SendFn = (event, data) => {
          if (gone) return;
          try {
            controller.enqueue(
              encoder.encode(
                `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`,
              ),
            );
          } catch {
            gone = true;
          }
        };

        (async () => {
          try {
            const result = await runInterviewTurn({
              interviewId: interview.id,
              participantId: ctx.participant.id,
              totalQuestions: ctx.questions.length,
              system,
              messages,
              send,
            });
            resolveDone(result.completed);
            send("turn_end", {});
          } catch (e) {
            console.error("[interview] turn failed:", e);
            resolveDone(false);
            send("error", {
              message:
                "Something went wrong generating a response. Your answer was saved — please try again.",
            });
          } finally {
            await releaseLock();
            try {
              controller.close();
            } catch {
              // already closed
            }
          }
        })();
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache, no-transform",
        "X-Accel-Buffering": "no",
      },
    });
  } catch (e) {
    await releaseLock();
    console.error("[interview] request failed:", e);
    return NextResponse.json({ error: "Request failed" }, { status: 500 });
  }
}
