import Link from "next/link";
import type { Direction } from "./plate";

const DIRECTIONS: { id: Direction; letter: string; name: string }[] = [
  { id: "paper", letter: "A", name: "Paper & Sun" },
  { id: "studio", letter: "B", name: "Studio" },
  { id: "riso", letter: "C", name: "Riso" },
];

// Review chrome, not part of any design: switches between the directions.
export function DirectionBar({ current }: { current: Direction }) {
  return (
    <div className="bg-[#0b0b0c] font-mono text-[12px] text-[#a1a1a6]">
      <div className="mx-auto flex h-9 max-w-[1240px] items-center justify-between gap-4 overflow-x-auto px-5 whitespace-nowrap">
        <Link href="/directions" className="hover:text-white">
          Homepage directions
        </Link>
        <nav className="flex gap-1">
          {DIRECTIONS.map((d) => (
            <Link
              key={d.id}
              href={`/directions/${d.id}`}
              aria-current={d.id === current ? "page" : undefined}
              className={`rounded px-2 py-1 ${d.id === current ? "bg-white text-black" : "hover:text-white"}`}
            >
              {d.letter} · {d.name}
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
}
