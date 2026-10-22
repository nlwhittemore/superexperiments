import "server-only";
import type {
  Dimension,
  MaturityLevelDef,
  Question,
  ReportSnapshot,
} from "@/lib/types";

type Material = { kind: string; title: string; content: string };

function materialBlock(materials: Material[], kind: string): string {
  const items = materials.filter((m) => m.kind === kind);
  if (items.length === 0) return "(none provided)";
  return items.map((m) => `## ${m.title}\n\n${m.content}`).join("\n\n---\n\n");
}

export function buildAssessmentSystemPrompt(opts: {
  dimensions: Dimension[];
  maturityLevels: MaturityLevelDef[];
  materials: Material[];
}): string {
  const dims = opts.dimensions
    .map((d) => `- \`${d.key}\` — ${d.label}: ${d.description}`)
    .join("\n");
  const ladder = opts.maturityLevels
    .map((l) => `- L${l.level} — ${l.name}: ${l.description}`)
    .join("\n");

  return `You are the assessment engine for Superintelligent's Agent Readiness Audit. You read one interview transcript and produce a rigorous, evidence-anchored assessment of the participant.

THE MATURITY LADDER (overall level, 0–4)
${ladder}

THE DIMENSIONS (score each 0–4)
${dims}

SCORING RUBRIC (authoritative — follow it exactly)
${materialBlock(opts.materials, "rubric")}

RULES
- Score only on what the participant actually said. Never invent evidence.
- Every dimension score needs a one-to-three-sentence rationale and at least one short verbatim or closely paraphrased evidence quote when the transcript supports one. If evidence is thin, score conservatively and say so in the rationale.
- Apply the misclassification traps from the rubric — especially the chatbot-vs-agent distinction.
- The summary is 3–6 sentences of plain prose for the Superintelligent team: who this person is, how they really use AI, what stands out.
- Quotes must not identify the participant by name.
- Record the assessment with the record_assessment tool. Use exactly the dimension keys listed above in scores.`;
}

export function buildAssessmentUserMessage(opts: {
  participantName: string;
  roleTitle: string | null;
  segment: string;
  companyName: string;
  questions: Question[];
  transcript: { role: string; text: string }[];
}): string {
  const script = opts.questions
    .map(
      (q) =>
        `${q.position}. ${q.prompt}${q.intent ? `\n   (intent: ${q.intent})` : ""}`,
    )
    .join("\n");
  const convo = opts.transcript
    .map(
      (m) =>
        `${m.role === "assistant" ? "INTERVIEWER" : "PARTICIPANT"}: ${m.text}`,
    )
    .join("\n\n");

  return `PARTICIPANT
Name: ${opts.participantName}
Role: ${opts.roleTitle ?? "unknown"}
Segment: ${opts.segment}
Company: ${opts.companyName}

INTERVIEW SCRIPT (for reference)
${script}

TRANSCRIPT
${convo}

Assess this interview now using record_assessment.`;
}

export function buildSynthesisSystemPrompt(opts: {
  companyName: string;
  dimensions: Dimension[];
  maturityLevels: MaturityLevelDef[];
  materials: Material[];
}): string {
  const dims = opts.dimensions
    .map((d) => `- ${d.label} (\`${d.key}\`): ${d.description}`)
    .join("\n");
  const ladder = opts.maturityLevels
    .map((l) => `- L${l.level} — ${l.name}: ${l.description}`)
    .join("\n");

  return `You are the lead analyst for Superintelligent (besuper.ai), writing the final Agent Readiness Audit report for ${opts.companyName}. Your readers are ${opts.companyName}'s executive team. You synthesize individual interview assessments, company documents, and the playbook below into one decisive, evidence-grounded report.

THE MATURITY LADDER
${ladder}

THE DIMENSIONS
${dims}

RECOMMENDATIONS PLAYBOOK (authoritative — derive recommendations from it)
${materialBlock(opts.materials, "playbook")}

ADDITIONAL CONTEXT MATERIALS
${materialBlock(opts.materials, "context")}

REPORT STRUCTURE (use exactly these top-level sections, as markdown H2)
1. Executive Summary — the org's current maturity level, the realistic 12-month target, the three moves that matter most, expected payoff. Readable by a CEO in two minutes.
2. Agentic Maturity Snapshot — interpret the computed stats you are given: org-level maturity, distribution, per-dimension averages, leader vs IC contrast. Do not recompute or invent numbers; reference the provided ones.
3. What We Heard — 4–7 themes from the interviews, each with one or two short anonymized quotes.
4. Gap Analysis — where the org is strong vs blocked, dimension by dimension; name the binding constraints.
5. Prioritized Recommendations — three to five recommendations drawn from the playbook categories, each citing the evidence pattern that triggered it.
6. 30/60/90-Day Roadmap — concrete sequencing of the recommendations per the playbook's roadmap discipline.
7. Methodology — two short paragraphs: text-based AI-led interviews, six-dimension + maturity-ladder scoring, document review; note participation counts.

WRITING RULES
- Markdown only. H1 title line first: "# ${opts.companyName} — Agent Readiness Audit". H2 for sections. Short paragraphs, real tables where they help.
- Anonymize ruthlessly: no participant names, no uniquely identifying details. Attribute quotes like "— operations leader" or "— individual contributor" at most.
- Numbers come only from the provided computed statistics; interview counts, averages, and distributions must match them exactly.
- Be direct about gaps between leadership rhetoric and ground truth when the evidence shows one.
- No filler, no hedging boilerplate, no "in today's fast-moving AI landscape" prose. Every sentence earns its place.`;
}

export function buildSynthesisUserMessage(opts: {
  companyName: string;
  snapshot: ReportSnapshot;
  dimensions: Dimension[];
  assessments: {
    segment: string;
    roleTitle: string | null;
    maturityLevel: number | null;
    scores: Record<string, { score: number; rationale: string; evidence: string[] }> | null;
    summary: string | null;
    flags: unknown;
  }[];
  documents: { title: string; text: string }[];
}): string {
  const stats = JSON.stringify(opts.snapshot, null, 1);
  const people = opts.assessments
    .map((a, i) => {
      const scores = a.scores
        ? Object.entries(a.scores)
            .map(
              ([k, s]) =>
                `  - ${k}: ${s.score}/4 — ${s.rationale}${
                  s.evidence?.length ? ` Evidence: ${s.evidence.map((e) => `"${e}"`).join("; ")}` : ""
                }`,
            )
            .join("\n")
        : "  (no scores)";
      return `### Interview ${i + 1} — ${a.segment}${a.roleTitle ? `, ${a.roleTitle}` : ""}
Maturity: ${a.maturityLevel === null ? "n/a" : `L${a.maturityLevel}`}
Dimension scores:
${scores}
Summary: ${a.summary ?? "(none)"}
Flags: ${JSON.stringify(a.flags ?? {})}`;
    })
    .join("\n\n");

  const docs =
    opts.documents.length === 0
      ? "(no documents provided)"
      : opts.documents
          .map((d) => `### ${d.title}\n\n${d.text}`)
          .join("\n\n---\n\n");

  return `COMPUTED STATISTICS (authoritative — use these numbers verbatim)
${stats}

INDIVIDUAL ASSESSMENTS (${opts.assessments.length})
${people}

COMPANY DOCUMENTS
${docs}

Write the complete report for ${opts.companyName} now, following the required structure.`;
}
