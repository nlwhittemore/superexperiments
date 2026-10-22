import { createClient } from "@supabase/supabase-js";
import { loadEnvLocal } from "./lib";

async function main() {
  loadEnvLocal();
  const [email, password] = process.argv.slice(2);
  if (!email || !password) {
    console.error("Usage: npx tsx scripts/dev-session.ts <email> <password>");
    process.exit(1);
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supa = createClient(url, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    auth: { persistSession: false },
  });
  const { data, error } = await supa.auth.signInWithPassword({ email, password });
  if (error || !data.session) {
    console.error(error?.message ?? "Sign-in failed");
    process.exit(1);
  }

  const ref = new URL(url).hostname.split(".")[0];
  const name = `sb-${ref}-auth-token`;
  const value =
    "base64-" +
    Buffer.from(JSON.stringify(data.session), "utf8").toString("base64url");

  const MAX = 3180;
  if (value.length <= MAX) {
    console.log(`${name}=${value}`);
  } else {
    const parts: string[] = [];
    for (let i = 0; i * MAX < value.length; i++) {
      parts.push(`${name}.${i}=${value.slice(i * MAX, (i + 1) * MAX)}`);
    }
    console.log(parts.join("; "));
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
