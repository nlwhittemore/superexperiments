import { loadEnvLocal, adminClient } from "./lib";

async function main() {
  loadEnvLocal();
  const [token] = process.argv.slice(2);
  if (!token) {
    console.error("Usage: npm run reset-participant -- <token>");
    process.exit(1);
  }

  const db = adminClient();
  const { data: p } = await db
    .from("participants")
    .select("id, name")
    .eq("token", token)
    .maybeSingle();
  if (!p) {
    console.error("No participant with that token.");
    process.exit(1);
  }

  const { data: interview } = await db
    .from("interviews")
    .select("id")
    .eq("participant_id", p.id)
    .maybeSingle();

  if (interview) {
    await db.from("assessments").delete().eq("interview_id", interview.id);
    await db.from("interview_messages").delete().eq("interview_id", interview.id);
    await db.from("interviews").delete().eq("id", interview.id);
  }
  await db
    .from("participants")
    .update({ status: "invited", started_at: null, completed_at: null })
    .eq("id", p.id);

  console.log(`Reset ${p.name} — link is fresh again.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
