import Link from "next/link";
import { notFound } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DocumentsSection,
  ParticipantsSection,
  SettingsSection,
  type DocumentRow,
  type ParticipantRow,
} from "@/components/admin/engagement-sections";
import { AnalysisSection } from "@/components/admin/analysis-section";
import { ReportsSection, type ReportRow } from "@/components/admin/reports-section";
import type { TemplateConfig } from "@/lib/types";

export const dynamic = "force-dynamic";

const statusVariant = {
  setup: "secondary",
  active: "default",
  analyzing: "secondary",
  delivered: "outline",
  archived: "outline",
} as const;

export default async function EngagementPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const db = supabaseAdmin();

  const { data: engagement } = await db
    .from("engagements")
    .select(
      "id, status, auto_assess, notes, created_at, template_id, companies(name), audit_templates(name, config)",
    )
    .eq("id", id)
    .maybeSingle();

  if (!engagement) notFound();

  const [
    { data: participants },
    { data: documents },
    { count: questionCount },
    { data: reports },
  ] = await Promise.all([
      db
        .from("participants")
        .select(
          "id, name, email, role_title, segment, status, token, created_at, interviews(coverage)",
        )
        .eq("engagement_id", id)
        .order("created_at", { ascending: true }),
      db
        .from("documents")
        .select(
          "id, title, file_name, size_bytes, source, extraction_status, extracted_text, created_at",
        )
        .eq("engagement_id", id)
        .order("created_at", { ascending: false }),
      db
        .from("questions")
        .select("id", { count: "exact", head: true })
        .eq("template_id", engagement.template_id),
      db
        .from("reports")
        .select("id, version, title, status, created_at, published_at")
        .eq("engagement_id", id)
        .order("created_at", { ascending: false }),
    ]);

  const participantRows: ParticipantRow[] = (participants ?? []).map((p) => {
    // participant→interview is one-to-one (unique FK), so PostgREST embeds an object
    const interview = p.interviews as unknown as {
      coverage: Record<string, { done?: boolean }>;
    } | null;
    const covered = Object.values(interview?.coverage ?? {}).filter(
      (c) => c.done,
    ).length;
    return {
      id: p.id,
      name: p.name,
      email: p.email,
      role_title: p.role_title,
      segment: p.segment,
      status: p.status,
      token: p.token,
      covered,
    };
  });

  const documentRows: DocumentRow[] = (documents ?? []).map((d) => ({
    id: d.id,
    title: d.title,
    file_name: d.file_name,
    size: d.size_bytes ?? 0,
    source: d.source,
    extraction_status: d.extraction_status,
    extracted_chars: d.extracted_text?.length ?? 0,
    created_at: d.created_at,
  }));

  const company = (engagement.companies as unknown as { name: string })?.name;
  const templateRel = engagement.audit_templates as unknown as {
    name: string;
    config: TemplateConfig;
  };
  const template = templateRel?.name;
  const dimensions = (templateRel?.config?.dimensions ?? []).map((d) => ({
    key: d.key,
    label: d.label,
  }));
  const done = participantRows.filter((p) => p.status === "completed").length;

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/admin"
          className="kicker text-muted-foreground hover:text-foreground transition-colors"
        >
          ← Engagements
        </Link>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <h1 className="font-display text-2xl font-bold tracking-tight">{company}</h1>
          <Badge
            variant={
              statusVariant[engagement.status as keyof typeof statusVariant] ??
              "secondary"
            }
          >
            {engagement.status}
          </Badge>
        </div>
        <p className="text-muted-foreground mt-1 text-sm">
          {template} · {done}/{participantRows.length} interviews complete ·
          started {new Date(engagement.created_at).toLocaleDateString()}
        </p>
      </div>

      <Tabs defaultValue="participants">
        <TabsList>
          <TabsTrigger value="participants">Participants</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="analysis">Analysis</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>
        <TabsContent value="participants" className="pt-2">
          <ParticipantsSection
            engagementId={engagement.id}
            participants={participantRows}
            totalQuestions={questionCount ?? 0}
          />
        </TabsContent>
        <TabsContent value="documents" className="pt-2">
          <DocumentsSection
            engagementId={engagement.id}
            documents={documentRows}
          />
        </TabsContent>
        <TabsContent value="analysis" className="pt-2">
          <AnalysisSection
            engagementId={engagement.id}
            dimensions={dimensions}
            completedInterviews={done}
          />
        </TabsContent>
        <TabsContent value="reports" className="pt-2">
          <ReportsSection
            engagementId={engagement.id}
            reports={(reports ?? []) as ReportRow[]}
          />
        </TabsContent>
        <TabsContent value="settings" className="pt-2">
          <SettingsSection
            engagement={{
              id: engagement.id,
              status: engagement.status,
              auto_assess: engagement.auto_assess,
              notes: engagement.notes,
            }}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
