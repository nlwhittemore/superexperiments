"use client";

import { finder } from "@/content/homepage";
import { useFinder } from "@/lib/site/finder";
import { Plate, type Direction } from "@/components/site/plate";

export function EditorialFinder({ direction }: { direction: Direction }) {
  const f = useFinder();
  const q = finder.questions[Math.min(f.step, finder.questions.length - 1)];

  return (
    <div className="grid gap-10 lg:grid-cols-12 lg:gap-12">
      <div className="lg:col-span-5">
        <h2 id="finder-title" className="ed-h2 text-(--band-fg)">
          {finder.headline}
        </h2>
        <p className="mt-6 max-w-md text-[18px] text-(--band-mute)">
          {finder.intro}
        </p>
        <ol className="mt-10 hidden gap-2 lg:grid" aria-label="Progress">
          {finder.questions.map((question, i) => (
            <li
              key={question.id}
              className={`flex items-baseline gap-4 border-t py-3 text-[15px] ${
                i === f.step
                  ? "border-(--accent) text-(--band-fg)"
                  : "border-(--band-line) text-(--band-mute)"
              }`}
            >
              <span className="w-5 tabular-nums">{i + 1}</span>
              <span className="flex-1">{question.title}</span>
              {f.selected(i) && i < f.step && (
                <span className="text-(--band-fg)">
                  {question.options.find((o) => o.id === f.selected(i))?.label}
                </span>
              )}
            </li>
          ))}
        </ol>
      </div>

      <div className="lg:col-span-7" aria-live="polite">
        {!f.result ? (
          <div className="rounded-[10px] bg-(--band-2) p-6 sm:p-10">
            <div className="flex items-center justify-between text-[14px] text-(--band-mute)">
              <span>
                Question {f.step + 1} of {f.total}
              </span>
              <div className="flex gap-1.5" aria-hidden>
                {finder.questions.map((question, i) => (
                  <span
                    key={question.id}
                    className={`h-1.5 w-10 rounded-full ${i <= f.step ? "bg-(--accent)" : "bg-(--band-line)"}`}
                  />
                ))}
              </div>
            </div>
            <h3 className="mt-8 text-[28px] font-bold leading-tight tracking-[-0.02em] text-(--band-fg) sm:text-[34px]">
              {q.title}
            </h3>
            <div className="mt-8 grid gap-3">
              {q.options.map((o) => (
                <button
                  key={o.id}
                  type="button"
                  onClick={() => f.choose(o.id)}
                  className="group flex items-center justify-between rounded-[8px] border border-(--band-line) px-5 py-4 text-left text-[18px] text-(--band-fg) transition-colors hover:border-(--accent) hover:bg-(--band-line)"
                >
                  {o.label}
                  <span className="text-(--band-mute) transition-transform group-hover:translate-x-1 group-hover:text-(--accent)">
                    →
                  </span>
                </button>
              ))}
            </div>
            {f.step > 0 && (
              <button
                type="button"
                onClick={f.back}
                className="mt-6 text-[15px] text-(--band-mute) hover:text-(--band-fg)"
              >
                ← Back
              </button>
            )}
          </div>
        ) : (
          <ResultCard f={f} direction={direction} />
        )}
      </div>
    </div>
  );
}

function ResultCard({
  f,
  direction,
}: {
  f: ReturnType<typeof useFinder>;
  direction: Direction;
}) {
  const r = f.result!;
  return (
    <div className="overflow-hidden rounded-[10px] bg-(--feature) text-(--feature-fg)">
      <div className="p-6 sm:p-10">
        <div className="ed-label">{finder.resultLabel}</div>
        <h3 className="mt-4 text-[34px] font-extrabold leading-[1.02] tracking-[-0.03em] sm:text-[44px]">
          {r.program.name}
          {r.as && (
            <span className="block text-[22px] font-bold tracking-[-0.015em] sm:text-[26px]">
              {r.as}
            </span>
          )}
        </h3>
        <p className="mt-4 max-w-xl text-[18px] leading-snug">
          {r.program.line}
        </p>
        <p className="mt-5 text-[15px] font-semibold">
          {r.program.facts.join(" · ")}
        </p>
        <div className="mt-6 border-t border-(--feature-fg)/15 pt-5">
          <div className="text-[14px] font-semibold">Why this</div>
          <p className="mt-1 max-w-xl text-[16px]">{r.why}</p>
        </div>
        <div className="mt-8 flex flex-wrap gap-3">
          <a href={r.program.buttons[0].href} className="ed-btn ed-btn-strong">
            See the program
          </a>
          <a href={r.freeStart.href} className="ed-btn ed-btn-line">
            Start free with {r.freeStart.name}
          </a>
        </div>
      </div>
      <div className="grid grid-cols-[1fr_auto] items-center gap-4 border-t border-(--feature-fg)/15 bg-(--feature-fg)/[0.05] px-6 py-4 text-[15px] sm:px-10">
        <span>
          <span className="font-semibold">After that:</span> {r.after}
        </span>
        <button
          type="button"
          onClick={f.reset}
          className="ed-link font-semibold"
        >
          {finder.startOver}
        </button>
      </div>
      <div className="hidden border-t border-(--feature-fg)/15 sm:block">
        <Plate
          direction={direction}
          id={r.program.plate}
          className="h-44 w-full object-cover"
          sizes="600px"
        />
      </div>
    </div>
  );
}
