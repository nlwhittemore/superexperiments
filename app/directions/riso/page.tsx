import {
  builds,
  champions,
  championsBand,
  closing,
  faq,
  finder,
  footer,
  free,
  headlines,
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
import { RisoFinder } from "./finder";

export default function RisoHome() {
  return (
    <>
      <DirectionBar current="riso" />
      <Header />
      <main>
        <Hero />
        <section id="finder" className="border-y-2 border-(--ink) bg-(--blue) py-20 text-(--paper) sm:py-28">
          <div className="ri-wrap">
            <div className="grid gap-6 lg:grid-cols-12">
              <h2 className="ri-h2 lg:col-span-8">{finder.headline}</h2>
              <p className="self-end text-[18px] lg:col-span-4">{finder.intro}</p>
            </div>
            <div className="mt-12">
              <RisoFinder />
            </div>
          </div>
        </section>
        <Builds />
        <Programs />
        <Free />
        <Subscription />
        <RouteMap />
        <Teams />
        <Champions />
        <Method />
        <Proof />
        <Faq />
        <Closing />
      </main>
      <Footer />
    </>
  );
}

function Header() {
  return (
    <header className="sticky top-0 z-30 border-b-2 border-(--ink) bg-(--news)">
      <div className="ri-wrap flex h-[70px] items-center gap-8">
        <a href="#" aria-label="Superintelligent home" className="mr-auto">
          <Logo width={164} />
        </a>
        <ul className="hidden items-center gap-6 text-[15px] font-semibold lg:flex">
          {nav.links.map((l) => (
            <li key={l.label}>
              <a href={l.href} className="decoration-(--pink) decoration-[3px] underline-offset-4 hover:underline">
                {l.label}
              </a>
            </li>
          ))}
        </ul>
        <a href={nav.login.href} className="hidden text-[15px] font-semibold sm:block">
          {nav.login.label}
        </a>
        <a href={nav.cta.href} className="ri-btn ri-btn-blue ri-btn-sm">
          {nav.cta.label}
        </a>
      </div>
    </header>
  );
}

function Hero() {
  const [lead] = headlines[2].split(" AI.");
  return (
    <section className="ri-wrap pt-12 pb-20 sm:pt-16 sm:pb-28">
      <h1 className="ri-display">
        {lead} <span className="ri-mark">AI.</span>
      </h1>
      <div className="mt-12 grid items-start gap-12 lg:grid-cols-12 lg:gap-10">
        <div className="lg:col-span-5">
          <p className="text-[20px] leading-[1.45]">{hero.subhead}</p>
          <div className="mt-9 flex flex-wrap gap-4">
            <a href={hero.primary.href} className="ri-btn ri-btn-blue">
              {hero.primary.label}
            </a>
            <a href={hero.secondary.href} className="ri-btn ri-btn-paper">
              {hero.secondary.label}
            </a>
          </div>
          <ul className="mt-10 grid gap-2">
            {upcomingStarts().map((s, i) => (
              <li key={s.program} className="flex items-center gap-3 border-b-2 border-dotted border-(--ink) pb-2 text-[15px]">
                <span className={`ri-mono shrink-0 px-1.5 text-[12px] ${i % 2 ? "bg-(--pink)" : "bg-(--blue) text-(--paper)"}`}>
                  {s.label.replace("starts ", "")}
                </span>
                <span className="font-semibold">{s.program}</span>
              </li>
            ))}
          </ul>
        </div>
        <figure className="lg:col-span-7">
          <div className="relative">
            <div aria-hidden className="absolute inset-0 translate-x-3 translate-y-3 bg-(--pink)" />
            <div className="relative border-2 border-(--ink) bg-(--paper)">
              <Plate direction="riso" id={hero.plate} eager className="w-full" sizes="(min-width: 1024px) 720px, 100vw" />
            </div>
          </div>
          <figcaption className="ri-label mt-6">{hero.caption}</figcaption>
        </figure>
      </div>
    </section>
  );
}

function Builds() {
  const tilt = ["-rotate-1", "rotate-[0.6deg]", "-rotate-[0.4deg]", "rotate-1", "-rotate-[0.8deg]", "rotate-[0.5deg]"];
  return (
    <section id="builds" className="ri-wrap py-24 sm:py-32">
      <div className="grid gap-6 lg:grid-cols-12">
        <h2 className="ri-h2 lg:col-span-8">{builds.headline}</h2>
        <p className="self-end text-[18px] lg:col-span-4">{builds.intro}</p>
      </div>
      <ul className="mt-14 grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
        {builds.cards.slice(0, 6).map((b, i) => (
          <li key={b.plate}>
            <a href="#programs" className="group block">
              <div className={`border-2 border-(--ink) bg-(--paper) transition-transform duration-200 group-hover:rotate-0 ${tilt[i]}`}>
                <Plate direction="riso" id={b.plate} className="aspect-[3/2] w-full object-cover" sizes="(min-width: 1024px) 400px, (min-width: 640px) 50vw, 100vw" />
              </div>
              <div className="mt-6 flex items-center gap-3">
                <span className="ri-mono grid size-8 place-items-center rounded-full bg-(--pink) text-[13px] font-bold">{i + 1}</span>
                <span className="ri-label">{builds.plateLabel}</span>
              </div>
              <h3 className="ri-h3 mt-3">{b.name}</h3>
              <p className="mt-2 text-[16px]">{b.line}</p>
              <p className="ri-mono mt-3 inline-block border-2 border-(--blue) px-2 py-0.5 text-[12px] text-(--blue) group-hover:bg-(--blue) group-hover:text-(--paper)">
                {b.tag}
              </p>
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}

function Rows({ p }: { p: Program }) {
  const rows: [string, React.ReactNode][] = [
    ["For", p.who],
    ["Format", p.format],
    ["Price", p.price],
  ];
  if (p.nextStart) rows.push(["Next", p.nextStart]);
  return (
    <dl className="mt-6 text-[15px]">
      {rows.map(([k, v]) => (
        <div key={k} className="grid grid-cols-[4.5rem_1fr] gap-3 border-t-2 border-dotted border-(--ink) py-2.5">
          <dt className="ri-label pt-0.5">{k}</dt>
          <dd className={k === "Price" || k === "Next" ? "font-bold" : ""}>{v}</dd>
        </div>
      ))}
    </dl>
  );
}

function Programs() {
  return (
    <section id="programs" className="border-t-2 border-(--ink) py-24 sm:py-32">
      <div className="ri-wrap">
        <h2 className="ri-display text-[clamp(2.4rem,10vw,9rem)]!">{programsIntro.headline}</h2>
        <p className="mt-6 max-w-2xl text-[19px]">{programsIntro.intro}</p>

        <div className="mt-16 flex flex-wrap items-end justify-between gap-4 border-b-2 border-(--ink) pb-4">
          <h3 className="ri-h3 text-[28px]!">
            {programsIntro.pathTitle} <span className="font-normal [font-stretch:100%]">· {programsIntro.pathIntro}</span>
          </h3>
          <span className="ri-mono bg-(--yellow) px-2 py-1 text-[13px]">{programsIntro.fullPath}</span>
        </div>

        <ol className="mt-10 grid gap-8 lg:grid-cols-3">
          {path.map((p, i) => (
            <li key={p.id} id={`program-${p.id}`} className="ri-offset-blue flex flex-col border-2 border-(--ink) bg-(--paper)">
              <div className="flex items-end justify-between border-b-2 border-(--ink) p-5">
                <span className="text-[88px] leading-[0.75] font-black text-(--blue) [font-stretch:125%]">{i + 1}</span>
                <span className="ri-label max-w-[60%] text-right">
                  Level {i + 1}
                  {p.formerly && (
                    <span className="block text-(--mute) normal-case">Formerly {p.formerly}</span>
                  )}
                </span>
              </div>
              <div className="flex flex-1 flex-col p-5">
                <h4 className="text-[26px] leading-[1] font-black uppercase tracking-[-0.02em] [font-stretch:118%]">{p.name}</h4>
                <p className="mt-3 text-[18px] font-bold">{p.line}</p>
                <p className="mt-3 text-[15px]">
                  {isPlaceholder(p.description) ? <PlaceholderSlot value={p.description} /> : p.description}{" "}
                  {p.descriptionNote && <PlaceholderSlot value={p.descriptionNote} />}
                </p>
                <Rows p={p} />
                <div className="mt-auto flex flex-wrap gap-4 pt-6">
                  <a href={p.buttons[0].href} className="ri-btn ri-btn-blue ri-btn-sm">
                    {p.buttons[0].label}
                  </a>
                  <a href={p.buttons[1].href} className="ri-btn ri-btn-paper ri-btn-sm">
                    {p.buttons[1].label}
                  </a>
                </div>
              </div>
            </li>
          ))}
        </ol>
        <p className="mt-8 text-[15px]">{programsIntro.certification}</p>

        <h3 className="ri-h3 mt-20 border-b-2 border-(--ink) pb-4 text-[28px]!">{programsIntro.rolesTitle}</h3>
        <article className="mt-8 grid border-2 border-(--ink) bg-(--pink) lg:grid-cols-2">
          <div className="p-6 sm:p-10">
            <h4 className="text-[34px] leading-[0.95] font-black uppercase tracking-[-0.02em] [font-stretch:122%]">{champions.name}</h4>
            <p className="mt-3 text-[19px] font-bold">{champions.line}</p>
            <p className="mt-3 text-[15px]">{champions.description as string}</p>
            <Rows p={champions} />
            <div className="mt-6 flex flex-wrap gap-4">
              <a href={champions.buttons[0].href} className="ri-btn ri-btn-ink ri-btn-sm shadow-[5px_5px_0_var(--blue)]!">
                {champions.buttons[0].label}
              </a>
              <a href={champions.buttons[1].href} className="ri-btn ri-btn-paper ri-btn-sm">
                {champions.buttons[1].label}
              </a>
            </div>
          </div>
          <div className="flex items-center border-t-2 border-(--ink) bg-(--paper) lg:border-t-0 lg:border-l-2">
            <Plate direction="riso" id={champions.plate} className="w-full" sizes="(min-width: 1024px) 640px, 100vw" />
          </div>
        </article>

        <p className="mt-10 inline-flex items-center gap-3 border-2 border-(--ink) bg-(--yellow) px-4 py-3 text-[16px] font-bold">
          {programsIntro.refund}
        </p>
      </div>
    </section>
  );
}

function Free() {
  return (
    <section id="free" className="border-y-2 border-(--ink) bg-(--yellow) py-24 sm:py-32">
      <div className="ri-wrap">
        <h2 className="ri-display text-[clamp(2.4rem,10vw,9rem)]!">{free.headline}</h2>
        <p className="mt-6 max-w-2xl text-[19px]">{free.intro}</p>
        <ul className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {free.programs.map((p) => (
            <li key={p.id}>
              <a href={p.href} className="ri-offset flex h-full flex-col border-2 border-(--ink) bg-(--paper) transition-transform hover:-translate-y-1">
                {p.plate ? (
                  <Plate direction="riso" id={p.plate} className="aspect-[3/2] w-full border-b-2 border-(--ink) object-cover" sizes="(min-width: 1024px) 400px, 50vw" />
                ) : (
                  <div className="grid aspect-[3/2] place-items-center border-b-2 border-(--ink) bg-(--blue) p-6 text-center text-[clamp(1.8rem,3vw,2.6rem)] leading-[0.95] font-black uppercase text-(--paper) [font-stretch:125%]">
                    {p.name}
                  </div>
                )}
                <div className="flex flex-1 flex-col p-5">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="ri-h3">{p.name}</h3>
                    <span className="ri-mono shrink-0 -rotate-6 rounded-full border-2 border-(--pink) px-2 py-0.5 text-[11px] font-bold text-(--pink)">FREE</span>
                  </div>
                  <p className="mt-2 text-[16px]">{p.line}</p>
                  {p.who && <p className="mt-2 text-[14px] text-(--mute)">{p.who}</p>}
                  <p className="ri-mono mt-3 text-[12px] text-(--mute)">{p.format}</p>
                  <div className="mt-auto pt-4 text-[14px]">
                    {isPlaceholder(p.status) ? (
                      <PlaceholderSlot value={p.status} />
                    ) : (
                      <span className="ri-label bg-(--blue) px-1.5 py-0.5 text-(--paper)">{p.status}</span>
                    )}
                  </div>
                </div>
              </a>
            </li>
          ))}
        </ul>
        <div className="mt-12 flex flex-wrap items-center justify-between gap-4">
          <a href={free.button.href} className="ri-btn ri-btn-ink">
            {free.button.label}
          </a>
          <p className="text-[15px]">{free.contact}</p>
        </div>
      </div>
    </section>
  );
}

function Subscription() {
  return (
    <section id="subscription" className="ri-wrap grid items-center gap-12 py-24 sm:py-32 lg:grid-cols-12">
      <div className="lg:col-span-6">
        <span className="ri-label">{subscription.name}</span>
        <h2 className="ri-h2 mt-4">{subscription.headline}</h2>
        <p className="mt-6 text-[18px]">{subscription.copy}</p>
        <div className="mt-10 grid gap-6 sm:grid-cols-2">
          {subscription.tiers.map((t, i) => (
            <div key={t.name} className={`border-2 border-(--ink) bg-(--paper) p-5 ${i ? "ri-offset" : "ri-offset-blue"}`}>
              <h3 className="ri-h3">{t.name}</h3>
              <p className="ri-mono mt-1 text-[14px]">{t.price}</p>
              <ul className="mt-4 grid gap-2 border-t-2 border-dotted border-(--ink) pt-4 text-[15px]">
                {t.items.map((it) => (
                  <li key={it}>{it}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <a href={subscription.button.href} className="ri-btn ri-btn-blue mt-10">
          {subscription.button.label}
        </a>
      </div>
      <figure className="rotate-1 border-2 border-(--ink) bg-(--paper) lg:col-span-6">
        <Plate direction="riso" id={subscription.plate} className="w-full" sizes="(min-width: 1024px) 600px, 100vw" />
      </figure>
    </section>
  );
}

function RouteMap() {
  return (
    <section className="border-t-2 border-(--ink) py-24 sm:py-32">
      <div className="ri-wrap">
        <div className="grid gap-6 lg:grid-cols-12">
          <h2 className="ri-h2 lg:col-span-8">{routeMap.headline}</h2>
          <p className="self-end text-[18px] lg:col-span-4">{routeMap.intro}</p>
        </div>
        <div className="mt-12 overflow-x-auto">
          <table className="w-full min-w-[760px] border-collapse border-2 border-(--ink) bg-(--paper) text-left text-[15px]">
            <thead>
              <tr className="bg-(--ink) text-(--paper)">
                {routeMap.columns.map((c) => (
                  <th key={c} scope="col" className="ri-label px-4 py-3 font-normal">
                    {c}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {routeMap.rows.map(([goal, ...stops]) => (
                <tr key={goal} className="border-t-2 border-(--ink) hover:bg-(--yellow)">
                  <th scope="row" className="px-4 py-4 text-[17px] font-black [font-stretch:110%]">
                    {goal}
                  </th>
                  {stops.map((s, i) => (
                    <td key={s} className="border-l-2 border-dotted border-(--ink) px-4 py-4">
                      <a href="#programs" className="inline-flex items-start gap-2.5 hover:underline">
                        <span
                          aria-hidden
                          className={`mt-1 size-3.5 shrink-0 rounded-full border-2 border-(--ink) ${i === 0 ? "bg-(--paper)" : i === 1 ? "bg-(--pink)" : "bg-(--blue)"}`}
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
      </div>
    </section>
  );
}

function Teams() {
  return (
    <section id="teams" className="border-y-2 border-(--ink) bg-(--ink) py-24 text-(--paper) sm:py-32">
      <div className="ri-wrap">
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-6">
            <h2 className="ri-h2">{teams.headline}</h2>
            <p className="mt-6 text-[18px] text-(--paper)/80">{teams.copy}</p>
            <div className="mt-9 flex flex-wrap gap-4">
              <a href={teams.buttons[0].href} className="ri-btn ri-btn-blue">
                {teams.buttons[0].label}
              </a>
              <a href={teams.buttons[1].href} className="ri-btn ri-btn-paper shadow-[5px_5px_0_var(--pink)]!">
                {teams.buttons[1].label}
              </a>
            </div>
          </div>
          <figure className="-rotate-1 self-start border-2 border-(--paper) lg:col-span-6">
            <Plate direction="riso" id={teams.plate} className="w-full" sizes="(min-width: 1024px) 600px, 100vw" />
          </figure>
        </div>
        <div className="mt-20 grid gap-12 lg:grid-cols-12">
          <ol className="grid gap-8 sm:grid-cols-2 lg:col-span-7">
            {teams.how.map((h, i) => (
              <li key={h.title}>
                <span className="text-[44px] leading-none font-black text-(--pink) [font-stretch:125%]">{i + 1}</span>
                <h3 className="mt-3 text-[19px] font-bold">{h.title}</h3>
                <p className="mt-1 text-[15px] text-(--paper)/75">{h.body}</p>
              </li>
            ))}
          </ol>
          <div className="lg:col-span-5">
            <h3 className="ri-label text-(--yellow)">Who takes what</h3>
            <ul className="mt-4">
              {teams.whoTakesWhat.map(([who, what]) => (
                <li key={who} className="grid grid-cols-2 gap-4 border-t-2 border-dotted border-(--paper)/40 py-3 text-[15px]">
                  <span className="text-(--paper)/75">{who}</span>
                  <span className="font-bold">{what}</span>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-[15px] text-(--paper)/75">
              {teams.note}{" "}
              <a href={teams.features.href} className="text-(--paper) underline decoration-(--pink) decoration-2 underline-offset-4">
                {teams.features.label}
              </a>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function Champions() {
  return (
    <section id="champions" className="border-b-2 border-(--ink) bg-(--pink) py-24 sm:py-32">
      <div className="ri-wrap grid gap-12 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <h2 className="ri-h2">{championsBand.headline}</h2>
          <p className="mt-6 text-[18px]">{championsBand.copy}</p>
          <div className="mt-9 flex flex-wrap gap-4">
            <a href={championsBand.buttons[0].href} className="ri-btn ri-btn-ink shadow-[5px_5px_0_var(--blue)]!">
              {championsBand.buttons[0].label}
            </a>
            <a href={championsBand.buttons[1].href} className="ri-btn ri-btn-paper">
              {championsBand.buttons[1].label}
            </a>
          </div>
        </div>
        <ul className="self-start border-2 border-(--ink) bg-(--paper) lg:col-span-5">
          {championsBand.facts.map((f, i) => (
            <li key={f} className={`flex gap-4 px-5 py-4 text-[16px] ${i ? "border-t-2 border-dotted border-(--ink)" : ""}`}>
              <span className="ri-mono font-bold text-(--blue)">{String(i + 1).padStart(2, "0")}</span>
              {f}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function Method() {
  return (
    <section className="ri-wrap py-24 sm:py-32">
      <h2 className="ri-display text-[clamp(2.4rem,10vw,9rem)]!">{method.headline}</h2>
      <ol className="mt-14 grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
        {method.points.map((p, i) => (
          <li key={p.title} className="border-t-2 border-(--ink) pt-5">
            <span className={`text-[96px] leading-[0.8] font-black [font-stretch:125%] ${i % 2 ? "text-(--pink)" : "text-(--blue)"}`}>{i + 1}</span>
            <h3 className="ri-h3 mt-5">{p.title}</h3>
            <p className="mt-2 text-[16px]">{p.body}</p>
          </li>
        ))}
      </ol>
      <div className="mt-16 grid grid-cols-2 border-2 border-(--ink) sm:grid-cols-4">
        {method.weeks.map((w, i) => (
          <div key={w.week} className={`p-4 ${i ? "border-l-2 border-(--ink)" : ""} ${i === 3 ? "bg-(--blue) text-(--paper)" : "bg-(--paper)"}`}>
            <div className="ri-label">{w.week}</div>
            <div className="mt-1 text-[18px] font-black [font-stretch:115%]">{w.label}</div>
          </div>
        ))}
      </div>
      <p className="ri-label mt-3">One build, week by week, in AI & Agents Professional</p>
    </section>
  );
}

function Proof() {
  return (
    <section className="border-y-2 border-(--ink) bg-(--paper) py-20">
      <div className="ri-wrap grid gap-12 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <h2 className="ri-h3 text-[26px]!">{proof.headline}</h2>
          <dl className="mt-8 grid grid-cols-2 gap-6 lg:grid-cols-1">
            {proof.numbers.map((n, i) => (
              <div key={n.label} className="flex flex-col">
                <dt className="mt-2 text-[14px]">{n.label}</dt>
                <dd className={`order-first text-[48px] leading-none font-black [font-stretch:125%] ${i ? "text-(--pink)" : "text-(--blue)"}`}>{n.value}</dd>
              </div>
            ))}
          </dl>
        </div>
        <p className="text-[clamp(1.4rem,2.4vw,2.1rem)] leading-[1.3] font-bold tracking-[-0.01em] text-(--mute) lg:col-span-8">
          {proof.logos.map((l, i) => (
            <span key={l}>
              <span className="text-(--ink)">{l}</span>
              {i < proof.logos.length - 1 && <span className="text-(--pink)"> / </span>}
            </span>
          ))}
        </p>
      </div>
    </section>
  );
}

function Faq() {
  return (
    <section className="ri-wrap grid gap-10 py-24 sm:py-32 lg:grid-cols-12">
      <h2 className="ri-display text-[clamp(2.4rem,10vw,9rem)]! lg:col-span-12">{faq.headline}</h2>
      <div className="border-2 border-(--ink) bg-(--paper) lg:col-span-9 lg:col-start-4">
        {faq.items.map((item, i) => (
          <details key={item.q} className={i ? "border-t-2 border-dotted border-(--ink)" : ""}>
            <summary className="flex items-center justify-between gap-6 px-5 py-4 text-[17px] font-bold hover:bg-(--yellow)">
              {item.q}
              <span className="ri-plus text-[26px] leading-none text-(--pink) transition-transform" aria-hidden>
                +
              </span>
            </summary>
            <p className="px-5 pb-5 text-[16px]">{item.a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}

function Closing() {
  return (
    <section className="border-t-2 border-(--ink) bg-(--blue) py-24 text-(--paper) sm:py-32">
      <div className="ri-wrap">
        <h2 className="ri-display text-[clamp(2.4rem,9.6vw,9.5rem)]!">{closing.headline}</h2>
        <div className="mt-10 flex flex-wrap items-center justify-between gap-6">
          <p className="text-[20px]">{closing.line}</p>
          <div className="flex flex-wrap gap-4">
            <a href={closing.buttons[0].href} className="ri-btn ri-btn-paper shadow-[5px_5px_0_var(--pink)]!">
              {closing.buttons[0].label}
            </a>
            <a href={closing.buttons[1].href} className="ri-btn ri-btn-ink">
              {closing.buttons[1].label}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t-2 border-(--ink)">
      <div className="ri-wrap grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-12">
        <div className="lg:col-span-3">
          <Logo width={150} />
          <p className="ri-label mt-4">{footer.line}</p>
        </div>
        <div className="grid gap-8 sm:grid-cols-2 lg:col-span-9 lg:grid-cols-4">
          {footer.columns.map((col) => (
            <div key={col.title}>
              <h3 className="ri-label font-bold">{col.title}</h3>
              <ul className="mt-3 grid gap-1.5 text-[14px]">
                {col.links.map((l) => (
                  <li key={l}>
                    <a href="#" className="decoration-(--pink) decoration-2 underline-offset-4 hover:underline">
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
