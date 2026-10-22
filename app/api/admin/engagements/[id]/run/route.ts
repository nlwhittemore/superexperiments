import { NextResponse, after } from "next/server";
import { getProfile } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase/admin";
import {
  runAnalysis,
  STALE_HEARTBEAT_SECONDS,
} from "@/lib/analysis/run-engine";

export const maxDuration = 800;

async function requireAdminProfile() {
  const profile = await getProfile();
  if (!profile || profile.role !== "admin") return null;
  return profile;
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const profile = await requireAdminProfile();
  if (!profile) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id: engagementId } = await params;
  const body = (await req.json().catch(() => ({}))) as {
    force_reassess?: boolean;
  };

  const db = supabaseAdmin();
  const { data: engagement } = await db
    .from("engagements")
    .select("id")
    .eq("id", engagementId)
    .maybeSingle();
  if (!engagement) {
    return NextResponse.json({ error: "Engagement not found" }, { status: 404 });
  }

  const staleCutoff = new Date(
    Date.now() - STALE_HEARTBEAT_SECONDS * 1000,
  ).toISOString();

  const { data: latest } = await db
    .from("analysis_runs")
    .select("id, status, heartbeat_at")
    .eq("engagement_id", engagementId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  let runId: string | null = null;

  if (latest && (latest.status === "paused" || latest.status === "running")) {
    // Atomic claim: resume a paused run or take over a stale one. The filter
    // re-checks state so two concurrent POSTs cannot both claim it.
    const { data: claimed } = await db
      .from("analysis_runs")
      .update({ status: "running", heartbeat_at: new Date().toISOString() })
      .eq("id", latest.id)
      .or(`status.eq.paused,and(status.eq.running,heartbeat_at.lt.${staleCutoff})`)
      .select("id");
    if (claimed && claimed.length > 0) {
      runId = claimed[0].id;
    } else if (latest.status === "running") {
      return NextResponse.json(
        { error: "A run is already in progress.", run_id: latest.id },
        { status: 409 },
      );
    }
  }

  if (!runId) {
    const { data: created, error } = await db
      .from("analysis_runs")
      .insert({
        engagement_id: engagementId,
        status: "running",
        trigger_source: "manual",
        force_reassess: Boolean(body.force_reassess),
        created_by: profile.id,
        started_at: new Date().toISOString(),
        heartbeat_at: new Date().toISOString(),
      })
      .select("id")
      .single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    runId = created.id as string;
  }

  const claimedRunId = runId!;
  after(async () => {
    await runAnalysis(claimedRunId);
  });

  return NextResponse.json({ run_id: claimedRunId }, { status: 202 });
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const profile = await requireAdminProfile();
  if (!profile) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id: engagementId } = await params;
  const db = supabaseAdmin();

  const [{ data: run }, { data: assessments }, { data: reports }] =
    await Promise.all([
      db
        .from("analysis_runs")
        .select(
          "id, status, phase, force_reassess, stats, error, heartbeat_at, started_at, finished_at, created_at",
        )
        .eq("engagement_id", engagementId)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
      db
        .from("assessments")
        .select(
          "id, status, maturity_level, scores, error, updated_at, interviews!inner(participants!inner(id, name, segment, engagement_id))",
        )
        .eq("interviews.participants.engagement_id", engagementId)
        .order("updated_at", { ascending: false }),
      db
        .from("reports")
        .select("id, version, title, status, created_at, published_at")
        .eq("engagement_id", engagementId)
        .order("created_at", { ascending: false }),
    ]);

  const stale =
    run?.status === "running" &&
    (!run.heartbeat_at ||
      Date.now() - new Date(run.heartbeat_at).getTime() >
        STALE_HEARTBEAT_SECONDS * 1000);

  return NextResponse.json({
    run: run ? { ...run, stale } : null,
    assessments: (assessments ?? []).map((a) => {
      const p = (
        a.interviews as unknown as {
          participants: { id: string; name: string; segment: string };
        }
      ).participants;
      return {
        id: a.id,
        status: a.status,
        maturity_level: a.maturity_level,
        scores: a.scores,
        error: a.error,
        updated_at: a.updated_at,
        participant: { id: p.id, name: p.name, segment: p.segment },
      };
    }),
    reports: reports ?? [],
  });
}
