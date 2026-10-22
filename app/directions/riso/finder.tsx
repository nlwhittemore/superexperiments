"use client";

import { finder } from "@/content/homepage";
import { useFinder } from "@/lib/site/finder";
import { Plate } from "@/components/site/plate";

export function RisoFinder() {
  const f = useFinder();
  const q = finder.questions[Math.min(f.step, finder.questions.length - 1)];

  return (
    <div aria-live="polite">
      {!f.result ? (
        <div className="ri-offset border-2 border-(--ink) bg-(--paper) p-6 text-(--ink) sm:p-10">
          <div className="flex items-center justify-between gap-4">
            <span className="ri-label">
              Question {f.step + 1} / {f.total}
            </span>
            <span className="flex gap-1.5" aria-hidden>
              {finder.questions.map((question, i) => (
                <span
                  key={question.id}
                  className={`size-3.5 rounded-full border-2 border-(--ink) ${i < f.step ? "bg-(--blue)" : i === f.step ? "bg-(--pink)" : ""}`}
                />
              ))}
            </span>
          </div>
          <h3 className="mt-6 text-[30px] leading-[1.02] font-black tracking-[-0.02em] [font-stretch:118%] sm:text-[40px]">
            {q.title}
          </h3>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {q.options.map((o) => (
              <button
                key={o.id}
                type="button"
                onClick={() => f.choose(o.id)}
                className="border-2 border-(--ink) bg-(--paper) px-5 py-5 text-left text-[18px] font-bold transition-[transform,box-shadow,background-color] duration-150 [font-stretch:108%] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:bg-(--yellow) hover:shadow-[6px_6px_0_var(--blue)]"
              >
                {o.label}
              </button>
            ))}
          </div>
          {f.step > 0 && (
            <button type="button" onClick={f.back} className="ri-label mt-8 underline underline-offset-4">
              ← Back
            </button>
          )}
        </div>
      ) : (
        <Result f={f} />
      )}
    </div>
  );
}

function Result({ f }: { f: ReturnType<typeof useFinder> }) {
  const r = f.result!;
  return (
    <div className="ri-offset grid border-2 border-(--ink) bg-(--paper) text-(--ink) lg:grid-cols-[1.25fr_1fr]">
      <div className="p-6 sm:p-10">
        <span className="ri-label inline-block bg-(--pink) px-2 py-1">{finder.resultLabel}</span>
        <h3 className="mt-5 text-[34px] leading-[0.98] font-black uppercase tracking-[-0.025em] [font-stretch:122%] sm:text-[44px]">
          {r.program.name}
        </h3>
        {r.as && <p className="mt-2 text-[20px] font-bold [font-stretch:110%]">{r.as}</p>}
        <p className="mt-4 text-[18px]">{r.program.line}</p>
        <ul className="mt-5 flex flex-wrap gap-2">
          {r.program.facts.map((fact) => (
            <li key={fact} className="ri-mono border-2 border-(--blue) px-2 py-1 text-[12px] text-(--blue)">
              {fact}
            </li>
          ))}
        </ul>
        <p className="mt-6 text-[16px]">
          <span className="font-bold">Why this: </span>
          {r.why}
        </p>
        <div className="mt-8 flex flex-wrap gap-4">
          <a href={r.program.buttons[0].href} className="ri-btn ri-btn-blue">
            See the program
          </a>
          <a href={r.freeStart.href} className="ri-btn ri-btn-paper">
            Start free with {r.freeStart.name}
          </a>
        </div>
        <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t-2 border-(--ink) pt-4 text-[15px]">
          <span>
            <span className="font-bold">After that:</span> {r.after}
          </span>
          <button type="button" onClick={f.reset} className="ri-label underline underline-offset-4">
            {finder.startOver}
          </button>
        </div>
      </div>
      <div className="hidden border-l-2 border-(--ink) lg:block">
        <Plate direction="riso" id={r.program.plate} className="h-full w-full object-cover" sizes="480px" />
      </div>
    </div>
  );
}
