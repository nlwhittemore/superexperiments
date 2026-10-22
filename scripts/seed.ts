import { loadEnvLocal, adminClient } from "./lib";

loadEnvLocal();
const db = adminClient();
const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

// ---------------------------------------------------------------------------
// Template
// ---------------------------------------------------------------------------

const templateConfig = {
  dimensions: [
    {
      key: "systems",
      label: "Systems",
      description:
        "Whether the tools, integrations, and technical plumbing exist for AI to act inside real workflows rather than beside them.",
    },
    {
      key: "data",
      label: "Data",
      description:
        "Whether the information AI needs is accessible, structured, and permissioned — or trapped behind copy-paste.",
    },
    {
      key: "outcomes",
      label: "Outcomes",
      description:
        "Whether AI use is producing measurable business value, and whether use cases are well chosen and well designed.",
    },
    {
      key: "people",
      label: "People",
      description:
        "Skills, training, confidence, and appetite across the team — including who the internal champions are.",
    },
    {
      key: "governance",
      label: "Governance",
      description:
        "Policy clarity, approval paths, risk posture, and whether the rules accelerate or suppress legitimate use.",
    },
    {
      key: "deployment",
      label: "Deployment",
      description:
        "How far along actual day-to-day usage is on the chatbot-to-agent spectrum.",
    },
  ],
  maturity_levels: [
    {
      level: 0,
      name: "Bystander",
      description: "Little to no hands-on AI use in real work.",
    },
    {
      level: 1,
      name: "Chat User",
      description: "Ad-hoc Q&A, drafting, and summarizing in chatbots.",
    },
    {
      level: 2,
      name: "Power User",
      description:
        "Structured prompting, custom GPTs/Projects, retrieval over own docs, copilots embedded in daily tools.",
    },
    {
      level: 3,
      name: "Agent Operator",
      description:
        "Runs supervised multi-step agents: deep research, coding agents, AI-step workflow automations — with human review.",
    },
    {
      level: 4,
      name: "Agent Manager",
      description:
        "Owns always-on or scheduled agents integrated with company systems, monitors their output, and delegates real work to them.",
    },
  ],
};

const introMessage = `This is a short research conversation about how you actually use AI at work — roughly 15 minutes.

There are no right answers and nothing to prepare. The most useful thing you can do is be candid and specific: real examples beat polished generalities. Rambling is encouraged — tap the mic and talk if that's easier than typing.

Your individual answers go to the Superintelligent research team only. Your company sees aggregated findings, never your transcript.`;

const questions = [
  {
    position: 1,
    dimension: "people",
    prompt:
      "To get us started, tell me about your role — what do you actually spend your time on in a typical week?",
    intent:
      "Establish role context and where time really goes, so later answers can be interpreted against real work.",
    probe_guidance:
      "If they only give a title, ask what their two or three biggest time sinks are. Listen for repetitive, rules-based work and remember it for the delegation question later.",
  },
  {
    position: 2,
    dimension: "deployment",
    prompt:
      "Walk me through how AI shows up in your week right now — which tools, for what tasks, and how often?",
    intent:
      "Inventory of actual tools and usage frequency; distinguish company-sanctioned tools from personal accounts.",
    probe_guidance:
      "Get specific tool names (ChatGPT, Claude, Copilot, Gemini, internal tools). Ask whether the accounts are company-provided or personal. Ask what the most recent thing they used AI for was — recency beats generalities.",
  },
  {
    position: 3,
    dimension: "outcomes",
    prompt:
      "Tell me about the most valuable thing you've gotten done with AI recently. Walk me through it end to end — from when the task showed up to when it was done.",
    intent:
      "Gauge the depth of their best win: single-prompt assist vs multi-step workflow, and whether the value was real (time saved, quality, money).",
    probe_guidance:
      "Ask how long it used to take versus now. Ask how many back-and-forths it took and what they did with the output. If the answer is vague, ask for their second-best example instead.",
  },
  {
    position: 4,
    dimension: "deployment",
    prompt:
      "Have you ever used AI that does multiple steps on its own — things like deep research reports, coding agents, or automations that run without you watching? And what does the word 'agent' actually mean to you?",
    intent:
      "The core discriminator between chatbot use and agentic use. Also calibrates how they personally define 'agent' so their other claims can be interpreted correctly.",
    probe_guidance:
      "Many people call a chatbot an 'agent' — gently test claims: did it take actions in other systems? Did it run unattended? Who reviewed the output? If they're stuck, offer examples: ChatGPT or Claude deep research, Claude Code or Cursor agents, Zapier/n8n/Make automations with AI steps, scheduled agents.",
  },
  {
    position: 5,
    dimension: "data",
    prompt:
      "Think about the information you need to do your job — where does it live, and can your AI tools actually reach it today, or are you copy-pasting things in?",
    intent:
      "Ground-truth data and systems readiness: which systems hold the work, and whether AI is connected to them or air-gapped.",
    probe_guidance:
      "Get the system names (CRM, ERP, shared drives, wiki, ticketing). Ask whether any AI tool is connected directly (integrations, MCP, plugins) versus manual copy-paste. Ask what they would connect first if they could.",
  },
  {
    position: 6,
    dimension: "systems",
    prompt:
      "Is there something you tried to automate or hand off to AI that just didn't work? What got in the way?",
    intent:
      "Failure modes reveal the binding constraint: access, data quality, trust, skills, approvals, or tooling.",
    probe_guidance:
      "Classify the blocker out loud and confirm it with them: was it a permissions/access problem, a quality/trust problem, a skills problem, or a 'not allowed' problem? Ask whether they gave up or found a workaround.",
  },
  {
    position: 7,
    dimension: "people",
    prompt:
      "What kind of AI training or support have you actually received here — and what would genuinely help you level up?",
    intent:
      "The gap between provided enablement and needed enablement, plus appetite for learning.",
    probe_guidance:
      "Distinguish one-off webinars from hands-on enablement. Ask whether they learn from colleagues and who the local 'AI person' is — that's champion discovery.",
  },
  {
    position: 8,
    dimension: "governance",
    prompt:
      "Do you have a clear picture of what you're allowed to do with AI at work? If you found a great agent use case tomorrow, what would you do to get it approved?",
    intent:
      "Governance clarity and the real approval path. Detect shadow AI driven by unclear policy.",
    probe_guidance:
      "Ask if there's a written policy they've actually seen. Ask if they know anyone who has gotten a use case approved and how long it took. If they say they'd 'just do it,' note the shadow-AI signal without judgment.",
  },
  {
    position: 9,
    dimension: "outcomes",
    prompt:
      "Imagine you got a capable AI agent as an intern for a month — it can read your systems, follow instructions, and do real multi-step work. What would you hand it first?",
    intent:
      "Use-case generation from the people closest to the work; tests whether they can decompose their own workflows into delegable units.",
    probe_guidance:
      "Push for specificity: what inputs would it need, what would 'done' look like, how would they check its work? The quality of this answer is itself a signal of process maturity.",
  },
  {
    position: 10,
    dimension: "governance",
    prompt:
      "Last one: when leadership here talks about AI agents, does it feel like a real priority with resources behind it, or more of a buzzword? And is there anything important we haven't covered?",
    intent:
      "Leadership signal and resourcing reality, plus an open catch-all for anything the script missed.",
    probe_guidance:
      "Ask what leadership has actually done (budget, time, tools, goals) versus said. Then thank them and invite anything else on their mind.",
  },
];

// ---------------------------------------------------------------------------
// Reference material 1: scoring rubric
// ---------------------------------------------------------------------------

const rubric = `# Agentic Readiness Scoring Rubric

How to use this rubric: score each interview on (a) one overall **Agentic Maturity Level** (L0–L4) and (b) each of the six dimensions from 0–4. Scores must be anchored in things the participant actually said. Every score needs at least one piece of quoted or closely paraphrased evidence. When evidence is thin, score conservatively and say so in the rationale.

## Agentic Maturity Ladder (overall level)

- **L0 — Bystander.** No meaningful hands-on use. Evidence: can't name a recent concrete use; talks only in hypotheticals; "I haven't really gotten into it."
- **L1 — Chat User.** Ad-hoc chatbot sessions: drafting, summarizing, Q&A. Evidence: names a chatbot and recent single-prompt tasks; everything flows through copy-paste; no reusable setups.
- **L2 — Power User.** Deliberate, structured use. Evidence: custom GPTs/Claude Projects, saved prompt patterns, retrieval over their own documents, copilots inside daily tools (IDE, CRM, docs), multi-turn working sessions that produce finished artifacts.
- **L3 — Agent Operator.** Supervised multi-step autonomy. Evidence: deep-research runs they review, coding agents executing plans, Zapier/n8n/Make flows with AI steps, computer-use or browsing agents — always with a human checking output before it lands anywhere real.
- **L4 — Agent Manager.** Delegation, not just operation. Evidence: always-on or scheduled agents connected to company systems; the participant describes monitoring, exception handling, and trust calibration ("I check its weekly output for errors") rather than running each task by hand.

**The L1/L3 boundary is the heart of this audit.** A participant who *says* "I use agents all the time" but describes single-prompt chatbot sessions is L1, not L3. Conversely, someone modest who casually mentions an unattended weekly automation with an AI step may be L3+.

## Dimension scoring anchors (0–4 each)

**Systems** — 0: AI fully air-gapped from work systems. 1: browser chatbot beside the work, everything manual. 2: at least one copilot embedded in a core tool. 3: one or more real integrations (API, MCP, plugins) connecting AI to a system of record. 4: multiple systems reachable by AI with appropriate permissions; integration is the norm, not the exception.

**Data** — 0: doesn't know where needed data lives or can't access it. 1: data accessible to the human but only enters AI via copy-paste. 2: some structured sources usable (exports, uploads, retrieval over docs). 3: key sources connected and queryable by AI tools. 4: data is organized, permissioned, and routinely consumed by AI workflows.

**Outcomes** — 0: no claimed value. 1: vague "it saves me time." 2: concrete examples with plausible time/quality gains. 3: quantified, repeatable wins in a core workflow. 4: measurable business outcomes (cycle time, revenue, cost) attributed to AI-assisted or agentic workflows.

**People** — 0: low skill and low appetite. 1: curious but self-taught and tentative. 2: capable self-directed user; learns from peers. 3: skilled, evangelizes locally, helps others. 4: designs workflows and teaches; an obvious champion or de facto internal expert.

**Governance** — 0: no idea what's allowed; visible fear or visible recklessness. 1: assumes rules exist but has never seen them. 2: aware of policy basics; unclear approval path. 3: knows the policy and a real route to get a use case approved. 4: policy is clear, fast, and actually used; participant can cite an approval that happened.

**Deployment** — mirrors the maturity ladder applied to their actual current usage (not aspiration): 0 = none, 1 = chat, 2 = power chat/copilots, 3 = supervised agents, 4 = managed autonomous agents.

## Misclassification traps

1. **"Agent" inflation.** Treat the word as unreliable; score on described behavior: Did it take multiple steps? Did it touch other systems? Did it run unattended? Who reviewed it?
2. **Tool prestige bias.** Using an expensive enterprise tool badly is still L1. Using a free tool in a genuinely agentic loop is L3.
3. **Leader halo.** Leaders often describe the org's aspiration as if it were their personal practice. Score the person on their own usage; capture org claims separately as context.
4. **Demo vs habit.** Something tried once in a demo is not deployment. Look for frequency words: "every week," "whenever a ticket comes in," "each morning."
5. **Shadow AI is signal, not noise.** Personal-account usage indicates appetite (People+) and governance gaps (Governance−) simultaneously — record both.

## Output discipline

- Quote sparingly and anonymously: quotes must not identify the speaker by name or uniquely identifying detail.
- Flag every concrete use-case idea the participant proposed (especially from the agent-intern question) — these feed the recommendations.
- Flag named blockers verbatim where possible; the synthesis stage aggregates them.
- Note training requests and champion signals explicitly.`;

// ---------------------------------------------------------------------------
// Reference material 2: recommendations playbook
// ---------------------------------------------------------------------------

const playbook = `# Recommendations Playbook

How to use this playbook: after scoring all interviews, diagnose the organization's binding constraints and assemble a prioritized recommendation set. Each recommendation must cite the evidence pattern that triggered it. Do not recommend everything — pick the three to five moves that would most change the org's trajectory, then place them on a 30/60/90-day roadmap.

## Recommendation categories and triggers

### 1. Data & Systems Readiness
**Trigger:** Data or Systems dimension averages ≤ 2 while Deployment ambition or People appetite is higher; repeated copy-paste complaints; "AI can't see our data."
**Moves:** inventory the systems participants named, ranked by how often they came up; stand up read-only AI access to the top one or two systems (connectors or MCP servers); create a clean, permissioned document store for the highest-value team; fix the one data-quality issue most cited as a trust-killer.

### 2. Integration & Infrastructure
**Trigger:** individuals at L2–L3 hitting walls (Systems ≤ 2 with Deployment ≥ 2); workaround automations on personal tooling; failed-automation stories ending in "couldn't connect it."
**Moves:** sanctioned automation platform (n8n/Zapier/Make tier with SSO), an internal agent gateway with logging, paved-road templates for the two or three most-requested integrations, an engineering point-of-contact for agent plumbing.

### 3. Training & Enablement
**Trigger:** People ≤ 2 on average, or a wide spread (champions at 4, majority at 1); participants explicitly requesting hands-on help; wins concentrated in a tiny minority.
**Moves:** segment-specific hands-on workshops (leaders get use-case selection; ICs get tool-in-workflow labs — never generic "intro to AI" webinars); pair every team with its discovered champion; a 30-day "first agent" cohort program building one real supervised agent per participant.

### 4. Governance Fast-Track
**Trigger:** Governance ≤ 2; shadow-AI signals; "I don't know what's allowed"; approval paths that are unknown or slower than two weeks.
**Moves:** publish a one-page allowed/not-allowed policy (plain language, examples); create a 5-business-day use-case approval lane with a named owner; amnesty + registration for existing shadow workflows; risk-tier use cases so low-risk ones are pre-approved.

### 5. Use Case Design & Pilot Portfolio
**Trigger:** strong agent-intern answers going nowhere; Outcomes ≤ 2 despite decent skills; scattered individual wins with no organizational capture.
**Moves:** harvest the use-case ideas from these interviews into a ranked backlog (impact × feasibility × data readiness); select two or three pilot agentic workflows with named owners and success metrics; design pilots for the supervised-autonomy pattern first (L3) rather than jumping to full autonomy.

### 6. Operating Model & Champions
**Trigger:** champion signals present but unrecognized; leadership rhetoric outpacing resourcing ("buzzword" answers on the leadership question); wins not propagating between teams.
**Moves:** name and resource the champions formally (time allocation, not just a Slack channel); a monthly internal demo forum where real workflows are shown; an executive sponsor with a stated agentic goal and budget; track and publish a simple maturity metric per team each quarter.

## Roadmap discipline

- **30 days:** clarity moves — policy one-pager, champion identification, use-case backlog, quick copy-paste-killer integrations.
- **60 days:** capability moves — training cohorts, first sanctioned integrations live, pilot agents running supervised.
- **90 days:** scale moves — pilot results reviewed against metrics, second-wave integrations, operating cadence (demo forum, maturity tracking) institutionalized.

## Writing rules for the report

- Recommendations must trace to evidence: name the pattern ("7 of 12 participants described copy-pasting CRM data"), never invent statistics.
- Anonymize all quotes; never attribute to a named individual or uniquely identifiable role.
- Be direct about the gap between leadership rhetoric and ground truth when the data shows one — that contrast is often the most valuable finding.
- Keep the executive summary readable by a CEO in two minutes: current level, target level, the three moves that matter, expected payoff.`;

// ---------------------------------------------------------------------------
// Seed
// ---------------------------------------------------------------------------

async function main() {
  const { data: existing } = await db
    .from("audit_templates")
    .select("id")
    .eq("name", "Agentic Readiness Audit (Mini)")
    .maybeSingle();
  if (existing) {
    console.log("Seed already applied (template exists). Nothing to do.");
    return;
  }

  const { data: template, error: tplErr } = await db
    .from("audit_templates")
    .insert({
      name: "Agentic Readiness Audit (Mini)",
      description:
        "Discovers how far employees and leaders actually are on the chatbot-to-agent spectrum, scores the six Superintelligent dimensions, and feeds recommendations for leveling up.",
      intro_message: introMessage,
      status: "active",
      config: templateConfig,
    })
    .select("id")
    .single();
  if (tplErr) throw tplErr;

  const { error: qErr } = await db
    .from("questions")
    .insert(questions.map((q) => ({ ...q, template_id: template.id })));
  if (qErr) throw qErr;

  const { error: refErr } = await db.from("reference_materials").insert([
    {
      template_id: template.id,
      kind: "rubric",
      title: "Agentic Readiness Scoring Rubric",
      content: rubric,
      position: 1,
    },
    {
      template_id: template.id,
      kind: "playbook",
      title: "Recommendations Playbook",
      content: playbook,
      position: 2,
    },
  ]);
  if (refErr) throw refErr;

  const { data: company, error: coErr } = await db
    .from("companies")
    .insert({ name: "Meridian Industrial", slug: "meridian-industrial" })
    .select("id")
    .single();
  if (coErr) throw coErr;

  const { data: engagement, error: engErr } = await db
    .from("engagements")
    .insert({
      company_id: company.id,
      template_id: template.id,
      status: "active",
      auto_assess: true,
      notes: "Demo engagement created by seed script.",
    })
    .select("id")
    .single();
  if (engErr) throw engErr;

  const { data: participants, error: pErr } = await db
    .from("participants")
    .insert([
      {
        engagement_id: engagement.id,
        name: "Dana Reyes",
        email: "dana@example.com",
        role_title: "VP Operations",
        segment: "leader",
      },
      {
        engagement_id: engagement.id,
        name: "Marcus Chen",
        email: "marcus@example.com",
        role_title: "Senior Analyst",
        segment: "ic",
      },
      {
        engagement_id: engagement.id,
        name: "Priya Sharma",
        email: "priya@example.com",
        role_title: "Customer Success Manager",
        segment: "ic",
      },
    ])
    .select("name, token");
  if (pErr) throw pErr;

  console.log("Seeded: template, 10 questions, rubric, playbook.");
  console.log("Demo company: Meridian Industrial");
  console.log("\nDemo interview links:");
  for (const p of participants ?? []) {
    console.log(`  ${p.name}: ${appUrl}/i/${p.token}`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
