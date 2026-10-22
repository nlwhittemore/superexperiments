"use client";

import Link from "next/link";
import { toast } from "sonner";
import { deleteReport } from "@/app/admin/engagements/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Trash2 } from "lucide-react";

export type ReportRow = {
  id: string;
  version: number;
  title: string;
  status: string;
  created_at: string;
  published_at: string | null;
};

function fd(entries: Record<string, string>): FormData {
  const f = new FormData();
  for (const [k, v] of Object.entries(entries)) f.set(k, v);
  return f;
}

export function ReportsSection({
  engagementId,
  reports,
}: {
  engagementId: string;
  reports: ReportRow[];
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Reports</CardTitle>
        <CardDescription>
          Drafts come from analysis runs. Edit, then publish to the client
          portal — only published reports are visible to the client.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Report</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {reports.map((r) => (
              <TableRow key={r.id}>
                <TableCell>
                  <Link
                    href={`/admin/engagements/${engagementId}/reports/${r.id}`}
                    className="font-medium hover:underline"
                  >
                    {r.title}
                  </Link>
                  <p className="text-muted-foreground text-xs">v{r.version}</p>
                </TableCell>
                <TableCell>
                  <Badge variant={r.status === "published" ? "default" : "secondary"}>
                    {r.status}
                  </Badge>
                  {r.published_at && (
                    <span className="text-muted-foreground ml-2 text-xs">
                      {new Date(r.published_at).toLocaleDateString()}
                    </span>
                  )}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {new Date(r.created_at).toLocaleString()}
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-muted-foreground hover:text-destructive size-7"
                    aria-label="Delete report"
                    onClick={async () => {
                      if (!confirm(`Delete "${r.title}"? This can't be undone.`)) return;
                      const res = await deleteReport(
                        fd({ id: r.id, engagement_id: engagementId }),
                      );
                      if (!res.ok) toast.error(res.error ?? "Delete failed.");
                    }}
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {reports.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-muted-foreground h-20 text-center">
                  No reports yet — run the analysis to draft one.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
