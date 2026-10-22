import Link from "next/link";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { NewEngagementButton } from "@/components/admin/new-engagement";
import { TryInterviewButton } from "@/components/admin/try-interview";

export const dynamic = "force-dynamic";

const statusVariant = {
  setup: "secondary",
  active: "default",
  analyzing: "secondary",
  delivered: "outline",
  archived: "outline",
} as const;

export default async function AdminDashboard() {
  const db = supabaseAdmin();
  const [{ data: engagements }, { data: companies }, { data: templates }, { data: runs }] =
    await Promise.all([
      db
        .from("engagements")
        .select(
          "id, status, created_at, companies(name), audit_templates(name), participants(status)",
        )
        .order("created_at", { ascending: false }),
      db.from("companies").select("id, name").order("name"),
      db.from("audit_templates").select("id, name, status").order("name"),
      db
        .from("analysis_runs")
        .select("engagement_id, status, created_at")
        .order("created_at", { ascending: false }),
    ]);

  const activeTemplate = (templates ?? []).find((t) => t.status === "active");

  const latestRun = new Map<string, string>();
  for (const r of runs ?? []) {
    if (!latestRun.has(r.engagement_id)) latestRun.set(r.engagement_id, r.status);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight">Engagements</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Every audit engagement across clients.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {activeTemplate && <TryInterviewButton templateId={activeTemplate.id} />}
          <NewEngagementButton
            companies={companies ?? []}
            templates={templates ?? []}
          />
        </div>
      </div>

      <div className="rounded-xl border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Company</TableHead>
              <TableHead>Template</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Interviews</TableHead>
              <TableHead>Last run</TableHead>
              <TableHead className="text-right">Created</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(engagements ?? []).map((e) => {
              const participants =
                (e.participants as unknown as { status: string }[]) ?? [];
              const done = participants.filter(
                (p) => p.status === "completed",
              ).length;
              const company = (e.companies as unknown as { name: string })?.name;
              const template = (e.audit_templates as unknown as { name: string })
                ?.name;
              const run = latestRun.get(e.id);
              return (
                <TableRow key={e.id}>
                  <TableCell>
                    <Link
                      href={`/admin/engagements/${e.id}`}
                      className="font-medium hover:underline"
                    >
                      {company}
                    </Link>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {template}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        statusVariant[e.status as keyof typeof statusVariant] ??
                        "secondary"
                      }
                    >
                      {e.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground tabular-nums">
                    {done}/{participants.length} complete
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {run ?? "—"}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-right">
                    {new Date(e.created_at).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              );
            })}
            {(engagements ?? []).length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-muted-foreground h-24 text-center">
                  No engagements yet.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
