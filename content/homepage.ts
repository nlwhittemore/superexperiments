// Homepage copy for besuper.ai, from "Superintelligent homepage copy and
// content", Draft 1 (Oct 22, 2026). One source for every design direction:
// directions change presentation only, never words.
//
// Markers from the copy doc:
//   placeholder(...)  fact not known yet; the design keeps the slot and shows
//                     it as unfinished instead of inventing content
//   // CHECK:         real content that needs confirming before launch
//   // LEANING:       depends on a decision not yet made

export type Placeholder = { placeholder: string };
export const placeholder = (note: string): Placeholder => ({ placeholder: note });
export const isPlaceholder = (v: unknown): v is Placeholder =>
  typeof v === "object" && v !== null && "placeholder" in v;

export type PlateId =
  | "briefing"
  | "agent-team"
  | "opportunity-map"
  | "eval-report"
  | "shared-folder"
  | "rollout-plan"
  | "step-tracker"
  | "expense-app"
  | "monthly-issue"
  | "team-admin";

export type Link = { label: string; href: string };

// ---------------------------------------------------------------- 1. Nav

export const nav = {
  links: [
    { label: "Programs", href: "#programs" },
    { label: "Free", href: "#free" },
    { label: "Subscription", href: "#subscription" },
    { label: "For teams", href: "#teams" },
  ] satisfies Link[],
  login: { label: "Log in", href: "/login" }, // CHECK: single sign-on ready at launch
  cta: { label: "Find my program", href: "#finder" },
};

// ---------------------------------------------------------------- 2. Hero

// Ranked headline options. Each direction tries a different one so the
// options can be judged in context; option 1 is the copy doc's pick.
export const headlines = [
  "Learn AI by building with it.",
  "AI is already part of your job. Get good at it.",
  "Get good at AI.",
] as const;

export const hero = {
  subhead:
    "Superintelligent is where people and teams learn AI. In every program you build something that works on your real job, from your first agent to a system your whole team shares. Start free, or go all the way. Answer three questions and we'll point you to the right program.",
  primary: { label: "Find my program", href: "#finder" },
  secondary: { label: "See every program", href: "#programs" },
  plate: "briefing" as PlateId,
  caption: "Example build from AI & Agents Professional",
};

// Generated from cohort dates; any start that has passed is hidden.
export const startingSoon: { program: string; date: string | null; label: string }[] = [
  { program: "AI & Agents Professional", date: "2026-11-02", label: "starts Mon, Nov 2" },
  { program: "AI & Agents Advanced", date: "2026-11-09", label: "starts Mon, Nov 9" },
  { program: "AI Champions Bootcamp", date: "2026-11-16", label: "starts Mon, Nov 16" },
  // CHECK: only once Foundations is live
  { program: "AI & Agents Foundations", date: null, label: "start any time" },
];

export function upcomingStarts(today = new Date()) {
  const day = today.toISOString().slice(0, 10);
  return startingSoon.filter((s) => s.date === null || s.date >= day);
}

// ---------------------------------------------------------------- 3. Finder

export const finder = {
  headline: "Find your program in three questions",
  intro:
    "Tell us who you're learning for and where you are. We'll give you one program to start with, and a free way in.",
  questions: [
    {
      id: "who",
      title: "Who are you learning for?",
      options: [
        { id: "me", label: "Just me" },
        { id: "team", label: "My team" },
        { id: "company", label: "My whole company" },
      ],
    },
    {
      id: "usage",
      title: "How much do you use AI today?",
      options: [
        { id: "not-much", label: "Not much yet" },
        { id: "chat", label: "Most days, mostly chat" },
        { id: "build", label: "I build agents or automations" },
      ],
    },
    {
      id: "goal",
      title: "What do you want to leave with?",
      options: [
        { id: "basics", label: "The basics, done properly" },
        { id: "agents", label: "Agents that do real work for me" },
        { id: "team-ai", label: "AI my whole team uses" },
        { id: "plan", label: "A plan and rules for the whole company" },
      ],
    },
  ],
  resultLabel: "Start here",
  startOver: "Start over",
} as const;

// ---------------------------------------------------------------- 4. Builds

export const builds = {
  headline: "Every program ends with something that works",
  intro:
    "You learn on your own work, in the tools you already have, and you keep what you build.",
  plateLabel: "Example build",
  cards: [
    {
      plate: "briefing",
      name: "A morning briefing that writes itself.",
      line: "Pulls your calendar, inbox and priorities into one summary before you start.",
      tag: "AI & Agents Professional, week 3",
      program: "professional",
    },
    {
      plate: "agent-team",
      name: "An agent team with a Chief of Staff.",
      line: "Six specialists for research, strategy, data, your craft, communication and operations, coordinated by one agent.",
      tag: "AI & Agents Professional, week 4",
      program: "professional",
    },
    {
      plate: "opportunity-map",
      name: "A ranked map of where AI should go.",
      line: "Every candidate use case scored on value, feasibility, investment and risk, then sorted into build now, build after governance, learning pilot, scope and plan, or parked.",
      tag: "AI & Agents Advanced, weeks 1 and 2",
      program: "advanced",
    },
    {
      plate: "eval-report",
      name: "An operations agent on live systems.",
      line: "Connected to real mail, chat and calendar, then tested against a golden set with human checkpoints before it runs.",
      tag: "AI & Agents Advanced, weeks 3 and 4",
      program: "advanced",
    },
    {
      plate: "shared-folder",
      name: "One agent a whole team shares.",
      line: "Built on a shared folder of plain files any agent can read, with an honest verdict at the end on whether it works.",
      tag: "The Multiplayer AI Sprint, week 4",
      program: "multiplayer",
    },
    {
      plate: "rollout-plan",
      name: "A team fix, shipped with an eval plan.",
      line: "One real team problem, solved with the tools the company already allows, tested, rolled out and supported.",
      tag: "AI Champions Bootcamp",
      program: "champions",
    },
    {
      plate: "step-tracker",
      name: "Your own agent team, step by step.",
      line: "Twelve steps from a first agent to a coordinated team.",
      tag: "Claw Camp",
      program: "claw-camp",
    },
    {
      plate: "expense-app",
      name: "A small app, shipped.",
      line: "One of 24 hands-on projects, from a reusable skill to an agentic loop.",
      tag: "AI Summer Adventure",
      program: "summer-adventure",
    },
  ] satisfies {
    plate: PlateId;
    name: string;
    line: string;
    tag: string;
    program: string;
  }[],
  // PLACEHOLDER from the copy doc, kept as a note rather than shown.
  todo: "Replace these with real learner builds, with each learner's permission.",
};

// ---------------------------------------------------------------- 5. Programs

export type Program = {
  id: string;
  name: string;
  formerly?: string;
  status?: "live" | "soon"; // LEANING: Foundations launch timing
  line: string;
  description: string | Placeholder;
  descriptionNote?: Placeholder;
  who: string;
  format: string;
  price: string;
  nextStart?: string;
  buttons: [Link, Link];
  plate: PlateId;
  // Facts for the finder result card
  facts: string[];
};

export const programsIntro = {
  headline: "Programs",
  intro:
    "One path from the basics to running agents across a company, and a program for the people who bring AI to their teams. Pick by what you want to build, not by job title.",
  pathTitle: "The AI & Agents path", // CHECK: path, track or core curriculum
  pathIntro: "Three levels. Start at the one that fits and keep going.",
  fullPath: "The full path: all three levels for $2,899", // CHECK: bundle price
  certification:
    "Certification, coming 2027. Each level will have its own certification, and completing a level counts toward it.", // CHECK
  rolesTitle: "Role programs",
  refund: "Full refund through the end of week one on every paid program. No form, no approval.",
};

export const path: Program[] = [
  {
    id: "foundations",
    name: "AI & Agents Foundations",
    status: "live", // LEANING: set to "soon" to show Coming soon + waitlist
    line: "The basics, done properly, in your own time.",
    description:
      "Self-paced, with short videos and 10 to 12 hands-on projects. Start the day you sign up and keep access for life.",
    descriptionNote: placeholder("topic list"),
    who: "People starting out with AI, or who've only used it now and then.",
    format: "Self-paced · start any time · lifetime access", // CHECK: first projects free?
    price: "$199", // CHECK
    buttons: [
      { label: "See Foundations", href: "#programs" },
      { label: "Start now", href: "#programs" },
    ],
    plate: "expense-app",
    facts: ["Self-paced", "start any time", "lifetime access", "$199"],
  },
  {
    id: "professional",
    name: "AI & Agents Professional",
    formerly: "Executive Catch-Up",
    line: "Build a team of AI agents that does real work for you.",
    description:
      "Four weeks, hands-on. You build six specialists (research analyst, strategic advisor, data scientist, a specialist in your own craft, communication expert, operations assistant), a Chief of Staff that runs them, a live dashboard and an automated morning briefing. You keep the method to build more.",
    who: "Anyone who uses AI and wants it to take real work off their plate. No code or technical background.",
    format:
      "4 weeks · about 3 hours a week, self-paced, with optional live sessions, all recorded · works in ChatGPT, Claude, Gemini or Microsoft Copilot",
    price: "$749 per person · company cohorts available",
    nextStart: "Mon, Nov 2 · then Dec 7 and Dec 28",
    buttons: [
      { label: "See Professional", href: "#programs" },
      { label: "Register", href: "#programs" },
    ],
    plate: "agent-team",
    facts: [
      "4 weeks",
      "about 3 hours a week",
      "works in ChatGPT, Claude, Gemini or Copilot",
      "$749",
    ],
  },
  {
    id: "advanced",
    name: "AI & Agents Advanced",
    formerly: "Executive Agent Leadership",
    line: "Build agents on your real systems, and the rules your company runs them by.",
    description:
      "Six weeks for people who will do the building. You build a first agent, then an operations agent wired into live mail, chat and calendar and tested before it runs, then a small fleet. You leave with six frameworks your company can run on, from a security manifesto to the Digital Workforce Management Playbook.",
    who: "AI leads, transformation leads, heads of innovation, executives and individual contributors who build.",
    format:
      "6 weeks plus a prep week · 5 to 7 hours a week · works in Cursor, Claude Code, Codex, GitHub Copilot or Antigravity",
    price: "$2,500 per seat · $7,500 for a team of four · less per seat for 5 or more",
    nextStart: "Mon, Nov 9 · then Jan 4",
    buttons: [
      { label: "See Advanced", href: "#programs" },
      { label: "Register", href: "#programs" },
    ],
    plate: "eval-report",
    facts: ["6 weeks plus a prep week", "5 to 7 hours a week", "Cursor, Claude Code, Codex and more", "$2,500"],
  },
];

export const champions: Program = {
  id: "champions",
  name: "AI Champions Bootcamp",
  line: "Lead AI adoption on your team.",
  description:
    "Six live sessions over three weeks. Each champion takes one real team problem, builds the fix with the tools their company already allows, tests it against an eval plan and gets colleagues using it. You leave with a charter agreed with your manager, a 90-day plan, and the Certified AI Champion credential, earned on proof of work.",
  who: "The person on a team who already uses AI and gets asked how. Not for the people who set company AI rules; that's AI & Agents Advanced.",
  format:
    "6 live sessions over 3 weeks, 2 hours each, all recorded · homework on your own tools · one-on-one coaching",
  price: "$2,500 per seat · $7,500 for three", // CHECK: October proposal differs from live page
  nextStart: "Nov 16 to Dec 2, 2026",
  buttons: [
    { label: "See the Bootcamp", href: "#champions" },
    { label: "Register", href: "#champions" },
  ],
  plate: "rollout-plan",
  facts: ["6 live sessions over 3 weeks", "2 hours each", "starts Nov 16", "$2,500"],
};

// ---------------------------------------------------------------- 6. Free

export type FreeProgram = {
  id: string;
  name: string;
  line: string;
  who?: string;
  format: string;
  status: string | Placeholder;
  href: string; // CHECK: switch to besuper.ai URLs under the single login
  plate?: PlateId;
};

export const free = {
  headline: "Start free",
  intro:
    "These cost nothing and stay open. Most were made with The AI Daily Brief. Take them in any order.",
  button: { label: "See all free programs", href: "#free" },
  contact: "Questions about free programs go to training@besuper.ai.",
  programs: [
    {
      id: "aidb-new-year",
      name: "AIDB New Year",
      line: "Ten weeks, ten AI skills, starting in January.",
      who: "People who want a structured start with AI. Join on your own or as a team.",
      format: "10-week challenge · badges as you go",
      status: placeholder("2027 dates and sign-up"),
      href: "https://aidbnewyear.com",
    },
    {
      id: "summer-adventure",
      name: "AI Summer Adventure",
      line: "24 hands-on projects across three levels, from getting more out of tools you already have to running agentic workflows.",
      who: "Any level. Pick your tier.",
      format:
        "Self-paced · examples: build a reusable skill, grow a personal brain, ship a small app, run an agentic loop",
      status: "Open",
      href: "https://summeradventure.ai",
      plate: "expense-app",
    },
    {
      id: "claw-camp",
      name: "Claw Camp",
      line: "Twelve steps from your first agent to a coordinated agent team.",
      who: "Anyone ready to go past a single prompt and build an actual agent.",
      format: "Self-paced · 12 steps",
      status: "Open",
      href: "https://campclaw.ai",
      plate: "step-tracker",
    },
    {
      id: "agent-os",
      name: "Agent OS",
      line: "Build your own agentic operating system.",
      who: "People who've built an agent and want a full personal setup in Claude Code, Codex or another agentic tool.",
      format: "Self-paced · twelve projects",
      status: "Open",
      href: "https://aidbagentos.ai",
    },
    {
      id: "multiplayer",
      name: "The Multiplayer AI Sprint",
      line: "Four weeks for a team to find, design and ship one agent everyone shares.",
      who: "Teams of about four. Works with at least one or two colleagues.",
      format:
        "4 weeks · start any time · each step works in the site's built-in AI or your company's approved tool",
      status: "Open",
      href: "https://multiplayerai.ai",
      plate: "shared-folder",
    },
    {
      id: "frontier-lab",
      name: "Frontier Lab webinars",
      line: "One technique per live session. Every registrant gets the recording.",
      format:
        "Recent: Build Your Personal AI Benchmark (Oct 1, 2026) · Agentic Loops for Knowledge Workers (Aug 26, 2026)",
      status: placeholder("next session"),
      href: "#free",
    },
  ] satisfies FreeProgram[],
};

// ---------------------------------------------------------------- 7. Subscription (LEANING)

export const subscription = {
  name: "The Superintelligent Subscription",
  headline: "AI changes every month. Keep up by building.",
  copy: "Every month, the new tools, features and techniques worth learning, each with a worksheet, prompts, a problem to solve and a project to build on your own work. For people who finished a program and don't want to fall behind.",
  tiers: [
    {
      name: "Operator",
      price: "$49 a month", // CHECK
      items: [
        // CHECK: name of the monthly drop, which can't be confused with the podcast
        "The Monthly: what changed, what's worth learning, and a lab to build it",
        "The library of past labs, references and Frontier Lab sessions",
        "Member clinic and community",
      ],
    },
    {
      name: "Leader",
      price: "$99 a month", // CHECK
      items: [
        "Everything in Operator",
        "A team version of every lab",
        "The playbook vault",
        "A quarterly session for leaders",
      ],
    },
  ],
  // PLACEHOLDER: Join, or Join the waitlist, depending on launch timing.
  // Current thinking points to early 2027, so the waitlist version is shown.
  button: { label: "Join the waitlist", href: "#subscription" },
  plate: "monthly-issue" as PlateId,
};

// ---------------------------------------------------------------- 8. Route map

export const routeMap = {
  headline: "Or pick by goal",
  intro: "Every route has a free start. Go as far as you need.",
  columns: ["Goal", "Start free", "Learn it properly", "Go further"],
  rows: [
    ["Use AI well every day", "AIDB New Year or AI Summer Adventure", "AI & Agents Foundations", "AI & Agents Professional"],
    ["Build agents that work for me", "Claw Camp or Agent OS", "AI & Agents Professional", "AI & Agents Advanced"],
    ["Get my team using AI", "The Multiplayer AI Sprint", "AI Champions Bootcamp", "Professional for the whole team"],
    ["Lead AI across the company", "The Multiplayer AI Sprint", "AI & Agents Advanced", "Company cohorts, a champion on every team"],
    ["Keep up every month", "Frontier Lab webinars", "Subscription, Operator", "Subscription, Leader"],
  ] as [string, string, string, string][],
};

// ---------------------------------------------------------------- 9. Teams

export const teams = {
  headline: "Train your company on its own work",
  copy: "Your people learn in the AI tools your company already approved, under their own accounts, so your data policy still applies. Nobody has to upload sensitive documents. Every program ends with working agents built on your real processes, not a certificate of attendance.",
  how: [
    { title: "Your own cohort.", body: "Your group starts on one date and learns together." },
    { title: "Seats you control.", body: "Add names, reassign seats and add capacity from a live link." },
    {
      title: "The tools you have.",
      body: "ChatGPT, Claude, Gemini, Copilot, Cursor, Claude Code, Codex, GitHub Copilot or Antigravity. We don't sell you a tool.",
    },
    {
      title: "Buy the way you buy.",
      body: "Quotes, invoices and purchase orders. Card or ACH; orders over $12,000 by ACH, wire or invoice.",
    },
  ],
  whoTakesWhat: [
    ["Everyone getting started", "AI & Agents Foundations"], // LEANING
    ["Everyone who uses AI daily", "AI & Agents Professional"],
    ["One person per team who leads AI", "AI Champions Bootcamp"],
    ["The team that builds and governs your agents", "AI & Agents Advanced"],
    ["Any team trying a shared agent", "The Multiplayer AI Sprint, free"],
  ] as [string, string][],
  note: "Many companies run more than one.",
  buttons: [
    { label: "Get a quote", href: "#teams" },
    { label: "Talk to us", href: "#teams" }, // CHECK: destination
  ] as [Link, Link],
  features: { label: "See team features", href: "#teams" },
  plate: "team-admin" as PlateId,
};

// ---------------------------------------------------------------- 10. Champions

export const championsBand = {
  headline: "Every team needs one person who makes AI work",
  copy: "Champions are the people who already use AI and get asked how. In the AI Champions Bootcamp, each one takes a real team problem, builds the fix with the tools the company allows, proves it works and gets colleagues using it. They leave with a charter agreed with their manager, a 90-day plan, kits for teaching others, and the Certified AI Champion credential, earned on proof of work.", // CHECK: "certified"
  facts: [
    "Next cohort: Nov 16 to Dec 2, 2026",
    "6 live sessions, 2 hours each, all recorded",
    "$2,500 per seat · $7,500 for three", // CHECK
    "Includes a manager pack and an invitation to the final showcase",
    "10% off for Professional (Executive Catch-Up) alumni",
  ],
  buttons: [
    { label: "See the Bootcamp", href: "#champions" },
    { label: "Send three from your team", href: "#champions" },
  ] as [Link, Link],
  plate: "rollout-plan" as PlateId,
};

// ---------------------------------------------------------------- 11. How Super teaches

export const method = {
  headline: "How it works",
  points: [
    {
      title: "You learn on your own work.",
      body: "Every exercise uses your real job, your real data and the tools you already have. No sample company.",
    },
    {
      title: "You build something every week.",
      body: "Each week adds a piece, and each program ends with a working system you keep.",
    },
    { title: "You prove it.", body: "Credentials are earned on what you built, not on hours logged." },
    {
      title: "It keeps up.",
      body: "AI changes every month. Programs get rebuilt as the tools change, and retired when they're out of date.", // CHECK
    },
  ],
  // Optional strip: one build growing week by week (Professional)
  weeks: [
    { week: "Week 1", label: "rules" },
    { week: "Week 2", label: "three agents" },
    { week: "Week 3", label: "morning briefing" },
    { week: "Week 4", label: "the full team" },
  ],
};

// ---------------------------------------------------------------- 12. Proof

export const proof = {
  headline: "Learn alongside people from", // PLACEHOLDER: depends on cleared proof
  // CHECK: confirm each company had people in programs and is cleared for use
  logos: [
    "MetLife", "lululemon", "Fidelity", "Guidehouse", "Fenwick", "OTTO",
    "JPMorgan Chase", "Cherry Bekaert", "Qlik", "Constellation Brands", "Red Hat",
    "Aramark", "MSCI", "WW", "PwC", "charity: water", "Arhaus", "Brown-Forman",
    "Tripleseat", "Tools for Humanity",
  ],
  // CHECK: both appeared in Superintelligent's own emails
  numbers: [
    { value: "1,600+", label: "people live at the first Frontier Lab" },
    { value: "125+", label: "teams in AIDB New Year" },
  ],
  learnerWork: placeholder("two to four real builds with the builder's name, role and program, used with permission"),
  quotes: placeholder("real quotes only, with name, role and program, used with permission"),
};

// ---------------------------------------------------------------- 13. FAQ

export const faq = {
  headline: "Questions",
  items: [
    {
      q: "Do I need to be technical?",
      a: "Not for Foundations, Professional or most free programs. You need one paid AI tool, about $20 a month, or a company license. Advanced and the Champions Bootcamp need an agentic building tool you can use at work, like Claude Code, Codex or Cursor.",
    },
    {
      q: "Which AI tools do the programs use?",
      a: "The one you already have. Professional works in ChatGPT, Claude, Gemini or Microsoft Copilot. Advanced works in Cursor, Claude Code, Codex, GitHub Copilot or Antigravity. We don't sell you a tool.",
    },
    {
      q: "What's free?",
      a: "AIDB New Year, AI Summer Adventure, Claw Camp, Agent OS, The Multiplayer AI Sprint and the Frontier Lab webinars. No trial that turns into a charge.",
    },
    {
      q: "Where do I start?",
      a: "Take the three-question finder. If you'd rather choose yourself, the path goes Foundations, then Professional, then Advanced, and you can start at any level.",
    },
    {
      q: "How much time does it take?",
      a: "Professional is about 3 hours a week for four weeks. Advanced is 5 to 7 hours a week for six weeks. The Champions Bootcamp is six 2-hour live sessions over three weeks, plus homework. Foundations and the free programs go at your pace.",
    },
    {
      q: "Is my company's data safe?",
      a: "You work in your company's approved tool under your own account, so your company's data policy applies. No program requires uploading sensitive documents.",
    },
    {
      q: "Can my company pay by invoice or purchase order?",
      a: "Yes. Request a quote, then pay by invoice, card or ACH. Orders over $12,000 go by ACH, wire or invoice.",
    },
    { q: "What if it's not for me?", a: "Full refund through the end of week one. No form, no approval." },
    {
      q: "What happened to Executive Catch-Up and Executive Agent Leadership?",
      a: "They're now AI & Agents Professional and AI & Agents Advanced. Same programs, new names.",
    },
    {
      q: "How is Superintelligent connected to The AI Daily Brief?",
      a: "Superintelligent is the AI education company of Nathaniel Whittemore, who hosts The AI Daily Brief. The show is free media. The free programs are made together. Paid programs and the subscription are Superintelligent's.",
    },
    {
      q: "What happened to readiness audits?",
      a: "Agent Readiness audits are no longer offered to new customers. Existing clients can log in to find their sessions, interviews and reports.",
    },
  ],
};

// ---------------------------------------------------------------- 14. Closing

export const closing = {
  headline: "Pick one thing and build it",
  line: "Three questions, one program. Free programs start any time.",
  buttons: [
    { label: "Find my program", href: "#finder" },
    { label: "Start free", href: "#free" },
  ] as [Link, Link],
};

// ---------------------------------------------------------------- 15. Footer

export const footer = {
  columns: [
    {
      title: "The path",
      links: ["AI & Agents Foundations", "AI & Agents Professional", "AI & Agents Advanced", "The full path"],
    },
    { title: "Role programs", links: ["AI Champions Bootcamp"] },
    {
      title: "Free",
      links: ["AIDB New Year", "AI Summer Adventure", "Claw Camp", "Agent OS", "The Multiplayer AI Sprint", "Frontier Lab webinars"],
    },
    { title: "Subscription", links: ["Operator", "Leader"] },
    { title: "Teams", links: ["Company cohorts", "Get a quote", "Register"] },
    {
      title: "Company",
      links: ["The AI Daily Brief", "SuperBlog", "LinkedIn", "Contact", "Looking for readiness audits?"], // CHECK: Contact destination
    },
    { title: "Help", links: ["training@besuper.ai", "support@besuper.ai", "Log in"] },
    { title: "Legal", links: ["Privacy", "Terms", "Subprocessors", "Refund Policy", "Security"] },
  ],
  line: "Superintelligent.", // CHECK: repeat the winning hero line or leave it off
};
