"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { extractDocumentText } from "@/lib/extract";
import { sendInviteEmail, emailConfigured } from "@/lib/email";
import { env } from "@/lib/env";

export type ActionResult = {
  ok: boolean;
  error?: string;
  id?: string;
  message?: string;
};

const MAX_UPLOAD_BYTES = 20 * 1024 * 1024;

export async function createEngagement(formData: FormData): Promise<ActionResult> {
  await requireAdmin();
  const companyId = String(formData.get("company_id") ?? "");
  const templateId = String(formData.get("template_id") ?? "");
  if (!companyId || !templateId) {
    return { ok: false, error: "Pick a company and a template." };
  }

  const db = supabaseAdmin();
  const { data, error } = await db
    .from("engagements")
    .insert({ company_id: companyId, template_id: templateId, status: "setup" })
    .select("id")
    .single();
  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin");
  return { ok: true, id: data.id };
}

export async function updateEngagementSettings(
  formData: FormData,
): Promise<ActionResult> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "");
  if (
    !["setup", "active", "analyzing", "delivered", "archived"].includes(status)
  ) {
    return { ok: false, error: "Bad status." };
  }

  const db = supabaseAdmin();
  const { error } = await db
    .from("engagements")
    .update({
      status,
      auto_assess: formData.get("auto_assess") === "on",
      notes: String(formData.get("notes") ?? "").trim() || null,
    })
    .eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePath(`/admin/engagements/${id}`);
  revalidatePath("/admin");
  return { ok: true };
}

export async function addParticipant(formData: FormData): Promise<ActionResult> {
  await requireAdmin();
  const engagementId = String(formData.get("engagement_id") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const segment = String(formData.get("segment") ?? "ic");
  if (!engagementId || !name) return { ok: false, error: "Name is required." };
  if (!["leader", "ic"].includes(segment)) return { ok: false, error: "Bad segment." };

  const db = supabaseAdmin();
  const { error } = await db.from("participants").insert({
    engagement_id: engagementId,
    name,
    email: email || null,
    role_title: String(formData.get("role_title") ?? "").trim() || null,
    segment,
  });
  if (error) return { ok: false, error: error.message };
  revalidatePath(`/admin/engagements/${engagementId}`);
  return { ok: true };
}

export async function bulkAddParticipants(
  formData: FormData,
): Promise<ActionResult> {
  await requireAdmin();
  const engagementId = String(formData.get("engagement_id") ?? "");
  const raw = String(formData.get("list") ?? "");
  if (!engagementId) return { ok: false, error: "Missing engagement." };

  const rows: {
    engagement_id: string;
    name: string;
    email: string | null;
    role_title: string | null;
    segment: string;
  }[] = [];
  const problems: string[] = [];

  for (const [i, lineRaw] of raw.split("\n").entries()) {
    const line = lineRaw.trim();
    if (!line) continue;
    const parts = line.split(",").map((p) => p.trim());
    const [name, email, roleTitle, segmentRaw] = parts;
    if (!name) {
      problems.push(`Line ${i + 1}: missing name.`);
      continue;
    }
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      problems.push(`Line ${i + 1}: "${email}" doesn't look like an email.`);
      continue;
    }
    const segment = (segmentRaw ?? "").toLowerCase().startsWith("lead")
      ? "leader"
      : "ic";
    rows.push({
      engagement_id: engagementId,
      name,
      email: email?.toLowerCase() || null,
      role_title: roleTitle || null,
      segment,
    });
  }

  if (problems.length > 0) {
    return { ok: false, error: problems.join(" ") };
  }
  if (rows.length === 0) {
    return { ok: false, error: "Nothing to add — one participant per line." };
  }

  const db = supabaseAdmin();
  const { error } = await db.from("participants").insert(rows);
  if (error) return { ok: false, error: error.message };
  revalidatePath(`/admin/engagements/${engagementId}`);
  return { ok: true, message: `Added ${rows.length} participant(s).` };
}

export async function deleteParticipant(formData: FormData): Promise<ActionResult> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const engagementId = String(formData.get("engagement_id") ?? "");
  const db = supabaseAdmin();
  const { error } = await db.from("participants").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePath(`/admin/engagements/${engagementId}`);
  return { ok: true };
}

export async function sendInvites(formData: FormData): Promise<ActionResult> {
  await requireAdmin();
  const engagementId = String(formData.get("engagement_id") ?? "");
  if (!emailConfigured()) {
    return {
      ok: false,
      error:
        "Email isn't configured — set RESEND_API_KEY, or copy links manually.",
    };
  }

  const db = supabaseAdmin();
  const { data: rows } = await db
    .from("participants")
    .select(
      "id, name, email, status, token, engagements ( companies ( name ) )",
    )
    .eq("engagement_id", engagementId)
    .eq("status", "invited")
    .not("email", "is", null);

  let sent = 0;
  const failures: string[] = [];
  for (const p of rows ?? []) {
    const companyName =
      (p.engagements as unknown as { companies: { name: string } })?.companies
        ?.name ?? "your company";
    const r = await sendInviteEmail({
      to: p.email!,
      participantName: p.name,
      companyName,
      link: `${env.appUrl()}/i/${p.token}`,
    });
    if (r.ok) sent++;
    else failures.push(`${p.email}: ${r.error}`);
  }

  revalidatePath(`/admin/engagements/${engagementId}`);
  if (failures.length > 0) {
    return {
      ok: sent > 0,
      message: `Sent ${sent}.`,
      error: `Failed: ${failures.join("; ")}`,
    };
  }
  return {
    ok: true,
    message:
      sent === 0 ? "No un-started participants with an email." : `Sent ${sent} invite(s).`,
  };
}

export async function uploadDocument(formData: FormData): Promise<ActionResult> {
  const profile = await requireAdmin();
  const engagementId = String(formData.get("engagement_id") ?? "");
  const file = formData.get("file");
  if (!engagementId || !(file instanceof File) || file.size === 0) {
    return { ok: false, error: "Choose a file to upload." };
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    return { ok: false, error: "File is over 20MB." };
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const db = supabaseAdmin();
  const storagePath = `${engagementId}/${randomUUID()}-${file.name.replace(/[^\w.\-]+/g, "_")}`;

  const { error: storageError } = await db.storage
    .from("documents")
    .upload(storagePath, buffer, {
      contentType: file.type || "application/octet-stream",
    });
  if (storageError) return { ok: false, error: storageError.message };

  let extractedText: string | null = null;
  let extractionStatus = "ready";
  let extractionError: string | null = null;
  try {
    extractedText = await extractDocumentText({
      buffer,
      mimeType: file.type || "",
      fileName: file.name,
    });
  } catch (e) {
    extractionStatus = "failed";
    extractionError = e instanceof Error ? e.message : "Extraction failed.";
  }

  const title = String(formData.get("title") ?? "").trim() || file.name;
  const { error } = await db.from("documents").insert({
    engagement_id: engagementId,
    title,
    file_name: file.name,
    storage_path: storagePath,
    mime_type: file.type || null,
    size_bytes: file.size,
    source: "team",
    uploaded_by: profile.id,
    extracted_text: extractedText,
    extraction_status: extractionStatus,
  });
  if (error) {
    await db.storage.from("documents").remove([storagePath]);
    return { ok: false, error: error.message };
  }

  revalidatePath(`/admin/engagements/${engagementId}`);
  return {
    ok: extractionStatus !== "failed",
    error: extractionError ?? undefined,
    message:
      extractionStatus === "failed"
        ? "Uploaded, but text extraction failed."
        : extractedText
          ? `Uploaded — extracted ${extractedText.length.toLocaleString()} characters.`
          : "Uploaded, but no text could be extracted.",
  };
}

export async function saveReport(formData: FormData): Promise<ActionResult> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const engagementId = String(formData.get("engagement_id") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  const content = String(formData.get("content") ?? "").trim();
  if (!id || !title || !content) {
    return { ok: false, error: "Title and content are required." };
  }

  const db = supabaseAdmin();
  const { error } = await db
    .from("reports")
    .update({ title, content, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePath(`/admin/engagements/${engagementId}`);
  revalidatePath(`/admin/engagements/${engagementId}/reports/${id}`);
  return { ok: true };
}

export async function setReportStatus(formData: FormData): Promise<ActionResult> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const engagementId = String(formData.get("engagement_id") ?? "");
  const status = String(formData.get("status") ?? "");
  if (!["draft", "published"].includes(status)) {
    return { ok: false, error: "Bad status." };
  }

  const db = supabaseAdmin();
  const { error } = await db
    .from("reports")
    .update({
      status,
      published_at: status === "published" ? new Date().toISOString() : null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePath(`/admin/engagements/${engagementId}`);
  revalidatePath(`/admin/engagements/${engagementId}/reports/${id}`);
  return {
    ok: true,
    message:
      status === "published"
        ? "Published — now visible in the client portal."
        : "Unpublished — hidden from the client portal.",
  };
}

export async function deleteReport(formData: FormData): Promise<ActionResult> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const engagementId = String(formData.get("engagement_id") ?? "");
  const db = supabaseAdmin();
  const { error } = await db.from("reports").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePath(`/admin/engagements/${engagementId}`);
  return { ok: true };
}

export async function deleteDocument(formData: FormData): Promise<ActionResult> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const engagementId = String(formData.get("engagement_id") ?? "");

  const db = supabaseAdmin();
  const { data: doc } = await db
    .from("documents")
    .select("storage_path")
    .eq("id", id)
    .maybeSingle();
  if (doc?.storage_path) {
    await db.storage.from("documents").remove([doc.storage_path]);
  }
  const { error } = await db.from("documents").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePath(`/admin/engagements/${engagementId}`);
  return { ok: true };
}
