import Link from "next/link";
import { notFound } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { extractText } from "@/lib/interview/engine";
import type {
  AssessmentFlags,
  AssessmentScores,
  Coverage,
  Dimension,
  TemplateConfig,
} from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const dynamic = "force-dynamic";

export default async function ParticipantTranscriptPage({
  params,
}: {
  params: Promise<{ id: string; pid: string }>;
}) {
  const { id, pid } = await params;
  const db = supabaseAdmin();

  const { data: participant } = await db
    .from("participants")
    .select(
      "id, name, email, role_title, segment, status, engagement_id, engagements(template_id, companies(name))",
    )
    .eq("id", pid)
    .eq("engagement_id", id)
    .maybeSingle();

  if (!participant) notFound();

  const engagement = participant.engagements as unknown as {
    template_id: string;
    companies: { name: string };
  };

  const { data: interview } = await db
    .from("interviews")
    .select("id, status, coverage")
    .eq("participant_id", pid)
    .maybeSingle();

  const [{ data: messages }, { data: questions }, { data: template }] =
    await Promise.all([
      interview
        ? db
            .from("interview_messages")
            .select("id, role, content, hidden, created_at")
            .eq("interview_id", interview.id)
            .order("created_at", { ascending: true })
        : Promise.resolve({ data: [] as never[] }),
      db
        .from("questions")
        .select("position, prompt, dimension")
        .eq("template_id", engagement.template_id)
        .order("position", { ascending: true }),
      db
        .from("audit_templates")
        .select("config")
        .eq("id", engagement.template_id)
        .maybeSingle(),
    ]);

  const { data: assessment } = interview
    ? await db
        .from("assessments")
        .select("scores, maturity_level, summary, flags, model, created_at")
        .eq("interview_id", interview.id)
        .maybeSingle()
    : { data: null };

  const transcript = (messages ?? [])
    .filter((m) => !m.hidden)
    .map((m) => ({ id: m.id, role: m.role, text: extractText(m.content) }))
    .filter((m) => m.text.trim().length > 0);

  const coverage = (interview?.coverage ?? {}) as Coverage;
  const dimensions =
    ((template?.config ?? {}) as TemplateConfig).dimensions ?? [];
  const dimLabel = (key: string) =>
    dimensions.find((d: Dimension) => d.key === key)?.label ?? key;

  const scores = (assessment?.scores ?? null) as AssessmentScores | null;
  const flags = (assessment?.flags ?? null) as AssessmentFlags | null;

  return (
    <div className="space-y-6">
      <div>
        <Link
          href={`/admin/engagements/${id}`}
          className="kicker text-muted-foreground hover:text-foreground transition-colors"
        >
          ← {engagement.companies?.name ?? "Engagement"}
        </Link>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <h1 className="font-display text-2xl font-bold tracking-tight">
            {participant.name}
          </h1>
          <Badge variant={participant.status === "completed" ? "default" : "secondary"}>
            {participant.status}
          </Badge>
          <Badge variant="outline" className="text-[10px]">
            {participant.segment}
          </Badge>
        </div>
        <p className="text-muted-foreground mt-1 text-sm">
          {participant.role_title ?? "No role title"}
          {participant.email ? ` · ${participant.email}` : ""}
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <Card>
          <CardHeader>
            <CardTitle>Transcript</CardTitle>
            <CardDescription>
              Full interview conversation — internal only, never shown to the
              client.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {transcript.length === 0 && (
              <p className="text-muted-foreground py-8 text-center text-sm">
                No conversation yet.
              </p>
            )}
            {transcript.map((m) => (
              <div
                key={m.id}
                className={m.role === "user" ? "flex justify-end" : "flex"}
              >
                <div
                  className={
                    m.role === "user"
                      ? "bg-secondary border-border/70 max-w-[85%] rounded-xl rounded-br-sm border px-3.5 py-2 text-sm whitespace-pre-wrap"
                      : "font-display max-w-[92%] text-[15px] leading-relaxed whitespace-pre-wrap"
                  }
                >
                  {m.text}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Coverage</CardTitle>
              <CardDescription>
                What the interviewer recorded per question.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {(questions ?? []).map((q) => {
                const c = coverage[String(q.position)];
                return (
                  <div key={q.position} className="space-y-1">
                    <p className="text-sm leading-snug">
                      <span
                        className={
                          c?.done
                            ? "text-foreground font-medium"
                            : "text-muted-foreground"
                        }
                      >
                        {q.position}. {q.prompt}
                      </span>
                    </p>
                    {c?.takeaway ? (
                      <p className="text-muted-foreground border-l-2 pl-2 text-xs">
                        {c.takeaway}
                      </p>
                    ) : (
                      <p className="text-muted-foreground/60 pl-2 text-xs">
                        {c?.done ? "Covered." : "Not covered yet."}
                      </p>
                    )}
                  </div>
                );
              })}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Assessment</CardTitle>
              <CardDescription>
                {assessment
                  ? `Scored ${new Date(assessment.created_at).toLocaleString()}`
                  : "Runs after the interview completes."}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {!assessment && (
                <p className="text-muted-foreground text-sm">
                  No assessment yet.
                </p>
              )}
              {assessment && (
                <>
                  <div className="flex items-baseline gap-2">
                    <span className="font-display text-3xl">
                      L{assessment.maturity_level}
                    </span>
                    <span className="kicker text-muted-foreground">
                      agentic maturity
                    </span>
                  </div>
                  {scores && (
                    <div className="space-y-2">
                      {Object.entries(scores).map(([key, s]) => (
                        <div key={key}>
                          <div className="flex items-center justify-between text-sm">
                            <span>{dimLabel(key)}</span>
                            <span className="font-medium tabular-nums">
                              {s.score}/4
                            </span>
                          </div>
                          <p className="text-muted-foreground text-xs">
                            {s.rationale}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                  {assessment.summary && (
                    <p className="border-t pt-3 text-sm whitespace-pre-wrap">
                      {assessment.summary}
                    </p>
                  )}
                  {flags?.notable_quotes && flags.notable_quotes.length > 0 && (
                    <div className="space-y-1.5 border-t pt-3">
                      <p className="text-muted-foreground text-xs font-medium uppercase">
                        Notable quotes
                      </p>
                      {flags.notable_quotes.map((q, i) => (
                        <p
                          key={i}
                          className="text-muted-foreground border-l-2 pl-2 text-xs italic"
                        >
                          “{q}”
                        </p>
                      ))}
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
