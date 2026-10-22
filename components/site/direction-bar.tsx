import Link from "next/link";
import type { Direction } from "./plate";

export const DIRECTIONS: { id: Direction; n: number; name: string }[] = [
  { id: "paper", n: 1, name: "Paper" },
  { id: "studio", n: 2, name: "Studio" },
  { id: "mono", n: 3, name: "Mono" },
  { id: "prism", n: 4, name: "Prism" },
  { id: "night", n: 5, name: "Night" },
];

// Review chrome, not part of any design: switches between the directions.
export function DirectionBar({ current }: { current: Direction }) {
  return (
    <div className="bg-[#0b0b0c] font-mono text-[12px] text-[#a1a1a6]">
      <div className="mx-auto flex h-9 max-w-[1240px] items-center justify-between gap-4 overflow-x-auto px-5 whitespace-nowrap">
        <Link href="/directions" className="hover:text-white">
          Homepage directions · round 2
        </Link>
        <nav className="flex gap-1">
          {DIRECTIONS.map((d) => (
            <Link
              key={d.id}
              href={`/directions/${d.id}`}
              aria-current={d.id === current ? "page" : undefined}
              className={`rounded px-2 py-1 ${d.id === current ? "bg-white text-black" : "hover:text-white"}`}
            >
              {d.n} · {d.name}
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
}
