import {
  builds,
  champions,
  championsBand,
  closing,
  faq,
  footer,
  free,
  hero,
  isPlaceholder,
  method,
  nav,
  path,
  programsIntro,
  proof,
  routeMap,
  subscription,
  teams,
  upcomingStarts,
  type Program,
} from "@/content/homepage";
import { Logo } from "@/components/site/logo";
import { Plate } from "@/components/site/plate";
import { PlaceholderSlot } from "@/components/site/placeholder";
import { DirectionBar } from "@/components/site/direction-bar";
import { EditorialFinder } from "./finder";
import { splitHeadline, type EditorialTheme } from "../theme";

export function EditorialHome({ theme: t }: { theme: EditorialTheme }) {
  return (
    <>
      <DirectionBar current={t.direction} />
      <Header t={t} />
      <main>
        <Hero t={t} />
        <section
          id="finder"
          aria-labelledby="finder-title"
          className="ed-band bg-(--band) py-24 sm:py-28"
        >
          <div className="ed-wrap">
            <EditorialFinder direction={t.direction} />
          </div>
        </section>
        <Builds t={t} />
        <Programs t={t} />
        <Free t={t} />
        <Subscription t={t} />
        <RouteMap />
        <Teams t={t} />
        <Champions t={t} />
        <Method />
        <Proof />
        <Faq />
        <Closing />
      </main>
      <Footer t={t} />
    </>
  );
}

function Header({ t }: { t: EditorialTheme }) {
  return (
    <header className="sticky top-0 z-30 border-b border-(--line) bg-(--bg)/92 backdrop-blur">
      <div className="ed-wrap flex h-[72px] items-center justify-between gap-6">
        <a href="#" aria-label="Superintelligent home">
          <Logo tone={t.logo} width={168} />
        </a>
        <nav className="flex items-center gap-7 text-[15px]">
          <ul className="hidden items-center gap-7 lg:flex">
            {nav.links.map((l) => (
              <li key={l.label}>
                <a
                  href={l.href}
                  className="hover:underline hover:decoration-(--accent) hover:decoration-2 hover:underline-offset-4"
                >
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
          <a href={nav.login.href} className="hidden sm:block">
            {nav.login.label}
          </a>
          <a
            href={nav.cta.href}
            className="ed-btn ed-btn-accent h-11! px-4! text-[15px]!"
          >
            {nav.cta.label}
          </a>
        </nav>
      </div>
    </header>
  );
}

function Hero({ t }: { t: EditorialTheme }) {
  const { before, after } = splitHeadline(t.headline);
  return (
    <section className="ed-wrap grid items-center gap-12 pt-14 pb-20 sm:pt-20 lg:grid-cols-12 lg:gap-10 lg:pb-28">
      <div className="lg:col-span-6">
        <h1 className="ed-display">
          {before}
          <span className="ed-mark">{t.headline.emphasis}</span>
          {t.headline.breakAfterEmphasis ? (
            <>
              {" "}
              <br className="hidden lg:inline" />
              {after.trimStart()}
            </>
          ) : (
            after
          )}
        </h1>
        <p className="mt-8 max-w-[34rem] text-[19px] leading-[1.5] text-(--fg-2)">
          {hero.subhead}
        </p>
        <div className="mt-9 flex flex-wrap gap-3">
          <a href={hero.primary.href} className="ed-btn ed-btn-accent">
            {hero.primary.label}
          </a>
          <a href={hero.secondary.href} className="ed-btn ed-btn-line">
            {hero.secondary.label}
          </a>
        </div>
        <ul className="mt-10 grid gap-x-8 gap-y-2 border-t border-(--line) pt-5 text-[14px] text-(--fg-2) sm:grid-cols-2">
          {upcomingStarts().map((s) => (
            <li key={s.program} className="flex items-center gap-2.5">
              <span
                className="size-2 shrink-0 rounded-full bg-(--accent) ring-1 ring-(--fg)/20"
                aria-hidden
              />
              <span>
                <span className="font-semibold text-(--fg)">{s.program}</span> ·{" "}
                {s.label}
              </span>
            </li>
          ))}
        </ul>
      </div>
      <figure className="lg:col-span-6">
        <Plate
          direction={t.direction}
          id={hero.plate}
          eager
          className="w-full rounded-[4px]"
          sizes="(min-width: 1024px) 600px, 100vw"
        />
        <figcaption className="mt-3 text-[13px] text-(--mute)">
          {hero.caption}
        </figcaption>
      </figure>
    </section>
  );
}

function SectionHead({
  title,
  intro,
  id,
}: {
  title: string;
  intro?: string;
  id?: string;
}) {
  return (
    <div className="max-w-3xl">
      <h2 id={id} className="ed-h2">
        {title}
      </h2>
      {intro && (
        <p className="mt-5 max-w-2xl text-[19px] leading-[1.5] text-(--fg-2)">
          {intro}
        </p>
      )}
    </div>
  );
}

function Builds({ t }: { t: EditorialTheme }) {
  return (
    <section id="builds" className="ed-wrap py-24 sm:py-32">
      <SectionHead title={builds.headline} intro={builds.intro} />
      <ul className="mt-14 grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
        {builds.cards.slice(0, 6).map((b) => (
          <li key={b.plate}>
            <a href="#programs" className="group block">
              <div className="relative overflow-hidden rounded-[4px]">
                <Plate
                  direction={t.direction}
                  id={b.plate}
                  className="aspect-[3/2] w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                  sizes="(min-width: 1024px) 400px, (min-width: 640px) 50vw, 100vw"
                />
                <span className="absolute top-3 left-3 rounded-[3px] bg-(--bg) px-2 py-1 text-[11px] font-semibold tracking-[0.08em] uppercase">
                  {builds.plateLabel}
                </span>
              </div>
              <h3 className="ed-h3 mt-5">{b.name}</h3>
              <p className="mt-2 text-[16px] text-(--fg-2)">{b.line}</p>
              <p className="mt-3 text-[14px] font-semibold">{b.tag} →</p>
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}

function Facts({ p }: { p: Program }) {
  const rows: [string, React.ReactNode][] = [
    ["Who it's for", p.who],
    ["Format", p.format],
    ["Price", p.price],
  ];
  if (p.nextStart) rows.push(["Next start", p.nextStart]);
  return (
    <dl className="mt-6 grid gap-3 border-t border-(--line) pt-5 text-[15px]">
      {rows.map(([k, v]) => (
        <div key={k} className="grid grid-cols-[7.5rem_1fr] gap-3">
          <dt className="text-(--mute)">{k}</dt>
          <dd
            className={
              k === "Price" || k === "Next start" ? "font-semibold" : ""
            }
          >
            {v}
          </dd>
        </div>
      ))}
    </dl>
  );
}

function Programs({ t }: { t: EditorialTheme }) {
  return (
    <section id="programs" className="bg-(--bg-2) py-24 sm:py-32">
      <div className="ed-wrap">
        <SectionHead
          title={programsIntro.headline}
          intro={programsIntro.intro}
        />

        <div className="mt-16 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h3 className="text-[28px] font-extrabold tracking-[-0.025em]">
              {programsIntro.pathTitle}
            </h3>
            <p className="mt-1 text-(--fg-2)">{programsIntro.pathIntro}</p>
          </div>
          <p className="text-[15px] font-semibold">{programsIntro.fullPath}</p>
        </div>

        <ol className="relative mt-10 grid gap-5 lg:grid-cols-3">
          <span
            aria-hidden
            className="absolute top-[30px] right-[16%] left-[16%] hidden h-[3px] bg-(--fg) lg:block"
          />
          {path.map((p, i) => (
            <li
              key={p.id}
              id={`program-${p.id}`}
              className="relative flex flex-col rounded-[8px] bg-(--card) p-7 shadow-[0_1px_0_rgba(0,0,0,0.06)]"
            >
              <div className="flex items-center justify-between">
                <span className="relative z-10 grid size-[34px] place-items-center rounded-full bg-(--accent) text-[15px] font-extrabold text-(--accent-fg) ring-[3px] ring-(--fg)">
                  {i + 1}
                </span>
                {p.formerly && (
                  <span className="text-[13px] text-(--mute)">
                    Formerly {p.formerly}
                  </span>
                )}
              </div>
              <h4 className="mt-6 text-[26px] font-extrabold leading-[1.05] tracking-[-0.025em]">
                {p.name}
              </h4>
              <p className="mt-3 text-[18px] font-semibold leading-snug">
                {p.line}
              </p>
              <p className="mt-3 text-[15px] text-(--fg-2)">
                {isPlaceholder(p.description) ? (
                  <PlaceholderSlot value={p.description} />
                ) : (
                  p.description
                )}{" "}
                {p.descriptionNote && (
                  <PlaceholderSlot value={p.descriptionNote} />
                )}
              </p>
              <Facts p={p} />
              <div className="mt-auto flex flex-wrap gap-2 pt-7">
                <a
                  href={p.buttons[0].href}
                  className="ed-btn ed-btn-strong h-11! px-4! text-[15px]!"
                >
                  {p.buttons[0].label}
                </a>
                <a
                  href={p.buttons[1].href}
                  className="ed-btn ed-btn-line h-11! px-4! text-[15px]!"
                >
                  {p.buttons[1].label}
                </a>
              </div>
            </li>
          ))}
        </ol>
        <p className="mt-6 text-[15px] text-(--fg-2)">
          {programsIntro.certification}
        </p>

        <h3 className="mt-20 text-[28px] font-extrabold tracking-[-0.025em]">
          {programsIntro.rolesTitle}
        </h3>
        <article className="mt-6 grid overflow-hidden rounded-[8px] bg-(--card) lg:grid-cols-2">
          <div className="p-7 sm:p-10">
            <h4 className="text-[30px] font-extrabold leading-[1.05] tracking-[-0.025em]">
              {champions.name}
            </h4>
            <p className="mt-3 text-[18px] font-semibold">{champions.line}</p>
            <p className="mt-3 text-[15px] text-(--fg-2)">
              {champions.description as string}
            </p>
            <Facts p={champions} />
            <div className="mt-7 flex flex-wrap gap-2">
              <a
                href={champions.buttons[0].href}
                className="ed-btn ed-btn-strong h-11! px-4! text-[15px]!"
              >
                {champions.buttons[0].label}
              </a>
              <a
                href={champions.buttons[1].href}
                className="ed-btn ed-btn-line h-11! px-4! text-[15px]!"
              >
                {champions.buttons[1].label}
              </a>
            </div>
          </div>
          <Plate
            direction={t.direction}
            id={champions.plate}
            className="h-full min-h-72 w-full object-cover"
            sizes="(min-width: 1024px) 600px, 100vw"
          />
        </article>

        <p className="mt-10 flex items-center gap-3 text-[16px] font-semibold">
          <span
            className="grid size-6 place-items-center rounded-full bg-(--accent) text-[13px] text-(--accent-fg)"
            aria-hidden
          >
            ✓
          </span>
          {programsIntro.refund}
        </p>
      </div>
    </section>
  );
}

function Free({ t }: { t: EditorialTheme }) {
  return (
    <section id="free" className="ed-wrap py-24 sm:py-32">
      <div className="grid gap-14 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <div className="lg:sticky lg:top-28">
            <SectionHead title={free.headline} intro={free.intro} />
            <Plate
              direction={t.direction}
              id="step-tracker"
              className="mt-10 w-full rounded-[4px]"
              sizes="(min-width: 1024px) 480px, 100vw"
            />
            <p className="mt-3 text-[13px] text-(--mute)">
              {builds.plateLabel} from Claw Camp
            </p>
          </div>
        </div>
        <div className="lg:col-span-7">
          <ul className="border-t border-(--fg)">
            {free.programs.map((p) => (
              <li key={p.id} className="border-b border-(--line)">
                <a
                  href={p.href}
                  className="group grid gap-2 py-7 sm:grid-cols-[1fr_auto] sm:gap-8"
                >
                  <div>
                    <div className="flex flex-wrap items-center gap-3">
                      <h3 className="ed-h3 group-hover:underline group-hover:decoration-(--accent) group-hover:decoration-[3px] group-hover:underline-offset-4">
                        {p.name}
                      </h3>
                      <span className="rounded-[3px] bg-(--accent) px-1.5 py-0.5 text-(--accent-fg) text-[11px] font-bold tracking-[0.08em] uppercase">
                        Free
                      </span>
                    </div>
                    <p className="mt-2 text-[17px]">{p.line}</p>
                    {p.who && (
                      <p className="mt-2 text-[15px] text-(--fg-2)">{p.who}</p>
                    )}
                    <p className="mt-2 text-[14px] text-(--mute)">{p.format}</p>
                  </div>
                  <div className="text-[14px] sm:text-right">
                    {isPlaceholder(p.status) ? (
                      <PlaceholderSlot value={p.status} />
                    ) : (
                      <span className="inline-flex items-center gap-2 font-semibold">
                        <span
                          className="size-2 rounded-full bg-[#2f9e5b]"
                          aria-hidden
                        />
                        {p.status}
                      </span>
                    )}
                  </div>
                </a>
              </li>
            ))}
          </ul>
          <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
            <a href={free.button.href} className="ed-btn ed-btn-strong">
              {free.button.label}
            </a>
            <p className="text-[14px] text-(--mute)">{free.contact}</p>
          </div>
        </div>
      </div>
    </section>
  );
}

function Subscription({ t }: { t: EditorialTheme }) {
  return (
    <section id="subscription" className="bg-(--bg-2) py-24 sm:py-32">
      <div className="ed-wrap grid items-center gap-12 lg:grid-cols-12">
        <div className="order-2 lg:order-1 lg:col-span-6">
          <Plate
            direction={t.direction}
            id={subscription.plate}
            className="w-full rounded-[4px]"
            sizes="(min-width: 1024px) 600px, 100vw"
          />
        </div>
        <div className="order-1 lg:order-2 lg:col-span-6">
          <div className="ed-label text-(--mute)">{subscription.name}</div>
          <h2 className="ed-h2 mt-4">{subscription.headline}</h2>
          <p className="mt-6 text-[18px] text-(--fg-2)">{subscription.copy}</p>
          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            {subscription.tiers.map((t) => (
              <div key={t.name} className="rounded-[8px] bg-(--card) p-6">
                <div className="flex items-baseline justify-between">
                  <h3 className="ed-h3">{t.name}</h3>
                  <span className="font-semibold">{t.price}</span>
                </div>
                <ul className="mt-4 grid gap-2 text-[15px] text-(--fg-2)">
                  {t.items.map((it) => (
                    <li key={it} className="flex gap-2.5">
                      <span
                        className="mt-[9px] size-1.5 shrink-0 rounded-full bg-(--fg)"
                        aria-hidden
                      />
                      {it}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <a
            href={subscription.button.href}
            className="ed-btn ed-btn-strong mt-8"
          >
            {subscription.button.label}
          </a>
        </div>
      </div>
    </section>
  );
}

function RouteMap() {
  return (
    <section className="ed-wrap py-24 sm:py-32">
      <SectionHead title={routeMap.headline} intro={routeMap.intro} />
      <div className="mt-12 overflow-x-auto">
        <table className="w-full min-w-[760px] border-collapse text-left">
          <thead>
            <tr className="border-b-2 border-(--fg)">
              {routeMap.columns.map((c) => (
                <th
                  key={c}
                  scope="col"
                  className="ed-label pb-4 font-semibold text-(--mute)"
                >
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {routeMap.rows.map(([goal, ...stops]) => (
              <tr
                key={goal}
                className="border-b border-(--line) transition-colors hover:bg-(--bg-2)"
              >
                <th
                  scope="row"
                  className="py-6 pr-6 align-top text-[19px] font-bold tracking-[-0.01em]"
                >
                  {goal}
                </th>
                {stops.map((s, i) => (
                  <td key={s} className="py-6 pr-6 align-top">
                    <a
                      href="#programs"
                      className="inline-flex items-start gap-3 text-[16px] hover:underline"
                    >
                      <span
                        aria-hidden
                        className={`mt-[3px] size-3.5 shrink-0 rounded-full border-2 border-(--fg) ${i === 0 ? "bg-(--bg)" : i === 1 ? "bg-(--accent)" : "bg-(--fg)"}`}
                      />
                      {s}
                    </a>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function Teams({ t }: { t: EditorialTheme }) {
  return (
    <section
      id="teams"
      className="ed-band bg-(--band) py-24 text-(--band-fg) sm:py-32"
    >
      <div className="ed-wrap">
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-6">
            <h2 className="ed-h2">{teams.headline}</h2>
            <p className="mt-6 text-[18px] text-(--band-mute)">{teams.copy}</p>
            <div className="mt-9 flex flex-wrap gap-3">
              <a href={teams.buttons[0].href} className="ed-btn ed-btn-accent">
                {teams.buttons[0].label}
              </a>
              <a href={teams.buttons[1].href} className="ed-btn ed-btn-line">
                {teams.buttons[1].label}
              </a>
            </div>
          </div>
          <div className="lg:col-span-6">
            <Plate
              direction={t.direction}
              id={teams.plate}
              className="w-full rounded-[4px]"
              sizes="(min-width: 1024px) 600px, 100vw"
            />
          </div>
        </div>
        <div className="mt-20 grid gap-12 lg:grid-cols-12">
          <dl className="grid gap-8 sm:grid-cols-2 lg:col-span-7">
            {teams.how.map((h) => (
              <div key={h.title} className="border-t border-(--band-line) pt-5">
                <dt className="text-[19px] font-bold">{h.title}</dt>
                <dd className="mt-2 text-[16px] text-(--band-mute)">
                  {h.body}
                </dd>
              </div>
            ))}
          </dl>
          <div className="lg:col-span-5">
            <h3 className="ed-label text-(--band-mute)">Who takes what</h3>
            <ul className="mt-4">
              {teams.whoTakesWhat.map(([who, what]) => (
                <li
                  key={who}
                  className="grid grid-cols-2 gap-4 border-b border-(--band-line) py-3 text-[15px]"
                >
                  <span className="text-(--band-mute)">{who}</span>
                  <span className="font-semibold">{what}</span>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-[15px] text-(--band-mute)">
              {teams.note}{" "}
              <a
                href={teams.features.href}
                className="ed-link text-(--band-fg)"
              >
                {teams.features.label}
              </a>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function Champions({ t }: { t: EditorialTheme }) {
  return (
    <section
      id="champions"
      className="bg-(--feature) py-24 text-(--feature-fg) sm:py-32"
    >
      <div className="ed-wrap grid items-start gap-12 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <h2 className="ed-h2">{championsBand.headline}</h2>
          <p className="mt-6 max-w-2xl text-[18px]">{championsBand.copy}</p>
          <ul className="mt-8 grid gap-2.5 text-[16px]">
            {championsBand.facts.map((f) => (
              <li key={f} className="flex gap-3">
                <span
                  className="mt-[10px] h-[2px] w-4 shrink-0 bg-(--fg)"
                  aria-hidden
                />
                {f}
              </li>
            ))}
          </ul>
          <div className="mt-9 flex flex-wrap gap-3">
            <a
              href={championsBand.buttons[0].href}
              className="ed-btn ed-btn-strong"
            >
              {championsBand.buttons[0].label}
            </a>
            <a
              href={championsBand.buttons[1].href}
              className="ed-btn ed-btn-line"
            >
              {championsBand.buttons[1].label}
            </a>
          </div>
        </div>
        <div className="lg:col-span-5">
          <Plate
            direction={t.direction}
            id={championsBand.plate}
            className="w-full rounded-[4px] shadow-[0_30px_60px_-30px_rgba(0,0,0,0.5)]"
            sizes="(min-width: 1024px) 500px, 100vw"
          />
          <p className="mt-3 text-[13px]">
            {builds.plateLabel} from the AI Champions Bootcamp
          </p>
        </div>
      </div>
    </section>
  );
}

function Method() {
  return (
    <section className="ed-wrap py-24 sm:py-32">
      <SectionHead title={method.headline} />
      <ol className="mt-14 grid gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
        {method.points.map((p, i) => (
          <li key={p.title} className="border-t-2 border-(--fg) pt-6">
            <span className="text-[44px] leading-none font-extrabold tracking-[-0.04em]">
              {i + 1}
            </span>
            <h3 className="ed-h3 mt-5">{p.title}</h3>
            <p className="mt-2 text-[16px] text-(--fg-2)">{p.body}</p>
          </li>
        ))}
      </ol>
      <div className="mt-16 rounded-[8px] bg-(--bg-2) p-6 sm:p-8">
        <p className="text-[14px] font-semibold">
          One build, week by week, in AI & Agents Professional
        </p>
        <ol className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {method.weeks.map((w, i) => (
            <li key={w.week} className="flex items-center gap-3">
              <span className="flex gap-1" aria-hidden>
                {method.weeks.map((_, j) => (
                  <span
                    key={j}
                    className={`h-6 w-2 rounded-[2px] ${j <= i ? "bg-(--fg)" : "bg-(--line)"}`}
                  />
                ))}
              </span>
              <span className="text-[15px]">
                <span className="font-semibold">{w.week}</span> · {w.label}
              </span>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

function Proof() {
  return (
    <section className="border-y border-(--line) bg-(--bg-2) py-20">
      <div className="ed-wrap grid gap-12 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <h2 className="text-[28px] font-extrabold tracking-[-0.025em]">
            {proof.headline}
          </h2>
          <dl className="mt-8 grid grid-cols-2 gap-6">
            {proof.numbers.map((n) => (
              <div key={n.label}>
                <dt className="sr-only">{n.label}</dt>
                <dd>
                  <span className="block text-[44px] leading-none font-extrabold tracking-[-0.04em]">
                    {n.value}
                  </span>
                  <span className="mt-2 block text-[14px] text-(--fg-2)">
                    {n.label}
                  </span>
                </dd>
              </div>
            ))}
          </dl>
        </div>
        <ul className="flex flex-wrap content-start gap-x-8 gap-y-4 text-[22px] font-bold tracking-[-0.02em] text-(--mute) lg:col-span-8">
          {proof.logos.map((l) => (
            <li key={l}>{l}</li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function Faq() {
  return (
    <section className="ed-wrap grid gap-12 py-24 sm:py-32 lg:grid-cols-12">
      <h2 className="ed-h2 lg:col-span-4">{faq.headline}</h2>
      <div className="border-t border-(--fg) lg:col-span-8">
        {faq.items.map((item) => (
          <details key={item.q} className="group border-b border-(--line)">
            <summary className="flex items-center justify-between gap-6 py-5 text-[18px] font-semibold">
              {item.q}
              <span
                className="ed-plus text-[24px] leading-none font-normal transition-transform"
                aria-hidden
              >
                +
              </span>
            </summary>
            <p className="max-w-2xl pb-6 text-[16px] text-(--fg-2)">{item.a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}

function Closing() {
  return (
    <section className="ed-band bg-(--band) py-28 text-(--band-fg) sm:py-36">
      <div className="ed-wrap text-center">
        <h2 className="ed-display mx-auto max-w-5xl text-[clamp(2.75rem,6.4vw,6rem)]!">
          {closing.headline}
        </h2>
        <p className="mt-6 text-[19px] text-(--band-mute)">{closing.line}</p>
        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <a href={closing.buttons[0].href} className="ed-btn ed-btn-accent">
            {closing.buttons[0].label}
          </a>
          <a href={closing.buttons[1].href} className="ed-btn ed-btn-line">
            {closing.buttons[1].label}
          </a>
        </div>
      </div>
    </section>
  );
}

function Footer({ t }: { t: EditorialTheme }) {
  return (
    <footer className="ed-wrap py-16">
      <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.4fr_repeat(4,1fr)]">
        <div>
          <Logo tone={t.logo} width={150} />
          <p className="mt-4 text-[14px] text-(--mute)">{footer.line}</p>
        </div>
        {[
          footer.columns.slice(0, 2),
          footer.columns.slice(2, 4),
          footer.columns.slice(4, 6),
          footer.columns.slice(6),
        ].map((group, i) => (
          <div key={i} className="grid content-start gap-8">
            {group.map((col) => (
              <div key={col.title}>
                <h3 className="text-[13px] font-bold">{col.title}</h3>
                <ul className="mt-3 grid gap-2 text-[14px] text-(--fg-2)">
                  {col.links.map((l) => (
                    <li key={l}>
                      <a href="#" className="hover:underline">
                        {l}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        ))}
      </div>
    </footer>
  );
}
