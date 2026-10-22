/**
 * Test driver: plays a scripted persona through a real interview over the
 * live SSE API. Usage: npx tsx scripts/drive-interview.ts <marcus|dana|priya>
 */
import { randomUUID } from "node:crypto";

const BASE = process.env.BASE_URL ?? "http://localhost:3001";

type Persona = {
  name: string;
  token: string;
  // answers[questionNumber] = [primary, probe elaboration]
  answers: Record<number, string[]>;
};

const DEFLECT =
  "Honestly, that's everything I've got on that one — nothing else comes to mind.";

const personas: Record<string, Persona> = {
  marcus: {
    name: "Marcus Chen",
    token: "f8ee4851-bb41-4988-9eaf-6607b0ad6851",
    answers: {
      1: [
        "I'm a senior process automation engineer here at Meridian. Typical week: about half my time maintaining our plant data pipelines and dashboards, the rest building internal tooling and automations for the ops team. I sit between engineering and operations, so I get pulled into both worlds.",
        "Concretely: Mondays are pipeline health checks and backlog triage, midweek is build time on whatever automation is in flight, Fridays I do office hours where ops folks bring me manual processes they hate.",
      ],
      2: [
        "Daily and heavily. Claude and ChatGPT for code and analysis, GitHub Copilot in VS Code, and I run several n8n workflows that call LLMs as steps. I'd estimate three to four hours of my day involve AI somewhere in the loop.",
        "Mostly API rather than chat windows these days — the n8n workflows call Anthropic with a service key, and I use Claude Code in the terminal for longer coding tasks.",
      ],
      3: [
        "Best recent win: I built an n8n workflow that ingests maintenance work orders overnight, has Claude classify failure modes and draft root-cause summaries, cross-references our parts inventory API, and posts a prioritized digest to the maintenance lead's Teams channel every morning. Saves him about an hour a day. It's genuinely multi-step — six or seven nodes, two LLM calls, and an approval gate before anything posts.",
        "End to end it took me about two weeks of evenings to build and a month of tuning the failure-mode taxonomy. The classification runs about 92% accurate now against the lead's spot checks.",
      ],
      4: [
        "Yes, several things that run multiple steps on their own. The work-order digest I mentioned, a deep-research agent I use for vendor due diligence that browses and compiles a memo, and coding agents — I'll hand Claude Code a refactor and let it run 10-20 minutes unattended. To me an agent is software that takes a goal, plans steps, uses tools, and loops until it's done — with me reviewing the output rather than babysitting every step. A chatbot answers; an agent does.",
        "The supervision model matters: everything I run is checkpoint-supervised. Agents propose, humans approve anything that writes to a system of record. I'm not at the point of letting anything run fully autonomous against SAP.",
      ],
      5: [
        "Plant historian data lives in OSIsoft PI, maintenance in SAP PM, quality in a SQL Server warehouse, and documents are scattered across SharePoint. I can reach the warehouse and SAP through APIs I've wrangled access to, but PI is locked down hard and SharePoint search is hopeless. Call it 20% easy to reach, 60% reachable with effort, 20% effectively walled off.",
        "The warehouse access took a three-week ticket and a VP signature. There's no self-serve data access path — every new integration is a negotiation.",
      ],
      6: [
        "I tried automating shift-handover reports — pulling from PI, the ops log, and the LIMS into a structured summary. It died because PI's security team wouldn't grant a service account, and the ops log turned out to be a shared Excel file with no schema. The blockers were access governance and unstructured legacy data, not the AI part — the AI part worked fine in the prototype.",
        "I still think it's a great use case. If someone gave me a read-only service account and two weeks, it would ship.",
      ],
      7: [
        "Formal training: zero. Everything I know is self-taught from docs, Discord servers, and shipping things. What I'd actually want is less 'prompt engineering 101' and more on evaluation and guardrails — how to test agent workflows before trusting them, and how to monitor them in production. Nobody here teaches that.",
        "I'd also take training aimed at my ops colleagues, honestly — the bottleneck isn't me, it's that I'm the only person who builds, so everything queues behind me.",
      ],
      8: [
        "There's an AI usage policy from last year — essentially 'no confidential data in public tools.' We have enterprise Claude and Copilot licenses which are blanket-approved. But there's no real process for approving a new agent use case; I build things and tell my manager afterward. Approval by forgiveness. It's worked so far but it won't scale past me.",
        "If I wanted formal approval there's no form to fill in, no review board, nothing. The vacuum is the policy.",
      ],
      9: [
        "First delegation: vendor quote comparison. Pure drudgery — parse the PDFs, normalize line items, flag anomalies, draft the comparison memo. An agent could own that end-to-end with one human check at the end. Second would be first-pass incident report drafting from the ops log and sensor data.",
        "The quote comparison alone is probably 15 hours a month across the purchasing team, and the failure mode is benign — a bad comparison gets caught at review.",
      ],
      10: [
        "Leadership says 'agents' in every town hall now, but the budget and the org chart haven't moved. It's priority-as-vocabulary, not priority-as-resourcing. The thing they're missing is the data access problem — none of the agent ambitions work while every system integration needs a three-week ticket and a VP signature. Fix access governance and ten of me appear overnight.",
        "I'd also say they underestimate how much of the value is in boring back-office workflows rather than the flashy customer-facing stuff they put on slides.",
      ],
    },
  },
  dana: {
    name: "Dana Reyes",
    token: "39dd5e0f-a875-47b7-946b-11124f8f9f2a",
    answers: {
      1: [
        "I'm VP of Operations — I own plant performance, the maintenance organization, and supply chain ops. My week is mostly leadership meetings, performance reviews, escalations, and an unreasonable amount of email.",
        "Roughly: a third in standing meetings, a third on escalations and people issues, a third on planning and communication. Very little maker time.",
      ],
      2: [
        "I use ChatGPT most days — drafting announcements, summarizing long reports, prepping talking points for meetings. I also ask it strategy questions to pressure-test my own thinking. Probably 30 to 45 minutes a day all told.",
        "It's all in the chat window, nothing connected to our systems. I copy things in, copy things out.",
      ],
      3: [
        "Recently I had it draft our quarterly ops review narrative from my bullet points — what used to eat an entire evening took twenty minutes. One prompt, then a couple of rounds of 'make it tighter, make it more direct.' The quality was honestly better than my first drafts.",
        "It was a single conversation — paste bullets, get narrative, refine twice. Nothing fancier than that.",
      ],
      4: [
        "I'd say ChatGPT is my agent, honestly — I treat it like a chief of staff I can wake up at midnight. But no, I haven't used anything that runs multiple steps on its own. To me 'agent' means an AI assistant you can talk to that helps you get things done. Is there a more technical definition I should know?",
        "Fair distinction. By that definition, no — I've never used a real agent. Everything I do is me prompting, reading, prompting again.",
      ],
      5: [
        "Our data lives in SAP, the PI historian, and a mountain of SharePoint folders and Excel files. Can AI reach it? I genuinely don't know — I assume not, since I copy-paste everything into ChatGPT manually. That alone tells you something.",
        "If you asked me where the single source of truth for plant KPIs is, the honest answer is 'whichever Excel file the analyst updated most recently.'",
      ],
      6: [
        "I asked my team to automate the weekly KPI rollup last year — it's still manual. The data lives in five systems, nobody owned the integration, and it became an IT ticket that died in the queue. Eight months later an analyst still spends every Friday morning building that deck by hand.",
        "What got in the way wasn't technology, it was ownership. IT said it was a business problem, the business said it was an IT problem.",
      ],
      7: [
        "I did a half-day executive AI briefing that a vendor ran. Useful for vocabulary, useless for practice. What I actually need is someone to sit with me and my direct reports and rebuild two real workflows end to end — not another slideshow about transformation.",
        "My team has had nothing at all. If we're serious, the ops leadership team needs hands-on training before the front line does, or we can't lead it.",
      ],
      8: [
        "Policy says don't put confidential data into public tools — though between us, everyone pastes things in anyway, including people who report to me. Approval for a new use case goes through IT security review, which takes long enough that people mostly just don't ask. So we have shadow usage everywhere and official usage almost nowhere.",
        "I know it's a risk. I've raised it. The fix is approved tools that are actually good, not a stricter policy nobody follows.",
      ],
      9: [
        "I'd hand it my inbox triage and meeting prep first — brief me before every meeting with context pulled from our actual systems, flag the three emails that matter. And if it could draft the weekly ops summary from live data instead of my analyst's Friday mornings, that alone would justify the program.",
        "The meeting prep one is the dream. I walk into eight meetings a day and the prep quality is whatever I could skim in the hallway.",
      ],
      10: [
        "We talk about agents constantly at the leadership level — and I include myself in this. The CEO wants an 'agentic roadmap' by Q3. But honestly, half of us couldn't define an agent precisely until thirty seconds ago when you did. We're sincere but vague. The missing piece is anyone translating the ambition into specific workflows with owners and dates.",
        "What I haven't heard discussed even once: data readiness, governance, or training budget. It's all outcomes talk, no inputs talk.",
      ],
    },
  },
  priya: {
    name: "Priya Sharma",
    token: "7a8de509-0663-4261-a1b5-97636f491dae",
    answers: {
      1: [
        "I'm a quality engineer — I run incoming-material inspections and CAPA investigations, and I keep our ISO documentation current. My week is lab work, batch record review, and audit preparation. A lot of careful reading of paperwork, basically.",
        "Batch record review is the biggest single block — probably two full days a week of reviewing records page by page.",
      ],
      2: [
        "Honestly, barely. I tried ChatGPT a few times for rewording procedures and emails. Maybe once a month now. Most of my work lives in validated systems where I'd never paste anything into an outside tool anyway — that's an audit finding waiting to happen.",
        "I'm not anti-AI, to be clear. There's just almost nowhere in my day where it's both useful and allowed.",
      ],
      3: [
        "The one genuinely useful thing: it rewrote a confusing CAPA closure summary into plain language before an auditor visit. The auditor complimented the clarity. That's it though — one prompt, one answer, two minutes.",
        "There wasn't anything multi-step about it. I pasted a paragraph, it gave me a better paragraph.",
      ],
      4: [
        "No, nothing like that. An agent, to me, is... software that does a task by itself? Like a macro with AI in it? I've never seen one in real life, so I'm guessing. Nobody in quality uses anything like that.",
        "I'd actually be curious to see one demonstrated on a real quality workflow. Curious and nervous in equal measure.",
      ],
      5: [
        "Quality data lives in our LIMS and the eQMS — both validated systems, both locked down hard. AI can't touch them, and frankly if it did without a validation plan, I'd be the one writing the deviation report. The only AI-reachable data I have is my own notes and non-controlled documents.",
        "Even exports are controlled — pulling LIMS data to Excel creates an uncontrolled copy, which our procedures discourage.",
      ],
      6: [
        "I tried using Excel macros plus ChatGPT to summarize trend data from LIMS exports. I gave up — the exports are inconsistent batch to batch, and when I mentioned it to our QA director she said we'd need a validation plan even for a summary tool if it informed any quality decision. The process killed it before the technology got a fair shot.",
        "I don't even disagree with her — that's the right call under our procedures. The problem is there's no fast lane for low-risk tools.",
      ],
      7: [
        "No training at all, ever. I'd absolutely take it if offered — but it would have to be specific to regulated environments. What's allowed, what needs validation, how other GxP companies handle this. Generic 'use AI to write better emails' training would be a waste of my afternoon.",
        "Ideally it would be co-developed with QA so finishing the training also tells you what you're authorized to do. Training without authorization changes nothing here.",
      ],
      8: [
        "In quality, the default answer is no. Anything touching GxP records needs validation and QA sign-off, and there is no defined path for getting an AI use case approved — nobody has ever done it, so there's no precedent, no template, no named approver. The absence of a process is itself the blocker.",
        "If leadership wants quality to participate, someone has to build that approval pathway with regulatory affairs at the table. We can't improvise compliance.",
      ],
      9: [
        "If I trusted it — first-pass batch record review. Flag the anomalies and exceptions, let me verify them. Eighty percent of review time is scanning pages where nothing is wrong. But 'if I trusted it' is carrying a lot of weight in that sentence — it would need a validation package, audit trail, the works.",
        "Second choice: drafting CAPA investigation summaries from the evidence I've already collected. Drafting, not deciding.",
      ],
      10: [
        "Leadership talks about AI like it's already deployed, and it grates on those of us in regulated functions, because nobody has answered the compliance questions. To me it stays a buzzword until someone shows me the validation pathway. What they're missing is us — nobody has asked quality what we'd need to say yes, and we're the function that can actually block all of it.",
        "I don't want to be the department of no. But the way to avoid that is to involve us at design time, not after something's built.",
      ],
    },
  },
};

type TurnResult = {
  text: string;
  events: { event: string; data: Record<string, unknown> }[];
};

async function sendTurn(
  token: string,
  body: Record<string, unknown>,
): Promise<TurnResult> {
  const res = await fetch(`${BASE}/api/interview/${token}/messages`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok || !res.body) {
    const text = await res.text().catch(() => "");
    throw new Error(`HTTP ${res.status}: ${text.slice(0, 300)}`);
  }
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let text = "";
  const events: TurnResult["events"] = [];

  const handleBlock = (block: string) => {
    let event = "message";
    let data = "";
    for (const line of block.split("\n")) {
      if (line.startsWith("event: ")) event = line.slice(7).trim();
      else if (line.startsWith("data: ")) data += line.slice(6);
    }
    if (!data) return;
    let parsed: Record<string, unknown> = {};
    try {
      parsed = JSON.parse(data);
    } catch {
      return;
    }
    if (event === "delta" && typeof parsed.t === "string") text += parsed.t;
    else events.push({ event, data: parsed });
  };

  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    let idx;
    while ((idx = buffer.indexOf("\n\n")) !== -1) {
      handleBlock(buffer.slice(0, idx));
      buffer = buffer.slice(idx + 2);
    }
  }
  if (buffer.trim()) handleBlock(buffer);
  return { text, events };
}

async function main() {
  const key = process.argv[2];
  const persona = personas[key];
  if (!persona) {
    console.error("Usage: tsx scripts/drive-interview.ts <marcus|dana|priya>");
    process.exit(1);
  }

  console.log(`=== Driving interview for ${persona.name} (${key}) ===`);
  let currentQuestion = 1;
  const used: Record<number, number> = {};
  let turn = 0;
  let completed = false;

  let result = await sendTurn(persona.token, { start: true });

  while (turn < 40) {
    turn++;
    for (const e of result.events) {
      if (e.event === "progress") {
        currentQuestion = Number(e.data.current_question) || currentQuestion;
        console.log(
          `    [progress] covered ${e.data.covered}/${e.data.total}, now on Q${currentQuestion}`,
        );
      }
      if (e.event === "complete") completed = true;
      if (e.event === "error") {
        console.error(`    [error]`, e.data);
        process.exit(1);
      }
    }
    console.log(
      `[turn ${turn}] assistant: ${result.text.replace(/\s+/g, " ").slice(0, 110)}…`,
    );
    if (completed) break;

    const bank = persona.answers[currentQuestion] ?? [];
    const idx = used[currentQuestion] ?? 0;
    used[currentQuestion] = idx + 1;
    const answer = bank[idx] ?? DEFLECT;
    console.log(
      `[turn ${turn}] ${persona.name} (Q${currentQuestion}, take ${idx + 1}): ${answer
        .replace(/\s+/g, " ")
        .slice(0, 90)}…`,
    );
    await new Promise((r) => setTimeout(r, 800));
    result = await sendTurn(persona.token, {
      id: randomUUID(),
      text: answer,
    });
  }

  if (!completed) {
    console.error(`!! Interview did not complete within ${turn} turns`);
    process.exit(1);
  }
  console.log(`=== ${persona.name}: interview completed in ${turn} turns ===`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
