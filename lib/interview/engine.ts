import "server-only";
import type Anthropic from "@anthropic-ai/sdk";
import { anthropic, MODELS } from "@/lib/anthropic";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { interviewTools, execInterviewTool } from "./tools";

export type SendFn = (event: string, data: unknown) => void;

type Block = Anthropic.Messages.ContentBlockParam;
type Msg = Anthropic.Messages.MessageParam;

export async function insertMessage(
  interviewId: string,
  role: "user" | "assistant",
  content: unknown,
  hidden: boolean,
  id?: string,
) {
  const db = supabaseAdmin();
  const { error } = await db.from("interview_messages").upsert(
    {
      id: id ?? crypto.randomUUID(),
      interview_id: interviewId,
      role,
      content,
      hidden,
    },
    { onConflict: "id", ignoreDuplicates: true },
  );
  if (error) throw new Error(`Failed to persist message: ${error.message}`);
}

// Attach a rolling cache breakpoint to the last block of the last message.
// Operates on a shallow clone so stored content stays pristine.
function withRollingCache(messages: Msg[]): Msg[] {
  if (messages.length === 0) return messages;
  const out = messages.slice();
  const last = out[out.length - 1];
  if (typeof last.content === "string") {
    out[out.length - 1] = {
      ...last,
      content: [
        {
          type: "text",
          text: last.content,
          cache_control: { type: "ephemeral" },
        },
      ],
    };
    return out;
  }
  const blocks = (last.content as Block[]).slice();
  const lastBlock = blocks[blocks.length - 1];
  blocks[blocks.length - 1] = {
    ...lastBlock,
    cache_control: { type: "ephemeral" },
  } as Block;
  out[out.length - 1] = { ...last, content: blocks };
  return out;
}

export async function runInterviewTurn(opts: {
  interviewId: string;
  participantId: string;
  totalQuestions: number;
  system: string;
  messages: Msg[];
  send: SendFn;
}): Promise<{ completed: boolean }> {
  const client = anthropic();
  const messages = [...opts.messages];
  let completed = false;

  // A single participant turn can span several model turns when tools fire,
  // but never legitimately more than a handful.
  for (let hop = 0; hop < 6; hop++) {
    const stream = client.messages.stream({
      model: MODELS.interview,
      max_tokens: 1024,
      system: [
        {
          type: "text",
          text: opts.system,
          cache_control: { type: "ephemeral" },
        },
      ],
      tools: interviewTools,
      tool_choice: { type: "auto", disable_parallel_tool_use: true },
      messages: withRollingCache(messages),
    });

    stream.on("text", (t) => opts.send("delta", { t }));
    const final = await stream.finalMessage();

    await insertMessage(opts.interviewId, "assistant", final.content, false);
    messages.push({ role: "assistant", content: final.content });

    if (final.stop_reason !== "tool_use") break;

    const toolUses = final.content.filter(
      (b): b is Anthropic.Messages.ToolUseBlock => b.type === "tool_use",
    );
    const results: Block[] = [];
    for (const tu of toolUses) {
      const effect = await execInterviewTool({
        toolName: tu.name,
        input: (tu.input ?? {}) as Record<string, unknown>,
        interviewId: opts.interviewId,
        participantId: opts.participantId,
        totalQuestions: opts.totalQuestions,
      });
      if (effect.progress) {
        opts.send("progress", {
          ...effect.progress,
          total: opts.totalQuestions,
        });
      }
      if (effect.completed) {
        completed = true;
        opts.send("complete", {});
      }
      results.push({
        type: "tool_result",
        tool_use_id: tu.id,
        content: effect.resultContent,
      });
    }

    await insertMessage(opts.interviewId, "user", results, true);
    messages.push({ role: "user", content: results });
  }

  return { completed };
}

export function extractText(content: unknown): string {
  if (typeof content === "string") return content;
  if (!Array.isArray(content)) return "";
  return content
    .filter((b) => b && typeof b === "object" && b.type === "text")
    .map((b) => b.text as string)
    .join("\n\n");
}
