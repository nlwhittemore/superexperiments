import Link from "next/link";
import { notFound } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { ReportEditor } from "@/components/admin/report-editor";

export const dynamic = "force-dynamic";

export default async function ReportEditorPage({
  params,
}: {
  params: Promise<{ id: string; reportId: string }>;
}) {
  const { id, reportId } = await params;
  const db = supabaseAdmin();

  const { data: report } = await db
    .from("reports")
    .select("id, title, content, status, version, created_at, engagements(companies(name))")
    .eq("id", reportId)
    .eq("engagement_id", id)
    .maybeSingle();
  if (!report) notFound();

  const company = (
    report.engagements as unknown as { companies: { name: string } }
  )?.companies?.name;

  return (
    <div className="space-y-4">
      <div>
        <Link
          href={`/admin/engagements/${id}`}
          className="kicker text-muted-foreground hover:text-foreground transition-colors"
        >
          ← {company ?? "Engagement"}
        </Link>
        <p className="text-muted-foreground mt-2 text-xs">
          v{report.version} · drafted {new Date(report.created_at).toLocaleString()}
        </p>
      </div>
      <ReportEditor
        report={{
          id: report.id,
          title: report.title,
          content: report.content,
          status: report.status,
        }}
        engagementId={id}
      />
    </div>
  );
}
