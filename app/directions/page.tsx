import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Logo } from "@/components/site/logo";

export const metadata: Metadata = {
  title: { absolute: "Superintelligent · Homepage directions" },
};

const DIRECTIONS = [
  {
    id: "paper",
    n: 1,
    name: "Paper",
    headline: "Learn AI by building with it.",
    summary:
      "Round 1's Paper & Sun with the yellow gone. Warm paper, ink and one tomato red. Every build is a printed page photographed in hard morning light.",
    system: "Editorial template · Hanken Grotesk · paper #F4F2EA · ink #141414 · tomato #F2552C",
  },
  {
    id: "studio",
    n: 2,
    name: "Studio",
    headline: "AI is already part of your job. Get good at it.",
    summary:
      "The Swiss document, no longer a wireframe. Cobalt line illustrations for each level and section, builds drawn as annotated blueprints, and the logo's spark as a glyph.",
    system: "Document template · Geist + Geist Mono · white · ink #0E0E11 · cobalt #2D4BFF",
  },
  {
    id: "mono",
    n: 3,
    name: "Mono",
    headline: "Get good at AI.",
    summary:
      "Paper's layout in black and white only. No accent color at all: knockout blocks, deep window shadows, gallery-print photography.",
    system: "Editorial template · Inter Tight · #F5F5F3 · ink #0A0A0A",
  },
  {
    id: "prism",
    n: 4,
    name: "Prism",
    headline: "Learn AI by building with it.",
    summary:
      "Studio's document in white and ink, where the only color is light split through a prism, in the photographs, the sparks and one underline.",
    system: "Document template · Host Grotesk + IBM Plex Mono · white · ink #111114 · spectrum",
  },
  {
    id: "night",
    n: 5,
    name: "Night",
    headline: "AI is already part of your job. Get good at it.",
    summary:
      "Today's dark besuper.ai, grown up. Near-black, a serif display, the current brand teal, and builds lit by a single slice of light.",
    system: "Editorial template · Instrument Serif + Sans · #0E0F0F · teal #5BC4C4",
  },
];

export default function Directions() {
  return (
    <main className="min-h-screen bg-[#f6f6f4] text-[#111]">
      <div className="mx-auto max-w-[1240px] px-5 py-14 sm:px-10 sm:py-20">
        <Logo width={170} />
        <h1 className="mt-12 max-w-3xl text-[clamp(2.2rem,5vw,3.6rem)] leading-[1.02] font-semibold tracking-[-0.035em]">
          Homepage directions, round 2
        </h1>
        <p className="mt-5 max-w-2xl text-[17px] text-[#55554f]">
          Built from 1 (Paper) and 2 (Studio), with three more at the same level of simplicity. No yellow anywhere. Same
          copy, sections and finder throughout: each direction is a theme on one of two templates. Every image was made
          with GPT Image 2.5 and is labeled as an example until real learner builds replace it.
        </p>
        <ul className="mt-14 grid gap-x-6 gap-y-14 md:grid-cols-2 lg:grid-cols-3">
          {DIRECTIONS.map((d) => (
            <li key={d.id}>
              <Link href={`/directions/${d.id}`} className="group block">
                <div className="overflow-hidden rounded-[6px] border border-black/10 bg-white">
                  <Image
                    src={`/directions/thumbs/${d.id}.webp`}
                    alt={`Direction ${d.n}, ${d.name}: homepage hero`}
                    width={960}
                    height={667}
                    sizes="(min-width: 1024px) 400px, (min-width: 768px) 50vw, 100vw"
                    className="w-full transition-transform duration-500 group-hover:scale-[1.02]"
                  />
                </div>
                <div className="mt-5 flex items-baseline gap-3">
                  <span className="font-mono text-[13px] text-[#77776f]">{d.n}</span>
                  <h2 className="text-[24px] font-semibold tracking-[-0.02em] group-hover:underline">{d.name}</h2>
                </div>
                <p className="mt-2 text-[15px] font-medium">“{d.headline}”</p>
                <p className="mt-2 text-[15px] text-[#55554f]">{d.summary}</p>
                <p className="mt-3 font-mono text-[12px] text-[#77776f]">{d.system}</p>
              </Link>
            </li>
          ))}
        </ul>
        <p className="mt-16 border-t border-black/10 pt-6 text-[14px] text-[#77776f]">
          Set aside from round 1:{" "}
          <Link href="/directions/riso" className="underline underline-offset-4 hover:text-[#111]">
            Riso
          </Link>
          .
        </p>
      </div>
    </main>
  );
}
