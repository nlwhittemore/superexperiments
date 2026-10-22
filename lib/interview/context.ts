import "server-only";
import { supabaseAdmin } from "@/lib/supabase/admin";
import type { Question, TemplateConfig } from "@/lib/types";

export type InterviewContext = {
  participant: {
    id: string;
    name: string;
    role_title: string | null;
    segment: string;
    status: string;
  };
  engagement: {
    id: string;
    status: string;
    auto_assess: boolean;
  };
  company: { name: string };
  template: {
    id: string;
    name: string;
    intro_message: string | null;
    config: TemplateConfig;
  };
  questions: Question[];
};

export async function loadInterviewContext(
  token: string,
): Promise<InterviewContext | null> {
  const db = supabaseAdmin();
  const { data: p } = await db
    .from("participants")
    .select(
      `id, name, role_title, segment, status,
       engagements (
         id, status, auto_assess,
         companies ( name ),
         audit_templates ( id, name, intro_message, config )
       )`,
    )
    .eq("token", token)
    .maybeSingle();

  if (!p || !p.engagements) return null;
  const eng = p.engagements as unknown as {
    id: string;
    status: string;
    auto_assess: boolean;
    companies: { name: string };
    audit_templates: {
      id: string;
      name: string;
      intro_message: string | null;
      config: TemplateConfig;
    };
  };

  const { data: questions } = await db
    .from("questions")
    .select("id, template_id, position, prompt, intent, probe_guidance, dimension")
    .eq("template_id", eng.audit_templates.id)
    .order("position", { ascending: true });

  return {
    participant: {
      id: p.id,
      name: p.name,
      role_title: p.role_title,
      segment: p.segment,
      status: p.status,
    },
    engagement: {
      id: eng.id,
      status: eng.status,
      auto_assess: eng.auto_assess,
    },
    company: { name: eng.companies.name },
    template: eng.audit_templates,
    questions: (questions ?? []) as Question[],
  };
}
