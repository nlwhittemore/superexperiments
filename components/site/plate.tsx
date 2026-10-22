import Image from "next/image";
import type { PlateId } from "@/content/homepage";

export type Direction = "paper" | "studio" | "mono" | "prism" | "night" | "riso";

const ALT: Record<PlateId, string> = {
  briefing: "Example build: a morning briefing listing 3 meetings that need prep and 2 decisions waiting",
  "agent-team": "Example build: an agent team roster run by a Chief of Staff agent",
  "opportunity-map": "Example build: an AI opportunity map sorted into build now, build after governance and parked",
  "eval-report": "Example build: an operations agent test report, 37 of 40 golden set cases passed",
  "shared-folder": "Example build: a shared team-context folder with how-we-price.md and client-list.md",
  "rollout-plan": "Example build: a champion rollout plan with an approved eval plan and a 12-person rollout",
  "step-tracker": "Example build: a twelve-step agent team tracker, on step 6, memory",
  "expense-app": "Example build: a small expense splitter app",
  "monthly-issue": "Example: a monthly lab worksheet, Build your own AI benchmark",
  "team-admin": "Example: a company admin view with 24 of 25 seats assigned",
};

// Generated "artifact plates" (GPT Image 2.5). Each direction has its own set;
// prompts live next to them in design/image-prompts so any plate can be
// regenerated, and every plate gets replaced by a real learner build.
export function Plate({
  direction,
  id,
  sizes = "(min-width: 1024px) 50vw, 100vw",
  className,
  eager,
}: {
  direction: Direction;
  id: PlateId;
  sizes?: string;
  className?: string;
  eager?: boolean;
}) {
  return (
    <Image
      src={`/directions/${direction}/${id}.webp`}
      alt={ALT[id]}
      width={1536}
      height={1024}
      sizes={sizes}
      className={className}
      loading={eager ? "eager" : "lazy"}
      fetchPriority={eager ? "high" : undefined}
    />
  );
}
