import "server-only";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { assessInterview } from "./assess";
import { synthesizeReport } from "./synthesize";

const CONCURRENCY = 3;
const DEADLINE_MS = 660_000;
export const STALE_HEARTBEAT_SECONDS = 90;

type RunStats = {
  total: number;
  assessed: number;
  skipped: number;
  errors: number;
  report_id?: string;
};

async function updateRun(
  runId: string,
  patch: Record<string, unknown>,
): Promise<void> {
  const db = supabaseAdmin();
  await db
    .from("analysis_runs")
    .update({ ...patch, heartbeat_at: new Date().toISOString() })
    .eq("id", runId);
}

/**
 * Works a claimed run (status must already be 'running'). Deadline-aware:
 * stops claiming new interviews near the serverless time limit and parks the
 * run as 'paused' so a follow-up POST resumes it.
 */
export async function runAnalysis(runId: string): Promise<void> {
  const db = supabaseAdmin();
  const startedAt = Date.now();

  try {
    const { data: run } = await db
      .from("analysis_runs")
      .select("id, engagement_id, status, phase, force_reassess, stats")
      .eq("id", runId)
      .maybeSingle();
    if (!run || run.status !== "running") return;

    const stats: RunStats = {
      total: 0,
      assessed: 0,
      skipped: 0,
      errors: 0,
      ...((run.stats ?? {}) as Partial<RunStats>),
    };

    if (run.phase === "assess") {
      const { data: interviews } = await db
        .from("interviews")
        .select(
          "id, status, participants!inner(engagement_id), assessments(status)",
        )
        .eq("status", "completed")
        .eq("participants.engagement_id", run.engagement_id);

      const force: boolean = run.force_reassess;
      const pending = (interviews ?? []).filter((i) => {
        // interview→assessment is one-to-one (unique FK), so PostgREST embeds an object
        const a = i.assessments as unknown as { status: string } | null;
        if (!a) return true;
        if (force) return true;
        return a.status !== "completed";
      });
      stats.total = (interviews ?? []).length;
      stats.skipped = stats.total - pending.length;
      await updateRun(runId, { stats });

      const queue = pending[Symbol.iterator]();
      let deadlineHit = false;

      const worker = async () => {
        for (;;) {
          if (Date.now() - startedAt > DEADLINE_MS) {
            deadlineHit = true;
            return;
          }
          const next = queue.next();
          if (next.done) return;
          const r = await assessInterview(next.value.id, {
            runId,
            force,
          });
          if (!r.ok) stats.errors++;
          else if (r.skipped) stats.skipped++;
          else stats.assessed++;
          await updateRun(runId, { stats });
        }
      };
      await Promise.all(
        Array.from({ length: Math.min(CONCURRENCY, pending.length || 1) }, worker),
      );

      if (deadlineHit) {
        await updateRun(runId, { status: "paused", stats });
        console.log(`[analysis] run ${runId} paused at deadline (${stats.assessed} assessed)`);
        return;
      }
      await updateRun(runId, { phase: "synthesize", stats });
    }

    const synth = await synthesizeReport({
      engagementId: run.engagement_id,
      runId,
    });
    if (!synth.ok) {
      await updateRun(runId, {
        status: "failed",
        error: synth.error,
        finished_at: new Date().toISOString(),
        stats,
      });
      return;
    }

    stats.report_id = synth.reportId;
    await updateRun(runId, {
      status: "completed",
      phase: "done",
      error: null,
      finished_at: new Date().toISOString(),
      stats,
    });
    console.log(`[analysis] run ${runId} completed — report ${synth.reportId}`);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Run failed.";
    console.error(`[analysis] run ${runId} failed:`, message);
    await updateRun(runId, {
      status: "failed",
      error: message,
      finished_at: new Date().toISOString(),
    });
  }
}
