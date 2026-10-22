"use client";

import { finder } from "@/content/homepage";
import { useFinder } from "@/lib/site/finder";
import { Plate } from "@/components/site/plate";

export function PaperFinder() {
  const f = useFinder();
  const q = finder.questions[Math.min(f.step, finder.questions.length - 1)];

  return (
    <div className="grid gap-10 lg:grid-cols-12 lg:gap-12">
      <div className="lg:col-span-5">
        <h2 id="finder-title" className="pa-h2 text-(--paper)">
          {finder.headline}
        </h2>
        <p className="mt-6 max-w-md text-[18px] text-(--night-mute)">{finder.intro}</p>
        <ol className="mt-10 hidden gap-2 lg:grid" aria-label="Progress">
          {finder.questions.map((question, i) => (
            <li
              key={question.id}
              className={`flex items-baseline gap-4 border-t py-3 text-[15px] ${
                i === f.step ? "border-(--sun) text-(--paper)" : "border-(--night-line) text-(--night-mute)"
              }`}
            >
              <span className="w-5 tabular-nums">{i + 1}</span>
              <span className="flex-1">{question.title}</span>
              {f.selected(i) && i < f.step && (
                <span className="text-(--paper)">
                  {question.options.find((o) => o.id === f.selected(i))?.label}
                </span>
              )}
            </li>
          ))}
        </ol>
      </div>

      <div className="lg:col-span-7" aria-live="polite">
        {!f.result ? (
          <div className="rounded-[10px] bg-(--night-2) p-6 sm:p-10">
            <div className="flex items-center justify-between text-[14px] text-(--night-mute)">
              <span>
                Question {f.step + 1} of {f.total}
              </span>
              <div className="flex gap-1.5" aria-hidden>
                {finder.questions.map((question, i) => (
                  <span
                    key={question.id}
                    className={`h-1.5 w-10 rounded-full ${i <= f.step ? "bg-(--sun)" : "bg-(--night-line)"}`}
                  />
                ))}
              </div>
            </div>
            <h3 className="mt-8 text-[28px] font-bold leading-tight tracking-[-0.02em] text-(--paper) sm:text-[34px]">
              {q.title}
            </h3>
            <div className="mt-8 grid gap-3">
              {q.options.map((o) => (
                <button
                  key={o.id}
                  type="button"
                  onClick={() => f.choose(o.id)}
                  className="group flex items-center justify-between rounded-[8px] border border-(--night-line) px-5 py-4 text-left text-[18px] text-(--paper) transition-colors hover:border-(--sun) hover:bg-[#2b2a27]"
                >
                  {o.label}
                  <span className="text-(--night-mute) transition-transform group-hover:translate-x-1 group-hover:text-(--sun)">
                    →
                  </span>
                </button>
              ))}
            </div>
            {f.step > 0 && (
              <button type="button" onClick={f.back} className="mt-6 text-[15px] text-(--night-mute) hover:text-(--paper)">
                ← Back
              </button>
            )}
          </div>
        ) : (
          <ResultCard f={f} />
        )}
      </div>
    </div>
  );
}

function ResultCard({ f }: { f: ReturnType<typeof useFinder> }) {
  const r = f.result!;
  return (
    <div className="overflow-hidden rounded-[10px] bg-(--sun) text-(--ink)">
      <div className="p-6 sm:p-10">
        <div className="pa-label">{finder.resultLabel}</div>
        <h3 className="mt-4 text-[34px] font-extrabold leading-[1.02] tracking-[-0.03em] sm:text-[44px]">
          {r.program.name}
          {r.as && <span className="block text-[22px] font-bold tracking-[-0.015em] sm:text-[26px]">{r.as}</span>}
        </h3>
        <p className="mt-4 max-w-xl text-[18px] leading-snug">{r.program.line}</p>
        <p className="mt-5 text-[15px] font-semibold">{r.program.facts.join(" · ")}</p>
        <div className="mt-6 border-t border-black/15 pt-5">
          <div className="text-[14px] font-semibold">Why this</div>
          <p className="mt-1 max-w-xl text-[16px]">{r.why}</p>
        </div>
        <div className="mt-8 flex flex-wrap gap-3">
          <a href={r.program.buttons[0].href} className="pa-btn pa-btn-ink">
            See the program
          </a>
          <a href={r.freeStart.href} className="pa-btn pa-btn-line">
            Start free with {r.freeStart.name}
          </a>
        </div>
      </div>
      <div className="grid grid-cols-[1fr_auto] items-center gap-4 border-t border-black/15 bg-black/[0.04] px-6 py-4 text-[15px] sm:px-10">
        <span>
          <span className="font-semibold">After that:</span> {r.after}
        </span>
        <button type="button" onClick={f.reset} className="pa-link font-semibold">
          {finder.startOver}
        </button>
      </div>
      <div className="hidden border-t border-black/15 sm:block">
        <Plate direction="paper" id={r.program.plate} className="h-44 w-full object-cover" sizes="600px" />
      </div>
    </div>
  );
}
