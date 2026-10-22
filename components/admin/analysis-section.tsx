"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
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
import { Loader2, Play } from "lucide-react";

type RunInfo = {
  id: string;
  status: string;
  phase: string;
  stats: {
    total?: number;
    assessed?: number;
    skipped?: number;
    errors?: number;
    report_id?: string;
  };
  error: string | null;
  stale: boolean;
  finished_at: string | null;
};

type AssessmentInfo = {
  id: string;
  status: string;
  maturity_level: number | null;
  scores: Record<string, { score: number }> | null;
  error: string | null;
  participant: { id: string; name: string; segment: string };
};

const runBadge = {
  running: "default",
  completed: "outline",
  paused: "secondary",
  failed: "destructive",
  pending: "secondary",
} as const;

export function AnalysisSection({
  engagementId,
  dimensions,
  completedInterviews,
}: {
  engagementId: string;
  dimensions: { key: string; label: string }[];
  completedInterviews: number;
}) {
  const [run, setRun] = useState<RunInfo | null>(null);
  const [assessments, setAssessments] = useState<AssessmentInfo[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [starting, setStarting] = useState(false);
  const [force, setForce] = useState(false);
  const lastResumeRef = useRef(0);

  const refresh = useCallback(async () => {
    const res = await fetch(`/api/admin/engagements/${engagementId}/run`, {
      cache: "no-store",
    });
    if (!res.ok) return;
    const data = await res.json();
    setRun(data.run);
    setAssessments(data.assessments ?? []);
    setLoaded(true);
  }, [engagementId]);

  const start = useCallback(
    async (forceReassess: boolean) => {
      setStarting(true);
      const res = await fetch(`/api/admin/engagements/${engagementId}/run`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ force_reassess: forceReassess }),
      });
      setStarting(false);
      const data = await res.json().catch(() => ({}));
      if (res.status === 202) {
        toast.success("Analysis run started.");
        refresh();
      } else if (res.status === 409) {
        toast.info("A run is already in progress.");
      } else {
        toast.error(data.error ?? "Could not start the run.");
      }
    },
    [engagementId, refresh],
  );

  useEffect(() => {
    refresh();
  }, [refresh]);

  const active = run?.status === "running" || run?.status === "paused";

  useEffect(() => {
    if (!active) return;
    const t = setInterval(refresh, 3000);
    return () => clearInterval(t);
  }, [active, refresh]);

  // Serverless time limits park long runs as 'paused'; stale heartbeats mean
  // the worker died. Both are resumable with another POST — do it automatically,
  // at most once per 15s so a hard failure can't loop.
  useEffect(() => {
    if (!run) return;
    const resumable = run.status === "paused" || (run.status === "running" && run.stale);
    if (!resumable) return;
    if (Date.now() - lastResumeRef.current < 15_000) return;
    lastResumeRef.current = Date.now();
    start(false);
  }, [run, start]);

  const stats = run?.stats ?? {};
  const done = (stats.assessed ?? 0) + (stats.skipped ?? 0) + (stats.errors ?? 0);

  return (
    <Card>
      <CardHeader className="flex-row items-start justify-between space-y-0">
        <div>
          <CardTitle>Analysis</CardTitle>
          <CardDescription>
            Scores every completed interview, then drafts the report.
          </CardDescription>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Switch id="force-reassess" checked={force} onCheckedChange={setForce} />
            <Label htmlFor="force-reassess" className="text-muted-foreground text-xs">
              Re-assess all
            </Label>
          </div>
          <Button
            onClick={() => start(force)}
            disabled={starting || run?.status === "running" || completedInterviews === 0}
          >
            {run?.status === "running" ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <Play className="size-3.5" />
            )}
            {run?.status === "running" ? "Running…" : "Run analysis"}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {completedInterviews === 0 && (
          <p className="text-muted-foreground text-sm">
            No completed interviews yet — analysis unlocks once at least one
            participant finishes.
          </p>
        )}

        {run && (
          <div className="bg-muted/40 flex flex-wrap items-center gap-x-4 gap-y-1 rounded-lg border px-3 py-2 text-sm">
            <Badge variant={runBadge[run.status as keyof typeof runBadge] ?? "secondary"}>
              {run.status === "running" && run.stale ? "stalled" : run.status}
            </Badge>
            <span className="text-muted-foreground">
              phase: <span className="text-foreground">{run.phase}</span>
            </span>
            {(stats.total ?? 0) > 0 && (
              <span className="text-muted-foreground tabular-nums">
                {done}/{stats.total} interviews
                {stats.errors ? ` · ${stats.errors} error(s)` : ""}
              </span>
            )}
            {run.status === "running" && run.phase === "synthesize" && (
              <span className="text-muted-foreground">writing report…</span>
            )}
            {run.error && (
              <span className="text-destructive text-xs">{run.error}</span>
            )}
          </div>
        )}

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Participant</TableHead>
              <TableHead>Maturity</TableHead>
              {dimensions.map((d) => (
                <TableHead key={d.key} className="text-center text-xs">
                  {d.label}
                </TableHead>
              ))}
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {assessments.map((a) => (
              <TableRow key={a.id}>
                <TableCell>
                  <Link
                    href={`/admin/engagements/${engagementId}/participants/${a.participant.id}`}
                    className="font-medium hover:underline"
                  >
                    {a.participant.name}
                  </Link>
                  <span className="text-muted-foreground ml-2 text-xs">
                    {a.participant.segment}
                  </span>
                </TableCell>
                <TableCell className="font-medium tabular-nums">
                  {a.maturity_level === null ? "—" : `L${a.maturity_level}`}
                </TableCell>
                {dimensions.map((d) => (
                  <TableCell key={d.key} className="text-center tabular-nums">
                    {a.scores?.[d.key]?.score ?? "—"}
                  </TableCell>
                ))}
                <TableCell>
                  {a.status === "error" ? (
                    <span className="text-destructive text-xs" title={a.error ?? ""}>
                      error
                    </span>
                  ) : (
                    <span className="text-muted-foreground text-xs">{a.status}</span>
                  )}
                </TableCell>
              </TableRow>
            ))}
            {loaded && assessments.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={3 + dimensions.length}
                  className="text-muted-foreground h-20 text-center"
                >
                  No assessments yet — run the analysis.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
