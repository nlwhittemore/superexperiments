import "server-only";
import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { env } from "@/lib/env";

export type Profile = {
  id: string;
  email: string;
  full_name: string | null;
  role: "admin" | "client";
  company_id: string | null;
};

export async function getProfile(): Promise<Profile | null> {
  const supa = await supabaseServer();
  const {
    data: { user },
  } = await supa.auth.getUser();
  if (!user) return null;

  const db = supabaseAdmin();
  const { data: profile } = await db
    .from("profiles")
    .select("id, email, full_name, role, company_id")
    .eq("id", user.id)
    .maybeSingle();
  if (profile) return profile as Profile;

  // Bootstrap: emails on the ADMIN_EMAILS allowlist get an admin profile on first login.
  const email = (user.email ?? "").toLowerCase();
  if (email && env.adminEmails().includes(email)) {
    const { data: created } = await db
      .from("profiles")
      .insert({
        id: user.id,
        email,
        full_name: (user.user_metadata?.full_name as string) ?? null,
        role: "admin",
      })
      .select("id, email, full_name, role, company_id")
      .single();
    return (created as Profile) ?? null;
  }
  return null;
}

export async function requireAdmin(): Promise<Profile> {
  const profile = await getProfile();
  if (!profile || profile.role !== "admin") redirect("/login");
  return profile;
}

export async function requireClient(): Promise<Profile & { company_id: string }> {
  const profile = await getProfile();
  if (!profile || profile.role !== "client" || !profile.company_id) {
    redirect("/login");
  }
  return profile as Profile & { company_id: string };
}
