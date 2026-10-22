-- Super-Simplified: Agent Readiness Audit platform
-- All data access is server-side via the service-role client.
-- RLS is enabled with no policies (deny-all for anon/authenticated keys).

create extension if not exists pgcrypto;

create table companies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  created_at timestamptz not null default now()
);

create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  full_name text,
  role text not null check (role in ('admin', 'client')),
  company_id uuid references companies(id) on delete set null,
  created_at timestamptz not null default now()
);

create table audit_templates (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  intro_message text,
  status text not null default 'draft' check (status in ('draft', 'active', 'archived')),
  config jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table questions (
  id uuid primary key default gen_random_uuid(),
  template_id uuid not null references audit_templates(id) on delete cascade,
  position int not null,
  prompt text not null,
  intent text,
  probe_guidance text,
  dimension text,
  created_at timestamptz not null default now()
);
create index questions_template_idx on questions (template_id, position);

create table reference_materials (
  id uuid primary key default gen_random_uuid(),
  template_id uuid references audit_templates(id) on delete cascade,
  kind text not null check (kind in ('rubric', 'playbook', 'context')),
  title text not null,
  content text not null,
  position int not null default 0,
  updated_at timestamptz not null default now()
);
create index reference_materials_template_idx on reference_materials (template_id, position);

create table engagements (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id) on delete cascade,
  template_id uuid not null references audit_templates(id),
  status text not null default 'setup' check (status in ('setup', 'active', 'analyzing', 'delivered', 'archived')),
  auto_assess boolean not null default true,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index engagements_company_idx on engagements (company_id);

create table documents (
  id uuid primary key default gen_random_uuid(),
  engagement_id uuid not null references engagements(id) on delete cascade,
  title text not null,
  file_name text not null,
  storage_path text not null,
  mime_type text,
  size_bytes bigint,
  source text not null default 'team' check (source in ('team', 'client')),
  uploaded_by uuid references profiles(id) on delete set null,
  extracted_text text,
  extraction_status text not null default 'pending' check (extraction_status in ('pending', 'ready', 'failed')),
  created_at timestamptz not null default now()
);
create index documents_engagement_idx on documents (engagement_id);

create table participants (
  id uuid primary key default gen_random_uuid(),
  engagement_id uuid not null references engagements(id) on delete cascade,
  name text not null,
  email text,
  role_title text,
  segment text not null default 'ic' check (segment in ('leader', 'ic')),
  token uuid not null unique default gen_random_uuid(),
  status text not null default 'invited' check (status in ('invited', 'started', 'completed')),
  invited_at timestamptz,
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now()
);
create index participants_engagement_idx on participants (engagement_id);

create table interviews (
  id uuid primary key default gen_random_uuid(),
  participant_id uuid not null unique references participants(id) on delete cascade,
  status text not null default 'in_progress' check (status in ('in_progress', 'completed')),
  coverage jsonb not null default '{}'::jsonb,
  current_question int not null default 1,
  generating_since timestamptz,
  model text,
  started_at timestamptz not null default now(),
  completed_at timestamptz
);

-- content holds the raw Anthropic content-block array, stored verbatim so
-- conversation replay is byte-identical across turns (required for prompt caching).
-- tool_result blocks live inside user-role messages per the Anthropic API shape.
create table interview_messages (
  id uuid primary key,
  interview_id uuid not null references interviews(id) on delete cascade,
  role text not null check (role in ('user', 'assistant')),
  content jsonb not null,
  hidden boolean not null default false,
  created_at timestamptz not null default now()
);
create index interview_messages_interview_idx on interview_messages (interview_id, created_at);

create table analysis_runs (
  id uuid primary key default gen_random_uuid(),
  engagement_id uuid not null references engagements(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending', 'running', 'paused', 'completed', 'failed')),
  trigger_source text not null default 'manual' check (trigger_source in ('manual', 'auto')),
  phase text not null default 'assess' check (phase in ('assess', 'synthesize', 'done')),
  force_reassess boolean not null default false,
  stats jsonb not null default '{}'::jsonb,
  error text,
  heartbeat_at timestamptz,
  created_by uuid references profiles(id) on delete set null,
  started_at timestamptz,
  finished_at timestamptz,
  created_at timestamptz not null default now()
);
create index analysis_runs_engagement_idx on analysis_runs (engagement_id, created_at desc);

create table assessments (
  id uuid primary key default gen_random_uuid(),
  interview_id uuid not null unique references interviews(id) on delete cascade,
  run_id uuid references analysis_runs(id) on delete set null,
  status text not null default 'pending' check (status in ('pending', 'processing', 'completed', 'error')),
  scores jsonb,
  maturity_level int check (maturity_level between 0 and 4),
  summary text,
  flags jsonb,
  model text,
  error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table reports (
  id uuid primary key default gen_random_uuid(),
  engagement_id uuid not null references engagements(id) on delete cascade,
  run_id uuid references analysis_runs(id) on delete set null,
  version int not null default 1,
  title text not null,
  content text not null,
  snapshot jsonb,
  status text not null default 'draft' check (status in ('draft', 'published')),
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index reports_engagement_idx on reports (engagement_id, created_at desc);

alter table companies enable row level security;
alter table profiles enable row level security;
alter table audit_templates enable row level security;
alter table questions enable row level security;
alter table reference_materials enable row level security;
alter table engagements enable row level security;
alter table documents enable row level security;
alter table participants enable row level security;
alter table interviews enable row level security;
alter table interview_messages enable row level security;
alter table analysis_runs enable row level security;
alter table assessments enable row level security;
alter table reports enable row level security;

insert into storage.buckets (id, name, public)
values ('documents', 'documents', false)
on conflict (id) do nothing;
