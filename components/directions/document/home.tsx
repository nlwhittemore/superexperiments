import {
  builds,
  champions,
  championsBand,
  closing,
  faq,
  finder,
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
} from "@/content/homepage";
import { Logo } from "@/components/site/logo";
import { Plate } from "@/components/site/plate";
import { PlaceholderSlot } from "@/components/site/placeholder";
import { DirectionBar } from "@/components/site/direction-bar";
import { DocumentFinder } from "./finder";
import { splitHeadline, type DocumentTheme } from "../theme";
import { Illustration } from "@/components/site/illustration";
import { Spark } from "@/components/site/spark";

export function DocumentHome({ theme: t }: { theme: DocumentTheme }) {
  return (
    <>
      <DirectionBar current={t.direction} />
      <Header t={t} />
      <main>
        <Hero t={t} />
        <Section n="01" title="Finder" id="finder">
          <div className="grid items-end gap-6 md:grid-cols-[1fr_17rem]">
            <div>
              <Head title={finder.headline} intro={finder.intro} />
            </div>
            {t.ills?.finder && (
              <Illustration
                direction={t.direction}
                name={t.ills.finder}
                sizes="272px"
                className="hidden w-full md:block"
              />
            )}
          </div>
          <div className="mt-10">
            <DocumentFinder direction={t.direction} />
          </div>
        </Section>
        <Builds t={t} />
        <Programs t={t} />
        <Free />
        <Subscription t={t} />
        <RouteMap />
        <Teams t={t} />
        <Champions t={t} />
        <Method t={t} />
        <Proof />
        <Faq />
        <Closing t={t} />
      </main>
      <Footer t={t} />
    </>
  );
}

function Header({ t }: { t: DocumentTheme }) {
  return (
    <header className="sticky top-0 z-30 border-b border-(--line) bg-(--bg)/90 backdrop-blur-md">
      <div className="doc-wrap flex h-16 items-center gap-8">
        <a href="#" aria-label="Superintelligent home" className="mr-auto">
          <Logo tone={t.logo} width={156} />
        </a>
        <ul className="hidden items-center gap-6 text-[14px] text-(--fg-2) lg:flex">
          {nav.links.map((l) => (
            <li key={l.label}>
              <a href={l.href} className="hover:text-(--fg)">
                {l.label}
              </a>
            </li>
          ))}
        </ul>
        <div className="flex items-center gap-4 text-[14px]">
          <a
            href={nav.login.href}
            className="hidden text-(--fg-2) hover:text-(--fg) sm:block"
          >
            {nav.login.label}
          </a>
          <a
            href={nav.cta.href}
            className="doc-btn doc-btn-accent h-9! px-3.5! text-[14px]!"
          >
            {nav.cta.label}
          </a>
        </div>
      </div>
    </header>
  );
}

function Hero({ t }: { t: DocumentTheme }) {
  const { before, after } = splitHeadline(t.headline);
  return (
    <section className="doc-wrap pt-16 sm:pt-24">
      <div className="flex items-start justify-between gap-8">
        <h1 className="doc-display max-w-[15ch]">
          {before}
          <span className="doc-em">{t.headline.emphasis}</span>
          {after}
        </h1>
        {t.sparks && (
          <div
            aria-hidden
            className="relative mt-4 hidden size-44 shrink-0 lg:block"
          >
            <Spark size={112} className="doc-twinkle absolute top-6 right-8" />
            <Spark size={40} className="doc-twinkle absolute top-0 right-0" />
            <Spark size={26} className="doc-twinkle absolute bottom-2 left-6" />
          </div>
        )}
      </div>
      <div className="mt-12 grid gap-10 border-t border-(--line) pt-8 lg:grid-cols-12">
        <p className="text-[18px] leading-[1.55] text-(--fg-2) lg:col-span-6">
          {hero.subhead}
        </p>
        <div className="lg:col-span-5 lg:col-start-8">
          <div className="flex flex-wrap gap-2">
            <a href={hero.primary.href} className="doc-btn doc-btn-accent">
              {hero.primary.label} <span className="doc-arrow">→</span>
            </a>
            <a href={hero.secondary.href} className="doc-btn doc-btn-line">
              {hero.secondary.label}
            </a>
          </div>
          <table className="mt-8 w-full text-[13px]">
            <caption className="doc-label pb-2 text-left text-(--mute)">
              Starting soon
            </caption>
            <tbody>
              {upcomingStarts().map((s) => (
                <tr key={s.program} className="border-t border-(--line)">
                  <td className="py-2 pr-4">
                    <span className="inline-flex items-center gap-2">
                      {t.sparks && <Spark size={9} />}
                      {s.program}
                    </span>
                  </td>
                  <td className="doc-mono py-2 text-right text-(--mute)">
                    {s.label}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <figure className="mt-14 sm:mt-20">
        <div className="overflow-hidden rounded-[6px] bg-(--accent-50)">
          <Plate
            direction={t.direction}
            id={hero.plate}
            eager
            className="w-full"
            sizes="(min-width: 1280px) 1200px, 100vw"
          />
        </div>
        <figcaption className="doc-label mt-3 flex justify-between text-(--mute)">
          <span>Fig. 01</span>
          <span>{hero.caption}</span>
        </figcaption>
      </figure>
    </section>
  );
}

function Section({
  n,
  title,
  id,
  children,
  className = "",
}: {
  n: string;
  title: string;
  id?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      id={id}
      className={`mt-24 border-t border-(--line) sm:mt-32 ${className}`}
    >
      <div className="doc-wrap grid gap-6 py-8 lg:grid-cols-12 lg:gap-8">
        <div className="min-w-0 lg:col-span-3">
          <div className="doc-label flex gap-3 text-(--mute) lg:sticky lg:top-24">
            <span className="doc-rail-n text-(--fg)">{n}</span>
            {title}
          </div>
        </div>
        <div className="min-w-0 lg:col-span-9">{children}</div>
      </div>
    </section>
  );
}

function Head({ title, intro }: { title: string; intro?: string }) {
  return (
    <>
      <h2 className="doc-h2 max-w-3xl">{title}</h2>
      {intro && (
        <p className="mt-4 max-w-2xl text-[18px] text-(--fg-2)">{intro}</p>
      )}
    </>
  );
}

function Builds({ t }: { t: DocumentTheme }) {
  return (
    <Section n="02" title="What people build" id="builds">
      <Head title={builds.headline} intro={builds.intro} />
      <ul className="mt-12 grid gap-x-6 gap-y-14 md:grid-cols-2">
        {builds.cards.slice(0, 6).map((b, i) => (
          <li key={b.plate}>
            <a href="#programs" className="group block">
              <div className="overflow-hidden rounded-[6px] bg-(--grey)">
                <Plate
                  direction={t.direction}
                  id={b.plate}
                  className="aspect-[3/2] w-full object-cover transition-transform duration-500 group-hover:scale-[1.015]"
                  sizes="(min-width: 1024px) 460px, (min-width: 768px) 50vw, 100vw"
                />
              </div>
              <div className="doc-label mt-4 flex justify-between text-(--mute)">
                <span>Fig. {String(i + 2).padStart(2, "0")}</span>
                <span>{builds.plateLabel}</span>
              </div>
              <h3 className="doc-h3 mt-3">{b.name}</h3>
              <p className="mt-2 text-(--fg-2)">{b.line}</p>
              <p className="mt-3 text-[14px] text-(--accent)">
                {b.tag} <span className="doc-arrow inline-block">→</span>
              </p>
            </a>
          </li>
        ))}
      </ul>
    </Section>
  );
}

const ROWS = [
  ["Who it's for", "who"],
  ["Format", "format"],
  ["Price", "price"],
  ["Next start", "nextStart"],
] as const;

function Programs({ t }: { t: DocumentTheme }) {
  return (
    <Section n="03" title="Programs" id="programs">
      <Head title={programsIntro.headline} intro={programsIntro.intro} />

      <div className="mt-14 flex flex-wrap items-baseline justify-between gap-3">
        <h3 className="doc-h3">
          {programsIntro.pathTitle}{" "}
          <span className="font-normal text-(--mute)">
            · {programsIntro.pathIntro}
          </span>
        </h3>
      </div>

      <div className="mt-6 overflow-x-auto">
        <table className="w-full min-w-[820px] table-fixed border-collapse text-left text-[14px]">
          <colgroup>
            <col className="w-[9.5rem]" />
            <col />
            <col />
            <col />
          </colgroup>
          <thead>
            <tr>
              <th />
              {path.map((p, i) => (
                <th
                  key={p.id}
                  id={`program-${p.id}`}
                  className="border-l border-(--line) px-5 pb-5 align-bottom font-normal"
                >
                  {t.ills?.levels && (
                    <Illustration
                      direction={t.direction}
                      name={t.ills.levels[i]}
                      sizes="260px"
                      className="mb-2 w-full"
                    />
                  )}
                  <div className="flex items-center gap-2">
                    <span className="doc-mono grid size-6 place-items-center rounded-[3px] bg-(--accent) text-[11px] text-(--accent-fg)">
                      L{i + 1}
                    </span>
                    <span className="h-px flex-1 bg-(--accent)" aria-hidden />
                  </div>
                  <div className="mt-4 text-[22px] leading-tight font-semibold tracking-[-0.025em]">
                    {p.name}
                  </div>
                  <div className="mt-1 h-5 text-[12px] text-(--mute)">
                    {p.formerly ? `Formerly ${p.formerly}` : ""}
                  </div>
                  <p className="mt-3 text-[16px] leading-snug font-medium">
                    {p.line}
                  </p>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr className="border-t border-(--line)">
              <th
                scope="row"
                className="doc-label py-4 pr-4 align-top font-normal text-(--mute)"
              >
                What you build
              </th>
              {path.map((p) => (
                <td
                  key={p.id}
                  className="border-l border-(--line) px-5 py-4 align-top text-(--fg-2)"
                >
                  {isPlaceholder(p.description) ? (
                    <PlaceholderSlot value={p.description} />
                  ) : (
                    p.description
                  )}{" "}
                  {p.descriptionNote && (
                    <PlaceholderSlot value={p.descriptionNote} />
                  )}
                </td>
              ))}
            </tr>
            {ROWS.map(([label, key]) => (
              <tr key={key} className="border-t border-(--line)">
                <th
                  scope="row"
                  className="doc-label py-4 pr-4 align-top font-normal text-(--mute)"
                >
                  {label}
                </th>
                {path.map((p) => (
                  <td
                    key={p.id}
                    className={`border-l border-(--line) px-5 py-4 align-top ${key === "price" || key === "nextStart" ? "font-medium" : "text-(--fg-2)"}`}
                  >
                    {p[key] ?? (
                      <span className="text-(--mute)">Start any time</span>
                    )}
                  </td>
                ))}
              </tr>
            ))}
            <tr className="border-t border-(--line)">
              <th />
              {path.map((p) => (
                <td key={p.id} className="border-l border-(--line) px-5 py-5">
                  <div className="flex flex-wrap gap-2">
                    <a
                      href={p.buttons[0].href}
                      className="doc-btn doc-btn-strong h-10! px-3.5! text-[14px]!"
                    >
                      {p.buttons[0].label}
                    </a>
                    <a
                      href={p.buttons[1].href}
                      className="doc-btn doc-btn-line h-10! px-3.5! text-[14px]!"
                    >
                      {p.buttons[1].label}
                    </a>
                  </div>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
      <div className="mt-6 grid gap-3 rounded-[6px] bg-(--grey) p-5 text-[14px] sm:grid-cols-2">
        <p className="font-medium">{programsIntro.fullPath}</p>
        <p className="text-(--fg-2)">{programsIntro.certification}</p>
      </div>

      <h3 className="doc-h3 mt-16">{programsIntro.rolesTitle}</h3>
      <article className="mt-5 grid overflow-hidden rounded-[6px] border border-(--line) lg:grid-cols-2">
        <div className="p-6 sm:p-8">
          <div className="text-[24px] font-semibold tracking-[-0.025em]">
            {champions.name}
          </div>
          <p className="mt-2 text-[16px] font-medium">{champions.line}</p>
          <p className="mt-3 text-[14px] text-(--fg-2)">
            {champions.description as string}
          </p>
          <dl className="mt-5 grid gap-2 text-[14px]">
            {ROWS.map(([label, key]) => (
              <div
                key={key}
                className="grid grid-cols-[8rem_1fr] gap-3 border-t border-(--line) pt-2"
              >
                <dt className="doc-label pt-0.5 text-(--mute)">{label}</dt>
                <dd>{champions[key]}</dd>
              </div>
            ))}
          </dl>
          <div className="mt-6 flex flex-wrap gap-2">
            <a
              href={champions.buttons[0].href}
              className="doc-btn doc-btn-strong h-10! px-3.5! text-[14px]!"
            >
              {champions.buttons[0].label}
            </a>
            <a
              href={champions.buttons[1].href}
              className="doc-btn doc-btn-line h-10! px-3.5! text-[14px]!"
            >
              {champions.buttons[1].label}
            </a>
          </div>
        </div>
        <div className="flex items-center bg-(--grey)">
          {t.ills?.champions ? (
            <Illustration
              direction={t.direction}
              name={t.ills.champions}
              className="w-full"
            />
          ) : (
            <Plate
              direction={t.direction}
              id={champions.plate}
              className="w-full"
              sizes="(min-width: 1024px) 460px, 100vw"
            />
          )}
        </div>
      </article>
      <p className="mt-8 flex items-center gap-3 text-[15px]">
        <span className="doc-label rounded-[3px] bg-(--accent-50) px-2 py-1 text-(--accent)">
          Refund
        </span>
        {programsIntro.refund}
      </p>
    </Section>
  );
}

function Free() {
  return (
    <Section n="04" title="Free programs" id="free">
      <Head title={free.headline} intro={free.intro} />
      <ul className="mt-10 border-b border-(--line)">
        {free.programs.map((p) => (
          <li key={p.id} className="border-t border-(--line)">
            <a
              href={p.href}
              className="group grid gap-x-8 gap-y-2 py-6 md:grid-cols-[14rem_1fr_9rem]"
            >
              <div>
                <div className="font-semibold tracking-[-0.01em] group-hover:text-(--accent)">
                  {p.name}
                </div>
                <span className="doc-label mt-2 inline-block rounded-[3px] bg-(--accent-50) px-1.5 py-0.5 text-[10.5px] text-(--accent)">
                  Free
                </span>
              </div>
              <div>
                <p>{p.line}</p>
                <p className="mt-1 text-[14px] text-(--mute)">
                  {p.who ? `${p.who} ` : ""}
                  {p.format}
                </p>
              </div>
              <div className="text-[13px] md:text-right">
                {isPlaceholder(p.status) ? (
                  <PlaceholderSlot value={p.status} />
                ) : (
                  <span className="doc-label inline-flex items-center gap-2">
                    <span
                      className="size-1.5 rounded-full bg-[#16a34a]"
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
      <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
        <a href={free.button.href} className="doc-btn doc-btn-line">
          {free.button.label} <span className="doc-arrow">→</span>
        </a>
        <p className="text-[14px] text-(--mute)">{free.contact}</p>
      </div>
    </Section>
  );
}

function Subscription({ t }: { t: DocumentTheme }) {
  return (
    <Section n="05" title="Subscription" id="subscription">
      <div className="doc-label text-(--mute)">{subscription.name}</div>
      <h2 className="doc-h2 mt-3 max-w-3xl">{subscription.headline}</h2>
      <p className="mt-4 max-w-2xl text-[18px] text-(--fg-2)">
        {subscription.copy}
      </p>
      <div className="mt-10 grid gap-6 lg:grid-cols-2">
        <div className="self-start overflow-hidden rounded-[6px] bg-(--accent-50)">
          {t.ills?.subscription ? (
            <Illustration
              direction={t.direction}
              name={t.ills.subscription}
              className="w-full"
            />
          ) : (
            <Plate
              direction={t.direction}
              id={subscription.plate}
              className="w-full"
              sizes="(min-width: 1024px) 460px, 100vw"
            />
          )}
        </div>
        <div className="grid gap-4">
          {subscription.tiers.map((t) => (
            <div
              key={t.name}
              className="rounded-[6px] border border-(--line) p-6"
            >
              <div className="flex items-baseline justify-between">
                <h3 className="doc-h3">{t.name}</h3>
                <span className="doc-mono text-[14px]">{t.price}</span>
              </div>
              <ul className="mt-4 grid gap-2 text-[14px] text-(--fg-2)">
                {t.items.map((it) => (
                  <li key={it} className="flex gap-3">
                    <span className="text-(--accent)" aria-hidden>
                      +
                    </span>
                    {it}
                  </li>
                ))}
              </ul>
            </div>
          ))}
          <a
            href={subscription.button.href}
            className="doc-btn doc-btn-accent justify-self-start"
          >
            {subscription.button.label}
          </a>
        </div>
      </div>
    </Section>
  );
}

function RouteMap() {
  return (
    <Section n="06" title="Route map">
      <Head title={routeMap.headline} intro={routeMap.intro} />
      <div className="mt-10 overflow-x-auto">
        <table className="w-full min-w-[720px] border-collapse text-left text-[15px]">
          <thead>
            <tr>
              {routeMap.columns.map((c, i) => (
                <th
                  key={c}
                  scope="col"
                  className="doc-label pb-3 font-normal text-(--mute)"
                >
                  {i > 0 && <span className="mr-1.5 text-(--fg)">{i}</span>}
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {routeMap.rows.map(([goal, ...stops]) => (
              <tr
                key={goal}
                className="group border-t border-(--line) hover:bg-(--accent-50)"
              >
                <th scope="row" className="py-4 pr-4 pl-2 font-semibold">
                  {goal}
                </th>
                {stops.map((s, i) => (
                  <td key={s} className="py-4 pr-4">
                    <a
                      href="#programs"
                      className="inline-flex items-center gap-2.5 hover:text-(--accent)"
                    >
                      <span
                        aria-hidden
                        className={`size-2.5 shrink-0 rounded-full ${i === 0 ? "border-[1.5px] border-(--accent)" : i === 1 ? "bg-(--accent)" : "bg-(--fg)"}`}
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
    </Section>
  );
}

function Teams({ t }: { t: DocumentTheme }) {
  return (
    <section
      id="teams"
      className="mt-24 bg-(--feature) text-(--feature-fg) sm:mt-32"
    >
      <div className="doc-wrap grid gap-6 py-20 sm:py-28 lg:grid-cols-12 lg:gap-8">
        <div className="doc-label flex gap-3 text-(--feature-fg)/70 lg:col-span-3">
          <span className="text-(--feature-fg)">07</span>For teams
        </div>
        <div className="lg:col-span-9">
          <h2 className="doc-h2 max-w-3xl">{teams.headline}</h2>
          <p className="mt-4 max-w-2xl text-[18px] text-(--feature-fg)/80">
            {teams.copy}
          </p>
          <div className="mt-8 flex flex-wrap gap-2">
            <a
              href={teams.buttons[0].href}
              className="doc-btn doc-btn-on-feature"
            >
              {teams.buttons[0].label}
            </a>
            <a
              href={teams.buttons[1].href}
              className="doc-btn doc-btn-ghost-on-feature"
            >
              {teams.buttons[1].label}
            </a>
          </div>
          <div className="mt-14 overflow-hidden rounded-[6px] bg-(--feature-fg)/10">
            <Plate
              direction={t.direction}
              id={teams.plate}
              className="w-full"
              sizes="(min-width: 1280px) 900px, 100vw"
            />
          </div>
          <div className="mt-14 grid gap-10 lg:grid-cols-2">
            <dl className="grid gap-6">
              {teams.how.map((h) => (
                <div
                  key={h.title}
                  className="border-t border-(--feature-fg)/25 pt-4"
                >
                  <dt className="font-semibold">{h.title}</dt>
                  <dd className="mt-1 text-[15px] text-(--feature-fg)/75">
                    {h.body}
                  </dd>
                </div>
              ))}
            </dl>
            <div>
              <h3 className="doc-label text-(--feature-fg)/70">
                Who takes what
              </h3>
              <ul className="mt-3">
                {teams.whoTakesWhat.map(([who, what]) => (
                  <li
                    key={who}
                    className="grid grid-cols-2 gap-4 border-t border-(--feature-fg)/25 py-3 text-[14px]"
                  >
                    <span className="text-(--feature-fg)/75">{who}</span>
                    <span className="font-medium">{what}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-3 text-[14px] text-(--feature-fg)/75">
                {teams.note}{" "}
                <a
                  href={teams.features.href}
                  className="text-(--feature-fg) underline underline-offset-4"
                >
                  {teams.features.label}
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Champions({ t }: { t: DocumentTheme }) {
  return (
    <Section
      n="08"
      title="Champions"
      id="champions"
      className="mt-0! border-t-0!"
    >
      <div className="grid gap-10 lg:grid-cols-2">
        <div>
          <h2 className="doc-h2">{championsBand.headline}</h2>
          <p className="mt-4 text-[17px] text-(--fg-2)">{championsBand.copy}</p>
          <div className="mt-8 flex flex-wrap gap-2">
            <a
              href={championsBand.buttons[0].href}
              className="doc-btn doc-btn-accent"
            >
              {championsBand.buttons[0].label}
            </a>
            <a
              href={championsBand.buttons[1].href}
              className="doc-btn doc-btn-line"
            >
              {championsBand.buttons[1].label}
            </a>
          </div>
        </div>
        <div>
          <ul className="border-b border-(--line) text-[15px]">
            {championsBand.facts.map((f) => (
              <li key={f} className="border-t border-(--line) py-3">
                {f}
              </li>
            ))}
          </ul>
          <div className="mt-6 overflow-hidden rounded-[6px] bg-(--grey)">
            <Plate
              direction={t.direction}
              id={championsBand.plate}
              className="w-full"
              sizes="(min-width: 1024px) 460px, 100vw"
            />
          </div>
        </div>
      </div>
    </Section>
  );
}

function Method({ t }: { t: DocumentTheme }) {
  return (
    <Section n="09" title="Method">
      <Head title={method.headline} />
      {t.ills?.method && (
        <Illustration
          direction={t.direction}
          name={t.ills.method}
          sizes="(min-width: 1024px) 860px, 100vw"
          className="mt-6 w-full"
        />
      )}
      <ol className="mt-10 grid gap-px overflow-hidden rounded-[6px] border border-(--line) bg-(--line) sm:grid-cols-2">
        {method.points.map((p, i) => (
          <li key={p.title} className="bg-(--bg) p-6 sm:p-8">
            <span className="doc-mono text-[13px] text-(--accent)">
              {String(i + 1).padStart(2, "0")}
            </span>
            <h3 className="doc-h3 mt-6">{p.title}</h3>
            <p className="mt-2 text-[15px] text-(--fg-2)">{p.body}</p>
          </li>
        ))}
      </ol>
      <div className="mt-6">
        <div className="doc-label text-(--mute)">
          One build, week by week · AI & Agents Professional
        </div>
        <ol className="mt-3 grid grid-cols-4 gap-1.5">
          {method.weeks.map((w, i) => (
            <li key={w.week}>
              <div
                className="h-1.5 rounded-full bg-(--accent)"
                style={{ opacity: 0.35 + i * 0.22 }}
              />
              <div className="mt-2 text-[13px]">
                <span className="doc-mono text-(--mute)">{w.week}</span>
                <span className="block">{w.label}</span>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </Section>
  );
}

function Proof() {
  return (
    <Section n="10" title="Proof">
      <h2 className="doc-h3 text-(--mute)">{proof.headline}</h2>
      <ul className="mt-6 grid grid-cols-2 gap-px overflow-hidden rounded-[6px] border border-(--line) bg-(--line) sm:grid-cols-4 lg:grid-cols-5">
        {proof.logos.map((l) => (
          <li
            key={l}
            className="grid h-20 place-items-center bg-(--bg) px-3 text-center text-[15px] font-semibold tracking-[-0.01em] text-(--mute)"
          >
            {l}
          </li>
        ))}
      </ul>
      <dl className="mt-8 grid gap-6 sm:grid-cols-2">
        {proof.numbers.map((n) => (
          <div
            key={n.label}
            className="flex flex-col border-t border-(--fg) pt-4"
          >
            <dt className="text-[14px] text-(--fg-2)">{n.label}</dt>
            <dd className="order-first text-[48px] leading-none font-semibold tracking-[-0.04em]">
              {n.value}
            </dd>
          </div>
        ))}
      </dl>
    </Section>
  );
}

function Faq() {
  return (
    <Section n="11" title="FAQ">
      <Head title={faq.headline} />
      <div className="mt-8 border-b border-(--line)">
        {faq.items.map((item) => (
          <details key={item.q} className="border-t border-(--line)">
            <summary className="flex items-center justify-between gap-6 py-4 text-[16px] font-medium hover:text-(--accent)">
              {item.q}
              <span
                className="doc-chev text-(--mute) transition-transform"
                aria-hidden
              >
                ↓
              </span>
            </summary>
            <p className="max-w-2xl pb-5 text-[15px] text-(--fg-2)">{item.a}</p>
          </details>
        ))}
      </div>
    </Section>
  );
}

function Closing({ t }: { t: DocumentTheme }) {
  return (
    <section className="doc-wrap mt-24 sm:mt-32">
      <div className="grid items-center gap-8 rounded-[8px] bg-(--grey) p-8 sm:p-14 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <h2 className="doc-display text-[clamp(2.5rem,5vw,4.75rem)]!">
            {closing.headline}
          </h2>
          <p className="mt-4 text-[18px] text-(--fg-2)">{closing.line}</p>
          <div className="mt-8 flex flex-wrap gap-2">
            <a
              href={closing.buttons[0].href}
              className="doc-btn doc-btn-accent"
            >
              {closing.buttons[0].label}
            </a>
            <a href={closing.buttons[1].href} className="doc-btn doc-btn-line">
              {closing.buttons[1].label}
            </a>
          </div>
        </div>
        {t.ills?.closing && (
          <Illustration
            direction={t.direction}
            name={t.ills.closing}
            className="w-full lg:col-span-5"
          />
        )}
      </div>
    </section>
  );
}

function Footer({ t }: { t: DocumentTheme }) {
  return (
    <footer className="doc-wrap mt-20 border-t border-(--line) py-14">
      <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-12">
        <div className="lg:col-span-3">
          <Logo tone={t.logo} width={140} />
          <p className="mt-3 text-[13px] text-(--mute)">{footer.line}</p>
        </div>
        <div className="grid gap-8 sm:col-span-1 sm:grid-cols-2 lg:col-span-9 lg:grid-cols-4">
          {footer.columns.map((col) => (
            <div key={col.title}>
              <h3 className="doc-label text-(--mute)">{col.title}</h3>
              <ul className="mt-3 grid gap-1.5 text-[14px]">
                {col.links.map((l) => (
                  <li key={l}>
                    <a href="#" className="hover:text-(--accent)">
                      {l}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </footer>
  );
}
