import Link from "next/link";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { requireClient } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { SnapshotCharts } from "@/components/portal/snapshot-charts";
import type { ReportSnapshot, TemplateConfig } from "@/lib/types";

export const dynamic = "force-dynamic";

const MATURITY_NAMES: Record<number, string> = {
  0: "Bystander",
  1: "Chat User",
  2: "Power User",
  3: "Agent Operator",
  4: "Agent Manager",
};

export default async function PortalReportPage({
  params,
}: {
  params: Promise<{ reportId: string }>;
}) {
  const profile = await requireClient();
  const { reportId } = await params;
  const db = supabaseAdmin();

  const { data: report } = await db
    .from("reports")
    .select(
      "id, title, content, snapshot, published_at, engagements!inner(company_id, audit_templates(config))",
    )
    .eq("id", reportId)
    .eq("status", "published")
    .maybeSingle();

  const engagement = report?.engagements as unknown as {
    company_id: string;
    audit_templates: { config: TemplateConfig } | null;
  };
  if (!report || engagement.company_id !== profile.company_id) notFound();

  const snapshot = (report.snapshot ?? null) as ReportSnapshot | null;
  const dimensions = (engagement.audit_templates?.config?.dimensions ?? []).map(
    (d) => ({ key: d.key, label: d.label }),
  );
  const headline =
    snapshot?.avg_maturity != null ? Math.round(snapshot.avg_maturity) : null;

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div>
        <Link
          href="/portal"
          className="kicker text-muted-foreground hover:text-foreground transition-colors print:hidden"
        >
          ← Overview
        </Link>
        <h1 className="font-display gradient-text mt-4 text-3xl font-bold tracking-tight text-balance sm:text-4xl">
          {report.title}
        </h1>
        {report.published_at && (
          <p className="text-muted-foreground mt-2 text-sm">
            Published {new Date(report.published_at).toLocaleDateString()}
          </p>
        )}
      </div>

      {snapshot && (
        <>
          <div className="border-border grid border-y sm:grid-cols-3">
            <div className="border-border max-sm:border-b sm:border-r py-5 sm:pr-6">
              <p className="kicker text-muted-foreground">Agentic maturity</p>
              <p className="font-display mt-2 text-3xl font-medium">
                {headline != null ? `L${headline}` : "—"}
                {headline != null && (
                  <span className="text-muted-foreground ml-2 text-base">
                    {MATURITY_NAMES[headline]}
                  </span>
                )}
              </p>
            </div>
            <div className="border-border max-sm:border-b sm:border-r py-5 sm:px-6">
              <p className="kicker text-muted-foreground">Participation</p>
              <p className="font-display mt-2 text-3xl font-medium">
                {snapshot.completed_count}
                <span className="text-muted-foreground text-base">
                  {" "}
                  / {snapshot.participant_count} interviews
                </span>
              </p>
            </div>
            <div className="py-5 sm:pl-6">
              <p className="kicker text-muted-foreground">Average score</p>
              <p className="font-display mt-2 text-3xl font-medium">
                {snapshot.avg_maturity ?? "—"}
                <span className="text-muted-foreground text-base"> / 4</span>
              </p>
            </div>
          </div>
          <SnapshotCharts snapshot={snapshot} dimensions={dimensions} />
        </>
      )}

      <article className="prose prose-invert font-display prose-headings:font-display prose-headings:font-medium prose-headings:tracking-tight prose-a:text-teal prose-blockquote:font-display prose-blockquote:not-italic prose-blockquote:border-teal/40 max-w-none text-[16.5px] leading-[1.75]">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {report.content ?? ""}
        </ReactMarkdown>
      </article>
    </div>
  );
}
