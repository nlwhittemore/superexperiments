import "server-only";
import type Anthropic from "@anthropic-ai/sdk";
import { anthropic, MODELS } from "@/lib/anthropic";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { extractText } from "@/lib/interview/engine";
import type {
  AssessmentScores,
  Dimension,
  MaturityLevelDef,
  Question,
  TemplateConfig,
} from "@/lib/types";
import {
  buildAssessmentSystemPrompt,
  buildAssessmentUserMessage,
} from "./prompts";

const recordAssessmentTool = (dimensionKeys: string[]): Anthropic.Messages.Tool => ({
  name: "record_assessment",
  description:
    "Record the final assessment for this interview. Call exactly once.",
  input_schema: {
    type: "object" as const,
    properties: {
      maturity_level: {
        type: "integer",
        minimum: 0,
        maximum: 4,
        description: "Overall agentic maturity level, 0–4.",
      },
      scores: {
        type: "object",
        description: `Per-dimension scores. Keys must be exactly: ${dimensionKeys.join(", ")}.`,
        properties: Object.fromEntries(
          dimensionKeys.map((k) => [
            k,
            {
              type: "object",
              properties: {
                score: { type: "integer", minimum: 0, maximum: 4 },
                rationale: { type: "string" },
                evidence: {
                  type: "array",
                  items: { type: "string" },
                  description:
                    "Short anonymized verbatim or near-verbatim quotes supporting the score.",
                },
              },
              required: ["score", "rationale", "evidence"],
            },
          ]),
        ),
        required: dimensionKeys,
      },
      summary: {
        type: "string",
        description: "3–6 sentence plain-prose summary for the research team.",
      },
      flags: {
        type: "object",
        properties: {
          use_case_ideas: { type: "array", items: { type: "string" } },
          blockers: { type: "array", items: { type: "string" } },
          notable_quotes: { type: "array", items: { type: "string" } },
          training_needs: { type: "array", items: { type: "string" } },
          champion_signal: { type: "boolean" },
        },
        required: [],
      },
    },
    required: ["maturity_level", "scores", "summary", "flags"],
  },
});

export type AssessResult =
  | { ok: true; skipped?: boolean }
  | { ok: false; error: string };

export async function assessInterview(
  interviewId: string,
  opts: { runId?: string; force?: boolean } = {},
): Promise<AssessResult> {
  const db = supabaseAdmin();

  try {
    if (!opts.force) {
      const { data: existing } = await db
        .from("assessments")
        .select("status")
        .eq("interview_id", interviewId)
        .maybeSingle();
      if (existing?.status === "completed") return { ok: true, skipped: true };
    }

    const { data: interview } = await db
      .from("interviews")
      .select(
        "id, status, participants(id, name, role_title, segment, engagements(id, companies(name), audit_templates(id, config)))",
      )
      .eq("id", interviewId)
      .maybeSingle();
    if (!interview) return { ok: false, error: "Interview not found." };

    const participant = interview.participants as unknown as {
      id: string;
      name: string;
      role_title: string | null;
      segment: string;
      engagements: {
        id: string;
        companies: { name: string };
        audit_templates: { id: string; config: TemplateConfig };
      };
    };
    const template = participant.engagements.audit_templates;
    const dimensions: Dimension[] = template.config?.dimensions ?? [];
    const maturityLevels: MaturityLevelDef[] =
      template.config?.maturity_levels ?? [];
    if (dimensions.length === 0) {
      return { ok: false, error: "Template has no dimensions configured." };
    }

    const [{ data: questions }, { data: materials }, { data: messages }] =
      await Promise.all([
        db
          .from("questions")
          .select("id, template_id, position, prompt, intent, probe_guidance, dimension")
          .eq("template_id", template.id)
          .order("position"),
        db
          .from("reference_materials")
          .select("kind, title, content")
          .or(`template_id.eq.${template.id},template_id.is.null`)
          .order("position"),
        db
          .from("interview_messages")
          .select("role, content, hidden")
          .eq("interview_id", interviewId)
          .order("created_at"),
      ]);

    const transcript = (messages ?? [])
      .filter((m) => !m.hidden)
      .map((m) => ({ role: m.role, text: extractText(m.content) }))
      .filter((m) => m.text.trim().length > 0);
    if (transcript.length < 2) {
      return { ok: false, error: "Transcript too short to assess." };
    }

    await db.from("assessments").upsert(
      {
        interview_id: interviewId,
        run_id: opts.runId ?? null,
        status: "processing",
        error: null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "interview_id" },
    );

    const dimensionKeys = dimensions.map((d) => d.key);
    const response = await anthropic().messages.create({
      model: MODELS.analysis,
      max_tokens: 4000,
      system: buildAssessmentSystemPrompt({
        dimensions,
        maturityLevels,
        materials: materials ?? [],
      }),
      messages: [
        {
          role: "user",
          content: buildAssessmentUserMessage({
            participantName: participant.name,
            roleTitle: participant.role_title,
            segment: participant.segment,
            companyName: participant.engagements.companies.name,
            questions: (questions ?? []) as Question[],
            transcript,
          }),
        },
      ],
      tools: [recordAssessmentTool(dimensionKeys)],
      tool_choice: { type: "tool", name: "record_assessment" },
    });

    const toolUse = response.content.find(
      (b): b is Anthropic.Messages.ToolUseBlock => b.type === "tool_use",
    );
    if (!toolUse) throw new Error("Model returned no assessment.");

    const input = toolUse.input as {
      maturity_level: number;
      scores: AssessmentScores;
      summary: string;
      flags: unknown;
    };

    const clamp = (n: number) => Math.max(0, Math.min(4, Math.round(n)));
    const scores: AssessmentScores = {};
    for (const key of dimensionKeys) {
      const s = input.scores?.[key];
      if (!s) throw new Error(`Model omitted dimension "${key}".`);
      scores[key] = {
        score: clamp(s.score),
        rationale: String(s.rationale ?? ""),
        evidence: Array.isArray(s.evidence) ? s.evidence.map(String) : [],
      };
    }

    const { error: upsertError } = await db.from("assessments").upsert(
      {
        interview_id: interviewId,
        run_id: opts.runId ?? null,
        status: "completed",
        scores,
        maturity_level: clamp(input.maturity_level),
        summary: String(input.summary ?? ""),
        flags: input.flags ?? {},
        model: MODELS.analysis,
        error: null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "interview_id" },
    );
    if (upsertError) throw new Error(upsertError.message);

    return { ok: true };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Assessment failed.";
    await db.from("assessments").upsert(
      {
        interview_id: interviewId,
        run_id: opts.runId ?? null,
        status: "error",
        error: message,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "interview_id" },
    );
    console.error(`[analysis] assess ${interviewId} failed:`, message);
    return { ok: false, error: message };
  }
}
