import { loadEnvLocal, adminClient } from "./lib";

async function main() {
  loadEnvLocal();

  const [email, password] = process.argv.slice(2);
  if (!email || !password) {
    console.error("Usage: npm run create-admin -- <email> <password>");
    process.exit(1);
  }

  const allowed = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
  if (!allowed.includes(email.toLowerCase())) {
    console.warn(
      `Note: ${email} is not in ADMIN_EMAILS — adding it there too is recommended.`,
    );
  }

  const db = adminClient();

  const { data: created, error } = await db.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });
  if (error) {
    console.error(`Failed to create auth user: ${error.message}`);
    process.exit(1);
  }

  const { error: profileError } = await db.from("profiles").upsert({
    id: created.user.id,
    email: email.toLowerCase(),
    role: "admin",
  });
  if (profileError) {
    console.error(`Failed to create profile: ${profileError.message}`);
    process.exit(1);
  }

  console.log(`Admin created: ${email}`);
  console.log("Sign in at /login");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
