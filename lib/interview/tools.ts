import "server-only";
import type Anthropic from "@anthropic-ai/sdk";
import { supabaseAdmin } from "@/lib/supabase/admin";
import type { Coverage } from "@/lib/types";

export const interviewTools: Anthropic.Messages.Tool[] = [
  {
    name: "advance_question",
    description:
      "Record that a scripted question is sufficiently answered. MANDATORY: you must call this before asking the next scripted question — the participant's progress bar only moves through this tool, never through your text. Call once per question, right before asking the next one (or right before complete_interview on the last). If you notice an earlier question was answered but never recorded, call this for each unrecorded question in order to catch up.",
    input_schema: {
      type: "object",
      properties: {
        question_number: {
          type: "integer",
          description: "The position number of the question you just finished",
        },
        takeaway: {
          type: "string",
          description: "One-sentence summary of what you learned from this answer",
        },
      },
      required: ["question_number", "takeaway"],
    },
  },
  {
    name: "complete_interview",
    description:
      "Call when every question has been covered, or the participant clearly wants to stop. Call it in the same message as your closing thank-you.",
    input_schema: {
      type: "object",
      properties: {
        closing_note: {
          type: "string",
          description:
            "One-sentence internal note on interview quality and anything notable",
        },
      },
      required: ["closing_note"],
    },
  },
];

export type ToolEffect = {
  resultContent: string;
  completed?: boolean;
  progress?: { current_question: number; covered: number };
};

export async function execInterviewTool(opts: {
  toolName: string;
  input: Record<string, unknown>;
  interviewId: string;
  participantId: string;
  totalQuestions: number;
}): Promise<ToolEffect> {
  const db = supabaseAdmin();

  if (opts.toolName === "advance_question") {
    const n = Number(opts.input.question_number);
    const takeaway = String(opts.input.takeaway ?? "");
    const { data: row } = await db
      .from("interviews")
      .select("coverage, current_question")
      .eq("id", opts.interviewId)
      .single();
    const coverage: Coverage = { ...(row?.coverage ?? {}) };
    coverage[String(n)] = { done: true, takeaway };
    const current = Math.max(
      row?.current_question ?? 1,
      Math.min(n + 1, opts.totalQuestions),
    );
    await db
      .from("interviews")
      .update({ coverage, current_question: current })
      .eq("id", opts.interviewId);
    return {
      resultContent: "Recorded.",
      progress: {
        current_question: current,
        covered: Object.values(coverage).filter((c) => c.done).length,
      },
    };
  }

  if (opts.toolName === "complete_interview") {
    const now = new Date().toISOString();
    await db
      .from("interviews")
      .update({ status: "completed", completed_at: now })
      .eq("id", opts.interviewId);
    await db
      .from("participants")
      .update({ status: "completed", completed_at: now })
      .eq("id", opts.participantId);
    return { resultContent: "Interview marked complete.", completed: true };
  }

  return { resultContent: `Unknown tool: ${opts.toolName}` };
}
