import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { headlines } from "@/content/homepage";
import { Logo } from "@/components/site/logo";

export const metadata: Metadata = {
  title: { absolute: "Superintelligent · Homepage directions" },
};

const DIRECTIONS = [
  {
    id: "paper",
    letter: "A",
    name: "Paper & Sun",
    headline: headlines[0],
    summary:
      "Atlas's cleanness, evolved. Warm paper, ink and one sun yellow. Every build is shown as a printed page photographed in real light.",
    system: "Hanken Grotesk · paper #F4F2EA · ink #141414 · sun #FFD23F",
  },
  {
    id: "studio",
    letter: "B",
    name: "Studio",
    headline: headlines[1],
    summary:
      "A Swiss document. White, ink and electric cobalt, numbered section rails, programs as a side-by-side spec sheet, builds as pristine product shots.",
    system: "Geist + Geist Mono · white · ink #0E0E11 · cobalt #2D4BFF",
  },
  {
    id: "riso",
    letter: "C",
    name: "Riso",
    headline: headlines[2],
    summary:
      "The bold swing. Newsprint, poster-wide type and two riso inks. Every build is a risograph print, so the whole site reads as one illustration system.",
    system: "Archivo Expanded + Space Mono · newsprint · blue #0078BF · pink #FF48B0",
  },
];

export default function Directions() {
  return (
    <main className="min-h-screen bg-[#f6f6f4] text-[#111]">
      <div className="mx-auto max-w-[1240px] px-5 py-14 sm:px-10 sm:py-20">
        <Logo width={170} />
        <h1 className="mt-12 max-w-3xl text-[clamp(2.2rem,5vw,3.6rem)] leading-[1.02] font-semibold tracking-[-0.035em]">
          Three directions for the new besuper.ai homepage
        </h1>
        <p className="mt-5 max-w-2xl text-[17px] text-[#55554f]">
          Same copy, same content, same finder logic. Each direction changes only color, type, layout and imagery, and each
          tries a different headline from the copy doc. Every image was generated with GPT Image 2.5 and is labeled as an
          example until real learner builds replace it.
        </p>
        <ul className="mt-14 grid gap-10 lg:grid-cols-3 lg:gap-6">
          {DIRECTIONS.map((d) => (
            <li key={d.id}>
              <Link href={`/directions/${d.id}`} className="group block">
                <div className="overflow-hidden rounded-[6px] border border-black/10 bg-white">
                  <Image
                    src={`/directions/thumbs/${d.id}.webp`}
                    alt={`Direction ${d.letter}, ${d.name}: homepage hero`}
                    width={1440}
                    height={1000}
                    sizes="(min-width: 1024px) 400px, 100vw"
                    className="w-full transition-transform duration-500 group-hover:scale-[1.02]"
                  />
                </div>
                <div className="mt-5 flex items-baseline gap-3">
                  <span className="font-mono text-[13px] text-[#77776f]">{d.letter}</span>
                  <h2 className="text-[24px] font-semibold tracking-[-0.02em] group-hover:underline">{d.name}</h2>
                </div>
                <p className="mt-2 text-[15px] font-medium">“{d.headline}”</p>
                <p className="mt-2 text-[15px] text-[#55554f]">{d.summary}</p>
                <p className="mt-3 font-mono text-[12px] text-[#77776f]">{d.system}</p>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
