/** Test helper: dump analysis-related state for the Meridian engagement. */
import { config } from "dotenv";
config({ path: ".env.local" });
import { createClient } from "@supabase/supabase-js";

const ENGAGEMENT_ID = "3b8d2267-e84a-416d-8e55-b268f8e5cf38";

async function main() {
  const db = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

  const { data: participants } = await db
    .from("participants")
    .select("id, name, status, interviews(id, status, coverage, current_question)")
    .eq("engagement_id", ENGAGEMENT_ID)
    .order("created_at");

  console.log("--- participants/interviews ---");
  for (const p of participants ?? []) {
    const iv = p.interviews as unknown as {
      id: string;
      status: string;
      coverage: Record<string, { done?: boolean }>;
      current_question: number;
    } | null;
    const covered = Object.values(iv?.coverage ?? {}).filter((c) => c.done).length;
    console.log(
      `${p.name}: participant=${p.status} interview=${iv?.status ?? "none"} covered=${covered} ivId=${iv?.id ?? "-"}`,
    );
  }

  const { data: assessments } = await db
    .from("assessments")
    .select(
      "id, status, maturity_level, scores, summary, error, model, run_id, updated_at, interviews!inner(participants!inner(name, engagement_id))",
    )
    .eq("interviews.participants.engagement_id", ENGAGEMENT_ID)
    .order("updated_at", { ascending: false });

  console.log("--- assessments ---");
  for (const a of assessments ?? []) {
    const name = (a.interviews as unknown as { participants: { name: string } })
      .participants.name;
    const scores = (a.scores ?? {}) as Record<string, { score: number }>;
    const scoreStr = Object.entries(scores)
      .map(([k, v]) => `${k}=${v.score}`)
      .join(" ");
    console.log(
      `${name}: status=${a.status} L${a.maturity_level ?? "?"} ${scoreStr} model=${a.model ?? "-"} run=${a.run_id ?? "auto"} err=${a.error ?? "-"}`,
    );
    if (a.summary) console.log(`  summary: ${String(a.summary).slice(0, 140)}…`);
  }

  const { data: runs } = await db
    .from("analysis_runs")
    .select("*")
    .eq("engagement_id", ENGAGEMENT_ID)
    .order("created_at", { ascending: false });

  console.log("--- analysis_runs ---");
  for (const r of runs ?? []) {
    console.log(
      `${r.id.slice(0, 8)}: ${r.status} phase=${r.phase} trigger=${r.trigger_source} force=${r.force_reassess} stats=${JSON.stringify(r.stats)} err=${r.error ?? "-"}`,
    );
  }

  const { data: reports } = await db
    .from("reports")
    .select("id, version, title, status, published_at, created_at, snapshot, content")
    .eq("engagement_id", ENGAGEMENT_ID)
    .order("created_at", { ascending: false });

  console.log("--- reports ---");
  for (const r of reports ?? []) {
    console.log(
      `v${r.version} [${r.status}] "${r.title}" id=${r.id} pub=${r.published_at ?? "-"} contentChars=${(r.content ?? "").length}`,
    );
    console.log(`  snapshot: ${JSON.stringify(r.snapshot)?.slice(0, 300)}`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
