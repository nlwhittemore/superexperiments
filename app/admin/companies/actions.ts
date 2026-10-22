"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { env } from "@/lib/env";

export type ActionResult = { ok: boolean; error?: string; id?: string };

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export async function createCompany(formData: FormData): Promise<ActionResult> {
  await requireAdmin();
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return { ok: false, error: "Name is required." };

  const db = supabaseAdmin();
  let slug = slugify(name) || "company";
  const { data: clash } = await db
    .from("companies")
    .select("id")
    .eq("slug", slug)
    .maybeSingle();
  if (clash) slug = `${slug}-${Date.now().toString(36).slice(-4)}`;

  const { data, error } = await db
    .from("companies")
    .insert({ name, slug })
    .select("id")
    .single();
  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin/companies");
  return { ok: true, id: data.id };
}

export async function inviteClientUser(formData: FormData): Promise<ActionResult> {
  await requireAdmin();
  const companyId = String(formData.get("company_id") ?? "");
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const fullName = String(formData.get("full_name") ?? "").trim();
  if (!companyId || !email) return { ok: false, error: "Email is required." };

  const db = supabaseAdmin();
  const { data: invited, error } = await db.auth.admin.inviteUserByEmail(email, {
    redirectTo: `${env.appUrl()}/login`,
    data: fullName ? { full_name: fullName } : undefined,
  });

  let userId = invited?.user?.id;
  if (error) {
    // Likely already registered — link the existing profile instead.
    const { data: existing } = await db
      .from("profiles")
      .select("id, role")
      .eq("email", email)
      .maybeSingle();
    if (!existing) return { ok: false, error: error.message };
    if (existing.role === "admin") {
      return { ok: false, error: "That email belongs to an admin account." };
    }
    userId = existing.id;
  }
  if (!userId) return { ok: false, error: "Could not resolve the invited user." };

  const { error: profileError } = await db.from("profiles").upsert({
    id: userId,
    email,
    full_name: fullName || null,
    role: "client",
    company_id: companyId,
  });
  if (profileError) return { ok: false, error: profileError.message };

  revalidatePath("/admin/companies");
  return { ok: true };
}
