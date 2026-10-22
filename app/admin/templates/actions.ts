"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase/admin";
import type { Dimension, TemplateConfig } from "@/lib/types";

export type ActionResult = {
  ok: boolean;
  error?: string;
  id?: string;
  url?: string;
};

const DEFAULT_CONFIG: TemplateConfig = {
  dimensions: [
    { key: "systems", label: "Systems", description: "How well current tools, software, and workflows can connect to and support AI agents." },
    { key: "data", label: "Data", description: "Whether the data agents would need is accessible, structured, and permissioned." },
    { key: "outcomes", label: "Outcomes", description: "Whether AI use is tied to measurable business outcomes rather than novelty." },
    { key: "people", label: "People", description: "Skills, training, and champion energy across the team." },
    { key: "governance", label: "Governance", description: "Clarity of policy, approval paths, and risk handling for AI use." },
    { key: "deployment", label: "Deployment", description: "How far actual AI/agent usage has progressed from experiments to production." },
  ],
  maturity_levels: [
    { level: 0, name: "Bystander", description: "No meaningful AI use." },
    { level: 1, name: "Chat User", description: "Ad-hoc Q&A and drafting in chat tools." },
    { level: 2, name: "Power User", description: "Structured prompts, custom GPTs/Projects, copilots inside tools." },
    { level: 3, name: "Agent Operator", description: "Supervised multi-step agents: deep research, coding agents, workflow automations." },
    { level: 4, name: "Agent Manager", description: "Owns always-on agents integrated with company systems, monitors outcomes." },
  ],
};

function err(message: string): ActionResult {
  return { ok: false, error: message };
}

export async function createTemplate(formData: FormData): Promise<ActionResult> {
  await requireAdmin();
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return err("Name is required.");

  const db = supabaseAdmin();
  const { data, error } = await db
    .from("audit_templates")
    .insert({ name, status: "draft", config: DEFAULT_CONFIG })
    .select("id")
    .single();
  if (error) return err(error.message);
  revalidatePath("/admin/templates");
  return { ok: true, id: data.id };
}

export async function updateTemplateMeta(formData: FormData): Promise<ActionResult> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const status = String(formData.get("status") ?? "draft");
  if (!id || !name) return err("Name is required.");
  if (!["draft", "active", "archived"].includes(status)) return err("Bad status.");

  const db = supabaseAdmin();
  const { error } = await db
    .from("audit_templates")
    .update({
      name,
      description: String(formData.get("description") ?? "").trim() || null,
      intro_message: String(formData.get("intro_message") ?? "").trim() || null,
      status,
    })
    .eq("id", id);
  if (error) return err(error.message);
  revalidatePath(`/admin/templates/${id}`);
  revalidatePath("/admin/templates");
  return { ok: true };
}

export async function saveDimensions(formData: FormData): Promise<ActionResult> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  let dims: Dimension[];
  try {
    dims = JSON.parse(String(formData.get("dimensions") ?? "[]"));
  } catch {
    return err("Invalid dimensions payload.");
  }
  const cleaned: Dimension[] = [];
  const seen = new Set<string>();
  for (const d of dims) {
    const key = String(d.key ?? "").trim().toLowerCase().replace(/[^a-z0-9_]+/g, "_");
    const label = String(d.label ?? "").trim();
    if (!key || !label) return err("Every dimension needs a key and a label.");
    if (seen.has(key)) return err(`Duplicate dimension key: ${key}`);
    seen.add(key);
    cleaned.push({ key, label, description: String(d.description ?? "").trim() });
  }
  if (cleaned.length === 0) return err("At least one dimension is required.");

  const db = supabaseAdmin();
  const { data: tpl } = await db
    .from("audit_templates")
    .select("config")
    .eq("id", id)
    .single();
  if (!tpl) return err("Template not found.");

  const { data: used } = await db
    .from("questions")
    .select("dimension")
    .eq("template_id", id);
  const missing = (used ?? [])
    .map((q) => q.dimension)
    .filter((d): d is string => !!d && !seen.has(d));
  if (missing.length > 0) {
    return err(
      `Questions still reference removed dimension(s): ${[...new Set(missing)].join(", ")}. Reassign those questions first.`,
    );
  }

  const config = { ...(tpl.config as TemplateConfig), dimensions: cleaned };
  const { error } = await db
    .from("audit_templates")
    .update({ config })
    .eq("id", id);
  if (error) return err(error.message);
  revalidatePath(`/admin/templates/${id}`);
  return { ok: true };
}

export async function addQuestion(formData: FormData): Promise<ActionResult> {
  await requireAdmin();
  const templateId = String(formData.get("template_id") ?? "");
  const prompt = String(formData.get("prompt") ?? "").trim();
  if (!templateId || !prompt) return err("Question prompt is required.");

  const db = supabaseAdmin();
  const { data: last } = await db
    .from("questions")
    .select("position")
    .eq("template_id", templateId)
    .order("position", { ascending: false })
    .limit(1)
    .maybeSingle();

  const { error } = await db.from("questions").insert({
    template_id: templateId,
    position: (last?.position ?? 0) + 1,
    prompt,
    intent: String(formData.get("intent") ?? "").trim() || null,
    probe_guidance: String(formData.get("probe_guidance") ?? "").trim() || null,
    dimension: String(formData.get("dimension") ?? "").trim() || null,
  });
  if (error) return err(error.message);
  revalidatePath(`/admin/templates/${templateId}`);
  return { ok: true };
}

export async function updateQuestion(formData: FormData): Promise<ActionResult> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const templateId = String(formData.get("template_id") ?? "");
  const prompt = String(formData.get("prompt") ?? "").trim();
  if (!id || !prompt) return err("Question prompt is required.");

  const db = supabaseAdmin();
  const { error } = await db
    .from("questions")
    .update({
      prompt,
      intent: String(formData.get("intent") ?? "").trim() || null,
      probe_guidance: String(formData.get("probe_guidance") ?? "").trim() || null,
      dimension: String(formData.get("dimension") ?? "").trim() || null,
    })
    .eq("id", id);
  if (error) return err(error.message);
  revalidatePath(`/admin/templates/${templateId}`);
  return { ok: true };
}

export async function deleteQuestion(formData: FormData): Promise<ActionResult> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const templateId = String(formData.get("template_id") ?? "");

  const db = supabaseAdmin();
  const { error } = await db.from("questions").delete().eq("id", id);
  if (error) return err(error.message);

  const { data: rest } = await db
    .from("questions")
    .select("id, position")
    .eq("template_id", templateId)
    .order("position", { ascending: true });
  for (let i = 0; i < (rest ?? []).length; i++) {
    if (rest![i].position !== i + 1) {
      await db.from("questions").update({ position: i + 1 }).eq("id", rest![i].id);
    }
  }
  revalidatePath(`/admin/templates/${templateId}`);
  return { ok: true };
}

export async function moveQuestion(formData: FormData): Promise<ActionResult> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const templateId = String(formData.get("template_id") ?? "");
  const direction = String(formData.get("direction") ?? "");

  const db = supabaseAdmin();
  const { data: all } = await db
    .from("questions")
    .select("id, position")
    .eq("template_id", templateId)
    .order("position", { ascending: true });
  const list = all ?? [];
  const idx = list.findIndex((q) => q.id === id);
  const swapWith = direction === "up" ? idx - 1 : idx + 1;
  if (idx === -1 || swapWith < 0 || swapWith >= list.length) return { ok: true };

  const a = list[idx];
  const b = list[swapWith];
  await db.from("questions").update({ position: b.position }).eq("id", a.id);
  await db.from("questions").update({ position: a.position }).eq("id", b.id);
  revalidatePath(`/admin/templates/${templateId}`);
  return { ok: true };
}

export async function saveMaterial(formData: FormData): Promise<ActionResult> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const templateId = String(formData.get("template_id") ?? "");
  const kind = String(formData.get("kind") ?? "context");
  const title = String(formData.get("title") ?? "").trim();
  const content = String(formData.get("content") ?? "").trim();
  if (!title || !content) return err("Title and content are required.");
  if (!["rubric", "playbook", "context"].includes(kind)) return err("Bad kind.");

  const db = supabaseAdmin();
  if (id) {
    const { error } = await db
      .from("reference_materials")
      .update({ kind, title, content })
      .eq("id", id);
    if (error) return err(error.message);
  } else {
    const { data: last } = await db
      .from("reference_materials")
      .select("position")
      .eq("template_id", templateId)
      .order("position", { ascending: false })
      .limit(1)
      .maybeSingle();
    const { error } = await db.from("reference_materials").insert({
      template_id: templateId,
      kind,
      title,
      content,
      position: (last?.position ?? 0) + 1,
    });
    if (error) return err(error.message);
  }
  revalidatePath(`/admin/templates/${templateId}`);
  return { ok: true };
}

export async function deleteMaterial(formData: FormData): Promise<ActionResult> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const templateId = String(formData.get("template_id") ?? "");
  const db = supabaseAdmin();
  const { error } = await db.from("reference_materials").delete().eq("id", id);
  if (error) return err(error.message);
  revalidatePath(`/admin/templates/${templateId}`);
  return { ok: true };
}

export async function createPreviewLink(formData: FormData): Promise<ActionResult> {
  const profile = await requireAdmin();
  const templateId = String(formData.get("template_id") ?? "");
  if (!templateId) return err("Missing template.");

  const db = supabaseAdmin();
  const { data: company } = await db
    .from("companies")
    .upsert({ name: "SI Preview", slug: "si-preview" }, { onConflict: "slug" })
    .select("id")
    .single();
  if (!company) return err("Could not set up preview company.");

  const { data: existing } = await db
    .from("engagements")
    .select("id")
    .eq("company_id", company.id)
    .eq("template_id", templateId)
    .maybeSingle();

  let engagementId = existing?.id;
  if (!engagementId) {
    const { data: eng, error } = await db
      .from("engagements")
      .insert({
        company_id: company.id,
        template_id: templateId,
        status: "active",
        auto_assess: false,
        notes: "Internal template preview — not a client engagement.",
      })
      .select("id")
      .single();
    if (error) return err(error.message);
    engagementId = eng.id;
  }

  const { data: participant, error: pErr } = await db
    .from("participants")
    .insert({
      engagement_id: engagementId,
      name: profile.full_name ?? "Preview Run",
      email: profile.email,
      role_title: "Template preview",
      segment: "ic",
    })
    .select("token")
    .single();
  if (pErr) return err(pErr.message);

  return { ok: true, url: `/i/${participant.token}` };
}
