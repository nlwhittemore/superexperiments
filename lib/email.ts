import "server-only";
import { Resend } from "resend";
import { env } from "@/lib/env";

export function emailConfigured(): boolean {
  return !!env.resendKey();
}

export async function sendInviteEmail(opts: {
  to: string;
  participantName: string;
  companyName: string;
  link: string;
}): Promise<{ ok: boolean; error?: string }> {
  const key = env.resendKey();
  if (!key) return { ok: false, error: "Email isn't configured (RESEND_API_KEY)." };

  const firstName = opts.participantName.split(" ")[0];
  const resend = new Resend(key);
  const { error } = await resend.emails.send({
    from: env.resendFrom(),
    to: opts.to,
    subject: `${opts.companyName} × Superintelligent — a short conversation about how you work with AI`,
    text: `Hi ${firstName},

${opts.companyName} is running an Agent Readiness Audit with Superintelligent, and your perspective is part of it.

It's a short, conversational interview — about 15 minutes, no preparation needed. You can type your answers or just talk using the built-in voice button. Candid and specific beats polished.

Start whenever suits you:
${opts.link}

Your individual answers go to the Superintelligent research team only; ${opts.companyName} sees aggregated findings, never your transcript.

Thanks,
The Superintelligent team`,
  });
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}
