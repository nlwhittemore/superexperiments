import "server-only";
import { anthropic, MODELS } from "@/lib/anthropic";
import { supabaseAdmin } from "@/lib/supabase/admin";
import type {
  AssessmentScores,
  Dimension,
  ReportSnapshot,
  TemplateConfig,
} from "@/lib/types";
import {
  buildSynthesisSystemPrompt,
  buildSynthesisUserMessage,
} from "./prompts";

const PER_DOC_CHAR_CAP = 24_000;
const TOTAL_DOC_CHAR_CAP = 120_000;

type AssessmentRow = {
  maturity_level: number | null;
  scores: AssessmentScores | null;
  summary: string | null;
  flags: unknown;
  interviews: {
    participants: { segment: string; role_title: string | null };
  };
};

export function computeSnapshot(opts: {
  participantCount: number;
  completedCount: number;
  assessments: {
    maturityLevel: number | null;
    scores: AssessmentScores | null;
    segment: string;
  }[];
  dimensions: Dimension[];
}): ReportSnapshot {
  const assessed = opts.assessments;
  const levels = assessed
    .map((a) => a.maturityLevel)
    .filter((l): l is number => l !== null);

  const avg = (xs: number[]) =>
    xs.length === 0 ? null : Math.round((xs.reduce((a, b) => a + b, 0) / xs.length) * 100) / 100;

  const distribution: Record<string, number> = {};
  for (let l = 0; l <= 4; l++) distribution[`L${l}`] = 0;
  for (const l of levels) distribution[`L${l}`]++;

  const dimensionAverages: Record<string, number | null> = {};
  for (const d of opts.dimensions) {
    dimensionAverages[d.key] = avg(
      assessed
        .map((a) => a.scores?.[d.key]?.score)
        .filter((s): s is number => typeof s === "number"),
    );
  }

  const segmentBreakdown: Record<string, { count: number; avg_maturity: number | null }> = {};
  for (const segment of ["leader", "ic"]) {
    const seg = assessed.filter((a) => a.segment === segment);
    segmentBreakdown[segment] = {
      count: seg.length,
      avg_maturity: avg(
        seg.map((a) => a.maturityLevel).filter((l): l is number => l !== null),
      ),
    };
  }

  return {
    participant_count: opts.participantCount,
    completed_count: opts.completedCount,
    assessed_count: assessed.length,
    avg_maturity: avg(levels),
    maturity_distribution: distribution,
    dimension_averages: dimensionAverages,
    segment_breakdown: segmentBreakdown,
  };
}

export async function synthesizeReport(opts: {
  engagementId: string;
  runId?: string;
}): Promise<{ ok: true; reportId: string } | { ok: false; error: string }> {
  const db = supabaseAdmin();

  const { data: engagement } = await db
    .from("engagements")
    .select("id, template_id, companies(name), audit_templates(id, config)")
    .eq("id", opts.engagementId)
    .maybeSingle();
  if (!engagement) return { ok: false, error: "Engagement not found." };

  const companyName =
    (engagement.companies as unknown as { name: string })?.name ?? "the company";
  const config = ((engagement.audit_templates as unknown as { config: TemplateConfig })
    ?.config ?? {}) as TemplateConfig;
  const dimensions = config.dimensions ?? [];
  const maturityLevels = config.maturity_levels ?? [];

  const [
    { data: materials },
    { data: assessmentRows },
    { data: participants },
    { data: documents },
  ] = await Promise.all([
    db
      .from("reference_materials")
      .select("kind, title, content")
      .or(`template_id.eq.${engagement.template_id},template_id.is.null`)
      .order("position"),
    db
      .from("assessments")
      .select(
        "maturity_level, scores, summary, flags, status, interviews!inner(participants!inner(segment, role_title, engagement_id))",
      )
      .eq("status", "completed")
      .eq("interviews.participants.engagement_id", opts.engagementId),
    db
      .from("participants")
      .select("id, status")
      .eq("engagement_id", opts.engagementId),
    db
      .from("documents")
      .select("title, extracted_text")
      .eq("engagement_id", opts.engagementId)
      .eq("extraction_status", "ready")
      .order("created_at"),
  ]);

  const assessments = (assessmentRows ?? []) as unknown as AssessmentRow[];
  if (assessments.length === 0) {
    return { ok: false, error: "No completed assessments to synthesize." };
  }

  const snapshot = computeSnapshot({
    participantCount: (participants ?? []).length,
    completedCount: (participants ?? []).filter((p) => p.status === "completed").length,
    assessments: assessments.map((a) => ({
      maturityLevel: a.maturity_level,
      scores: a.scores,
      segment: a.interviews.participants.segment,
    })),
    dimensions,
  });

  let docBudget = TOTAL_DOC_CHAR_CAP;
  const docs: { title: string; text: string }[] = [];
  for (const d of documents ?? []) {
    const text = (d.extracted_text ?? "").trim();
    if (!text || docBudget <= 0) continue;
    const slice = text.slice(0, Math.min(PER_DOC_CHAR_CAP, docBudget));
    docs.push({
      title: d.title,
      text: slice + (slice.length < text.length ? "\n\n[truncated]" : ""),
    });
    docBudget -= slice.length;
  }

  const stream = anthropic().messages.stream({
    model: MODELS.analysis,
    max_tokens: 16_000,
    system: buildSynthesisSystemPrompt({
      companyName,
      dimensions,
      maturityLevels,
      materials: materials ?? [],
    }),
    messages: [
      {
        role: "user",
        content: buildSynthesisUserMessage({
          companyName,
          snapshot,
          dimensions,
          assessments: assessments.map((a) => ({
            segment: a.interviews.participants.segment,
            roleTitle: a.interviews.participants.role_title,
            maturityLevel: a.maturity_level,
            scores: a.scores,
            summary: a.summary,
            flags: a.flags,
          })),
          documents: docs,
        }),
      },
    ],
  });
  const final = await stream.finalMessage();
  const content = final.content
    .filter((b): b is { type: "text"; text: string } & typeof b => b.type === "text")
    .map((b) => b.text)
    .join("")
    .trim();
  if (!content) return { ok: false, error: "Synthesis returned no text." };

  const { count } = await db
    .from("reports")
    .select("id", { count: "exact", head: true })
    .eq("engagement_id", opts.engagementId);
  const version = (count ?? 0) + 1;

  const { data: report, error } = await db
    .from("reports")
    .insert({
      engagement_id: opts.engagementId,
      run_id: opts.runId ?? null,
      version,
      title: `${companyName} — Agent Readiness Audit (v${version})`,
      content,
      snapshot,
      status: "draft",
    })
    .select("id")
    .single();
  if (error) return { ok: false, error: error.message };

  return { ok: true, reportId: report.id };
}
