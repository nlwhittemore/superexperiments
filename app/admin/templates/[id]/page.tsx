import Link from "next/link";
import { notFound } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase/admin";
import type { TemplateConfig } from "@/lib/types";
import {
  TemplateEditor,
  type MaterialRow,
  type TemplateRow,
} from "@/components/admin/template-editor";

export const dynamic = "force-dynamic";

export default async function TemplateEditorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const db = supabaseAdmin();

  const [{ data: template }, { data: questions }, { data: materials }] =
    await Promise.all([
      db
        .from("audit_templates")
        .select("id, name, description, intro_message, status, config")
        .eq("id", id)
        .maybeSingle(),
      db
        .from("questions")
        .select("id, template_id, position, prompt, intent, probe_guidance, dimension")
        .eq("template_id", id)
        .order("position", { ascending: true }),
      db
        .from("reference_materials")
        .select("id, kind, title, content")
        .eq("template_id", id)
        .order("position", { ascending: true }),
    ]);

  if (!template) notFound();
  const config = (template.config ?? {}) as TemplateConfig;

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/admin/templates"
          className="kicker text-muted-foreground hover:text-foreground transition-colors"
        >
          ← Templates
        </Link>
        <h1 className="font-display mt-3 text-2xl font-bold tracking-tight">
          {template.name}
        </h1>
      </div>
      <TemplateEditor
        template={template as TemplateRow}
        questions={questions ?? []}
        materials={(materials ?? []) as MaterialRow[]}
        dimensions={config.dimensions ?? []}
        maturityLevels={config.maturity_levels ?? []}
      />
    </div>
  );
}
