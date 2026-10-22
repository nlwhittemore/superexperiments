# Super-Simplified — Agent Readiness Audit Platform

The Superintelligent (besuper.ai) Agent Readiness Audit as one integrated system:

- **AI interviewer** — a text-chat interview agent (Claude Sonnet) with an integrated **voice button** (OpenAI speech-to-text) so participants can ramble answers out loud. Participants join via tokenized magic links — no accounts.
- **Admin console** — design audit templates (questions, probe guidance, scoring rubrics, playbooks), manage companies/engagements/participants, upload documents, run the analysis pipeline, edit and publish reports.
- **Analysis pipeline** — Claude Opus scores every interview against six dimensions (Systems, Data, Outcomes, People, Governance, Deployment) plus a headline **L0–L4 Agentic Maturity level**, then synthesizes a full recommendations report with org-level stats.
- **Client portal** — company-scoped logins for clients: interview progress, document upload, and published reports with snapshot charts. Clients never see transcripts, individual assessments, or drafts.

## Stack

Next.js 16 (App Router) · React 19 · Tailwind v4 + shadcn/ui · Supabase (Postgres, Auth, Storage) · `@anthropic-ai/sdk` · OpenAI speech-to-text · Recharts · Resend (optional invites).

## Setup

1. **Install**: `npm install`
2. **Env**: copy `.env.example` → `.env.local` and fill in:

   | Var | Purpose |
   |---|---|
   | `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` / `SUPABASE_SERVICE_ROLE_KEY` | Supabase project keys |
   | `ANTHROPIC_API_KEY` | Interview + analysis models |
   | `OPENAI_API_KEY` | Voice transcription (typing works without it) |
   | `ADMIN_EMAILS` | Comma-separated emails allowed to become admins on first login |
   | `RESEND_API_KEY` / `RESEND_FROM` | Optional participant invite emails |
   | `NEXT_PUBLIC_APP_URL` | Base URL used in invite links |
   | `INTERVIEW_MODEL` / `ANALYSIS_MODEL` / `TRANSCRIBE_MODEL` | Optional model overrides |

3. **Database**: run `supabase/migrations/0001_init.sql` against your project (SQL editor, or `npm run db:push` with the Supabase CLI linked). Creates all tables with deny-all RLS (server code uses the service role; see *Security model*) and the private `documents` storage bucket.
4. **Admin user**: `npm run create-admin` (or just sign up via `/login` with an email on `ADMIN_EMAILS` — the profile bootstraps on first login).
5. **Seed audit content**: `npm run seed` — creates the "Agentic Readiness Audit (Mini)" template (10 questions, scoring rubric, recommendations playbook), a demo company, an engagement, and three test participants (their interview links print to the console).
6. `npm run dev` and open http://localhost:3000.

## The flow

1. **Admin** (`/admin`) creates a company + engagement from a template, adds participants, copies magic links (or sends invites via Resend).
2. **Participants** open `/i/<token>` and talk to the interviewer — typing or via the mic button. Progress is tracked per scripted question; interviews resume cleanly on reload.
3. Completed interviews are **auto-assessed** (when `auto_assess` is on). The **Analysis** tab also runs batch assessment + report synthesis on demand — idempotent, resumable, and safe to re-trigger; "Re-assess all" forces fresh scores.
4. The run produces a **draft report** (markdown). Admin edits it in the report editor, then **publishes**.
5. **Clients** (`/portal`, invited from the engagement's Settings) watch progress, upload documents, and read published reports with dimension/maturity charts. Use the browser's print dialog for a PDF — chrome is stripped by print styles.

## Security model

- Every table has deny-all RLS; all reads/writes go through server code (service-role client) behind explicit guards: `requireAdmin()`, `requireClient()` (company-scoped), and token validation for participants.
- Supabase Auth is identity only. Client users are invited via `inviteUserByEmail` and scoped by `profiles.company_id`.
- Portal queries never select tokens, transcripts, drafts, or individual assessments.
- The `documents` bucket is private.

## Scripts

| Command | What it does |
|---|---|
| `npm run seed` | Seed template, rubric/playbook, demo company + participants |
| `npm run create-admin` | Create an admin auth user + profile |
| `npm run reset-participant` | Reset a participant's interview for re-testing |
| `npx tsx scripts/drive-interview.ts <marcus\|dana\|priya>` | Play a scripted persona through a live interview (dev testing) |
| `npx tsx scripts/check-analysis-state.ts` | Dump interview/assessment/run/report state for the demo engagement |

## Architecture notes

```
app/
  i/[token]/                     participant interview (welcome → chat → done)
  api/interview/[token]/messages SSE streaming interview turns (POST)
  api/transcribe                 OpenAI speech-to-text proxy
  api/admin/.../run              batch analysis runs (202 + after(); GET for polling)
  admin/                         console (server actions in app/admin/**/actions.ts)
  portal/                        client portal (company-scoped)
lib/
  interview/                     prompt builder, stream engine, tools (advance/complete)
  analysis/                      assess (Opus, tool-forced JSON), synthesize (streamed
                                 report), run-engine (claiming, concurrency 3, heartbeats,
                                 deadline-aware pause/resume)
  audio/record-wav.ts            MediaRecorder → 16kHz mono WAV for transcription
supabase/migrations/0001_init.sql
scripts/seed.ts                  audit content: 10 questions, rubric, playbook
```

- **Interview engine**: raw Anthropic SDK streaming with tool use; messages stored verbatim (content-block arrays) so replays hit the prompt cache; persistence at message boundaries only.
- **Run engine**: atomic claim via conditional `UPDATE`, heartbeats every item, pauses near the function deadline; the admin UI polls and auto-resumes paused/stale runs. Assessments upsert per interview, so re-runs only fill gaps unless forced.
- **Vercel**: interview route `maxDuration 300`, run route `maxDuration 800` — needs a plan that allows long function durations.
