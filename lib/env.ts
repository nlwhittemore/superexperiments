function req(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing required environment variable: ${name}`);
  return v;
}

export const env = {
  supabaseUrl: () => req("NEXT_PUBLIC_SUPABASE_URL"),
  supabaseAnonKey: () => req("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
  supabaseServiceRoleKey: () => req("SUPABASE_SERVICE_ROLE_KEY"),
  anthropicKey: () => req("ANTHROPIC_API_KEY"),
  openaiKey: () => process.env.OPENAI_API_KEY ?? null,
  transcribeModel: () => process.env.TRANSCRIBE_MODEL ?? "gpt-4o-transcribe",
  resendKey: () => process.env.RESEND_API_KEY ?? null,
  resendFrom: () =>
    process.env.RESEND_FROM ?? "Superintelligent <audit@besuper.ai>",
  adminEmails: () =>
    (process.env.ADMIN_EMAILS ?? "")
      .split(",")
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean),
  appUrl: () => process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
};
