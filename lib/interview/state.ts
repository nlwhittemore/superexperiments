import "server-only";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { loadInterviewContext } from "./context";
import { extractText } from "./engine";

export type InterviewClientState = {
  participant: { name: string; status: string };
  company: string;
  intro: string | null;
  totalQuestions: number;
  engagementStatus: string;
  interview: {
    status: string;
    currentQuestion: number;
    covered: number;
  } | null;
  messages: { id: string; role: string; text: string }[];
};

export async function getInterviewState(
  token: string,
): Promise<InterviewClientState | null> {
  const ctx = await loadInterviewContext(token);
  if (!ctx) return null;

  const db = supabaseAdmin();
  const { data: interview } = await db
    .from("interviews")
    .select("id, status, coverage, current_question")
    .eq("participant_id", ctx.participant.id)
    .maybeSingle();

  let messages: { id: string; role: string; text: string }[] = [];
  if (interview) {
    const { data: rows } = await db
      .from("interview_messages")
      .select("id, role, content, hidden")
      .eq("interview_id", interview.id)
      .order("created_at", { ascending: true });
    messages = (rows ?? [])
      .filter((r) => !r.hidden)
      .map((r) => ({ id: r.id, role: r.role, text: extractText(r.content) }))
      .filter((m) => m.text.length > 0);
  }

  const covered = interview
    ? Object.values(
        (interview.coverage ?? {}) as Record<string, { done?: boolean }>,
      ).filter((c) => c.done).length
    : 0;

  return {
    participant: { name: ctx.participant.name, status: ctx.participant.status },
    company: ctx.company.name,
    intro: ctx.template.intro_message,
    totalQuestions: ctx.questions.length,
    engagementStatus: ctx.engagement.status,
    interview: interview
      ? {
          status: interview.status,
          currentQuestion: interview.current_question,
          covered,
        }
      : null,
    messages,
  };
}
