import Link from "next/link";
import { requireClient } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { UploadDocument } from "@/components/portal/upload-document";
import { FileText } from "lucide-react";

export const dynamic = "force-dynamic";

const statusCopy: Record<string, string> = {
  setup: "Preparing",
  active: "Interviews underway",
  analyzing: "Analysis in progress",
  delivered: "Delivered",
  archived: "Archived",
};

const participantStatusVariant = {
  invited: "outline",
  started: "secondary",
  completed: "default",
} as const;

export default async function PortalPage() {
  const profile = await requireClient();
  const db = supabaseAdmin();

  const { data: engagements } = await db
    .from("engagements")
    .select(
      "id, status, created_at, audit_templates(name), participants(name, segment, status), documents(id, title, file_name, source, created_at), reports(id, title, version, status, published_at)",
    )
    .eq("company_id", profile.company_id)
    .order("created_at", { ascending: false });

  const rows = (engagements ?? []).map((e) => {
    const participants = (e.participants ?? []) as {
      name: string;
      segment: string;
      status: string;
    }[];
    const documents = (
      (e.documents ?? []) as {
        id: string;
        title: string;
        file_name: string;
        source: string;
        created_at: string;
      }[]
    ).sort((a, b) => b.created_at.localeCompare(a.created_at));
    const reports = (
      (e.reports ?? []) as {
        id: string;
        title: string;
        version: number;
        status: string;
        published_at: string | null;
      }[]
    )
      .filter((r) => r.status === "published")
      .sort((a, b) => (b.published_at ?? "").localeCompare(a.published_at ?? ""));
    return {
      id: e.id,
      status: e.status,
      created_at: e.created_at,
      template: (e.audit_templates as unknown as { name: string })?.name,
      participants,
      documents,
      reports,
    };
  });

  if (rows.length === 0) {
    return (
      <div className="py-24 text-center">
        <p className="kicker text-muted-foreground">Welcome</p>
        <h1 className="font-display gradient-text mt-3 text-2xl font-bold tracking-tight">
          Your audit hasn&apos;t started yet
        </h1>
        <p className="text-muted-foreground mt-2 text-sm">
          The Superintelligent team is getting things ready. Check back soon.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {rows.map((e) => {
        const done = e.participants.filter((p) => p.status === "completed").length;
        const pct =
          e.participants.length > 0
            ? Math.round((done / e.participants.length) * 100)
            : 0;
        return (
          <section key={e.id} className="space-y-5">
            <div className="border-border border-b pb-4">
              <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
                <h1 className="font-display text-2xl font-bold tracking-tight">
                  {e.template ?? "Agent Readiness Audit"}
                </h1>
                <span className="kicker text-teal">
                  {statusCopy[e.status] ?? e.status}
                </span>
              </div>
              <p className="text-muted-foreground mt-1 text-sm">
                Started {new Date(e.created_at).toLocaleDateString()}
              </p>
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Interview progress</CardTitle>
                  <CardDescription>
                    {done} of {e.participants.length} interviews complete
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Progress value={pct} />
                  <ul className="space-y-2">
                    {e.participants.map((p, i) => (
                      <li
                        key={i}
                        className="flex items-center justify-between gap-3 text-sm"
                      >
                        <span className="flex items-center gap-2">
                          {p.name}
                          <Badge variant="outline" className="text-[10px]">
                            {p.segment}
                          </Badge>
                        </span>
                        <Badge
                          variant={
                            participantStatusVariant[
                              p.status as keyof typeof participantStatusVariant
                            ] ?? "outline"
                          }
                        >
                          {p.status}
                        </Badge>
                      </li>
                    ))}
                    {e.participants.length === 0 && (
                      <li className="text-muted-foreground text-sm">
                        Participants will appear here once invited.
                      </li>
                    )}
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Reports</CardTitle>
                  <CardDescription>
                    Published findings and recommendations
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {e.reports.length === 0 ? (
                    <p className="text-muted-foreground text-sm">
                      Your report will appear here once the analysis is complete.
                    </p>
                  ) : (
                    <ul className="space-y-2">
                      {e.reports.map((r) => (
                        <li key={r.id}>
                          <Link
                            href={`/portal/reports/${r.id}`}
                            className="hover:bg-muted/60 flex items-center justify-between gap-3 rounded-md border px-3 py-2 text-sm"
                          >
                            <span className="font-medium">{r.title}</span>
                            <span className="text-muted-foreground text-xs">
                              {r.published_at
                                ? new Date(r.published_at).toLocaleDateString()
                                : ""}
                            </span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Documents</CardTitle>
                <CardDescription>
                  Share org charts, tooling inventories, policies — anything that
                  helps us understand how work happens today.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <UploadDocument engagementId={e.id} />
                {e.documents.length > 0 && (
                  <>
                    <Separator />
                    <ul className="space-y-2">
                      {e.documents.map((d) => (
                        <li
                          key={d.id}
                          className="flex items-center justify-between gap-3 text-sm"
                        >
                          <span className="flex min-w-0 items-center gap-2">
                            <FileText className="text-muted-foreground size-3.5 shrink-0" />
                            <span className="truncate">{d.title}</span>
                          </span>
                          <span className="text-muted-foreground flex shrink-0 items-center gap-2 text-xs">
                            {d.source === "client" ? "your team" : "Superintelligent"}
                            <span>·</span>
                            {new Date(d.created_at).toLocaleDateString()}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </>
                )}
              </CardContent>
            </Card>
          </section>
        );
      })}
    </div>
  );
}
