"use client";

import { finder } from "@/content/homepage";
import { useFinder } from "@/lib/site/finder";
import { Plate, type Direction } from "@/components/site/plate";

const KEYS = ["A", "B", "C", "D"];

export function DocumentFinder({ direction }: { direction: Direction }) {
  const f = useFinder();
  const q = finder.questions[Math.min(f.step, finder.questions.length - 1)];

  return (
    <div className="doc-finder-card overflow-hidden rounded-[6px] border border-(--line) bg-(--bg) shadow-[0_1px_2px_rgba(0,0,0,0.04),0_12px_40px_-20px_rgba(14,14,17,0.18)]">
      <div className="flex items-center justify-between border-b border-(--line) bg-(--grey) px-5 py-3">
        <span className="doc-label text-(--mute)">Program finder</span>
        <span className="doc-label text-(--mute)">
          {f.result
            ? "Result"
            : `${String(f.step + 1).padStart(2, "0")} / ${String(f.total).padStart(2, "0")}`}
        </span>
      </div>
      <div className="grid md:grid-cols-[15rem_1fr]">
        <ol
          className="hidden border-r border-(--line) p-5 md:block"
          aria-label="Progress"
        >
          {finder.questions.map((question, i) => {
            const answer = question.options.find((o) => o.id === f.selected(i));
            const active = i === f.step && !f.result;
            return (
              <li
                key={question.id}
                className="border-b border-(--line) py-4 last:border-0"
              >
                <div
                  className={`doc-label ${active ? "text-(--accent)" : "text-(--mute)"}`}
                >
                  {String(i + 1).padStart(2, "0")} {["Who", "Usage", "Goal"][i]}
                </div>
                <div
                  className={`mt-1 text-[14px] ${answer && i < f.step ? "text-(--fg)" : "text-(--mute)"}`}
                >
                  {answer && i < f.step ? answer.label : "—"}
                </div>
              </li>
            );
          })}
        </ol>

        <div className="min-h-[26rem] p-6 sm:p-8" aria-live="polite">
          {!f.result ? (
            <>
              <h3 className="text-[26px] font-semibold tracking-[-0.03em] sm:text-[30px]">
                {q.title}
              </h3>
              <div className="mt-6 grid">
                {q.options.map((o, i) => (
                  <button
                    key={o.id}
                    type="button"
                    onClick={() => f.choose(o.id)}
                    className="group flex items-center gap-4 border-t border-(--line) py-4 text-left text-[17px] last:border-b hover:text-(--accent)"
                  >
                    <span className="doc-mono grid size-7 shrink-0 place-items-center rounded-[4px] border border-(--line) text-[12px] text-(--mute) group-hover:border-(--accent) group-hover:bg-(--accent) group-hover:text-(--accent-fg)">
                      {KEYS[i]}
                    </span>
                    <span className="flex-1">{o.label}</span>
                    <span className="doc-arrow text-(--mute) group-hover:text-(--accent)">
                      →
                    </span>
                  </button>
                ))}
              </div>
              {f.step > 0 && (
                <button
                  type="button"
                  onClick={f.back}
                  className="doc-label mt-6 text-(--mute) hover:text-(--fg)"
                >
                  ← Back
                </button>
              )}
            </>
          ) : (
            <Result f={f} direction={direction} />
          )}
        </div>
      </div>
    </div>
  );
}

function Result({
  f,
  direction,
}: {
  f: ReturnType<typeof useFinder>;
  direction: Direction;
}) {
  const r = f.result!;
  const facts = r.program.facts;
  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_15rem]">
      <div>
        <div className="doc-label text-(--accent)">{finder.resultLabel}</div>
        <h3 className="mt-3 text-[32px] leading-[1.05] font-semibold tracking-[-0.035em] sm:text-[40px]">
          {r.program.name}
          {r.as && <span className="block text-(--mute)">{r.as}</span>}
        </h3>
        <p className="mt-4 text-[17px] text-(--fg-2)">{r.program.line}</p>
        <dl className="mt-6 grid grid-cols-2 gap-px overflow-hidden rounded-[4px] border border-(--line) bg-(--line)">
          {facts.map((fact) => (
            <div key={fact} className="bg-(--bg) p-3">
              <dd className="text-[13px] leading-snug">{fact}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-6 text-[15px]">
          <span className="doc-label mr-2 text-(--mute)">Why this</span>
          {r.why}
        </p>
        <div className="mt-7 flex flex-wrap gap-2">
          <a
            href={r.program.buttons[0].href}
            className="doc-btn doc-btn-accent"
          >
            See the program
          </a>
          <a href={r.freeStart.href} className="doc-btn doc-btn-line">
            Start free with {r.freeStart.name}
          </a>
        </div>
        <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-(--line) pt-4 text-[14px]">
          <span>
            <span className="doc-label mr-2 text-(--mute)">After that</span>
            {r.after}
          </span>
          <button
            type="button"
            onClick={f.reset}
            className="doc-label text-(--accent) hover:underline"
          >
            {finder.startOver}
          </button>
        </div>
      </div>
      <div className="hidden lg:block">
        <Plate
          direction={direction}
          id={r.program.plate}
          className="w-full rounded-[4px]"
          sizes="240px"
        />
        <p className="doc-label mt-2 text-(--mute)">Example build</p>
      </div>
    </div>
  );
}
