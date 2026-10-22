"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { requireClient } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { extractDocumentText } from "@/lib/extract";

export type PortalActionResult = {
  ok: boolean;
  error?: string;
  message?: string;
};

const MAX_UPLOAD_BYTES = 20 * 1024 * 1024;

export async function uploadClientDocument(
  formData: FormData,
): Promise<PortalActionResult> {
  const profile = await requireClient();
  const engagementId = String(formData.get("engagement_id") ?? "");
  const file = formData.get("file");
  if (!engagementId || !(file instanceof File) || file.size === 0) {
    return { ok: false, error: "Choose a file to upload." };
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    return { ok: false, error: "File is over 20MB." };
  }

  const db = supabaseAdmin();
  const { data: engagement } = await db
    .from("engagements")
    .select("id, company_id")
    .eq("id", engagementId)
    .eq("company_id", profile.company_id)
    .maybeSingle();
  if (!engagement) return { ok: false, error: "Engagement not found." };

  const buffer = Buffer.from(await file.arrayBuffer());
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
    source: "client",
    uploaded_by: profile.id,
    extracted_text: extractedText,
    extraction_status: extractionStatus,
  });
  if (error) {
    await db.storage.from("documents").remove([storagePath]);
    return { ok: false, error: error.message };
  }

  revalidatePath("/portal");
  return {
    ok: extractionStatus !== "failed",
    error: extractionError ?? undefined,
    message:
      extractionStatus === "failed"
        ? "Uploaded, but we couldn't read text from this file."
        : "Uploaded — thank you. The team will see it right away.",
  };
}
