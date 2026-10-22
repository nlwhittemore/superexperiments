"use client";

import { useState } from "react";
import { champions, free, path, type Program } from "@/content/homepage";

export type Who = "me" | "team" | "company";
export type Usage = "not-much" | "chat" | "build";
export type Goal = "basics" | "agents" | "team-ai" | "plan";
export type Answers = { who?: Who; usage?: Usage; goal?: Goal };

export type FinderResult = {
  program: Program;
  // Qualifier shown after the program name, e.g. "as a team"
  as?: string;
  why: string;
  freeStart: { name: string; href: string };
  after: string;
};

const byId = (id: string) => [...path, champions].find((p) => p.id === id)!;
const freeProgram = (id: string) => {
  const p = free.programs.find((f) => f.id === id)!;
  return { name: p.name, href: p.href };
};

// Routing table from section 3 of the copy doc. Answers not listed fall to
// the nearest row by Question 1, then Question 3.
export function route({ who, usage, goal }: Required<Answers>): FinderResult {
  const sprint = freeProgram("multiplayer");

  if (who === "me") {
    if (usage === "not-much")
      return {
        program: byId("foundations"),
        why: "You're early with AI. This gets the basics right, at your own pace.",
        // AIDB New Year in January, otherwise AI Summer Adventure, first tier
        freeStart: new Date().getMonth() === 0 ? freeProgram("aidb-new-year") : freeProgram("summer-adventure"),
        after: "AI & Agents Professional",
      };
    if (usage === "chat")
      return {
        program: byId("professional"),
        why: "You already use AI most days. This turns it into agents that handle real parts of your job.",
        freeStart: freeProgram("claw-camp"),
        after: "AI & Agents Advanced, or the Subscription",
      };
    return {
      program: byId("advanced"),
      why: "You already build. This puts agents on your real systems, with the rules to run them.",
      freeStart: freeProgram("agent-os"),
      after: "The Superintelligent Subscription",
    };
  }

  if (who === "team") {
    // "A plan and rules" has no team row; nearest by Question 3 is team AI.
    if (goal === "team-ai" || goal === "plan")
      return {
        program: champions,
        why: "Someone on the team has to lead it. This trains that person on a real team problem.",
        freeStart: sprint,
        after: "AI & Agents Professional for the team",
      };
    return {
      program: byId("professional"),
      as: "as a team",
      why: "Everyone builds their own agents on their own work, on the same dates.",
      freeStart: sprint,
      after: "AI Champions Bootcamp for whoever leads AI on the team",
    };
  }

  if (goal === "plan")
    return {
      program: byId("advanced"),
      as: "for the team that builds and sets the rules",
      why: "The people who build and govern your agents learn on your real systems.",
      freeStart: sprint,
      after: "Professional across the company, a champion on every team",
    };
  return {
    program: byId(usage === "not-much" ? "foundations" : "professional"),
    as: "as a company cohort",
    why: "Your whole company starts on one date and learns on its own work.",
    freeStart: sprint,
    after: "Talk to us",
  };
}

const ORDER = ["who", "usage", "goal"] as const;

// Headless finder state: one question at a time, back, start over. Each
// direction renders its own UI on top of this.
export function useFinder() {
  const [answers, setAnswers] = useState<Answers>({});
  const [step, setStep] = useState(0);

  const done = step >= ORDER.length;
  const result = done ? route(answers as Required<Answers>) : null;

  return {
    step,
    total: ORDER.length,
    answers,
    result,
    choose(option: string) {
      setAnswers((a) => ({ ...a, [ORDER[step]]: option }));
      setStep((s) => s + 1);
    },
    back() {
      setStep((s) => Math.max(0, s - 1));
    },
    reset() {
      setAnswers({});
      setStep(0);
    },
    selected: (questionIndex: number) => answers[ORDER[questionIndex]],
  };
}
