# besuper.ai homepage: three directions

Three complete homepage directions built from the copy doc ("Superintelligent homepage copy and content", Draft 1, Oct 22 2026). Same words, same sections, same finder logic. Only color, type, layout and imagery change.

| Route | Direction | Headline tried |
|---|---|---|
| `/directions` | Side-by-side index | |
| `/directions/paper` | **A · Paper & Sun** | Learn AI by building with it. |
| `/directions/studio` | **B · Studio** | AI is already part of your job. Get good at it. |
| `/directions/riso` | **C · Riso** | Get good at AI. |

Run `npm run dev` and open http://localhost:3000/directions. These routes need no env vars.

## The directions

**A · Paper & Sun.** Atlas's cleanness, evolved. Warm paper, ink, one sun yellow, heavy grotesk headlines. The finder sits in a dark band and returns a yellow result card. Builds are photographed as printed pages in hard morning light.
Tokens: paper `#F4F2EA`, paper-2 `#EBE7DA`, ink `#141414`, sun `#FFD23F`, night `#161616`. Type: Hanken Grotesk 400–800.

**B · Studio.** A Swiss document. White, ink, one electric cobalt, mono labels, numbered section rails. Programs are a side-by-side spec sheet so levels compare row by row. One full-bleed cobalt block, for teams. Builds are pristine product UI.
Tokens: white, ink `#0E0E11`, grey `#F4F4F5`, line `#E4E4E7`, cobalt `#2D4BFF`, cobalt-50 `#EEF1FF`. Type: Geist + Geist Mono.

**C · Riso.** The bold swing. Newsprint, poster-wide type, two riso inks with misregistered offset shadows, paper grain. Every build is a two-ink risograph print, so the whole site reads as one illustration system.
Tokens: newsprint `#F2EEE3`, paper `#FBF8F1`, ink `#121212`, riso blue `#0078BF`, fluorescent pink `#FF48B0`, yellow `#FFE800`. Type: Archivo (width 125 for display) + Space Mono.

## How it's built

- `content/homepage.ts`: every word on the page, in copy-doc order. Directions never hard-code copy. `[[PLACEHOLDER]]` items render as visibly unfinished "TBD" slots instead of invented content; `[[CHECK]]` and `[[LEANING]]` items are marked in comments.
- `lib/site/finder.ts`: the three-question routing table from section 3, plus a headless `useFinder()` hook each direction renders its own way.
- `components/site/`: the real logo (`logo.tsx`), image plates (`plate.tsx`), placeholder slots, and the review bar that switches directions.
- `app/directions/<name>/`: one folder per direction with its own tokens (`<name>.css`), fonts (`layout.tsx`), page and finder UI. Tokens are scoped to the direction, so the audit app's styles are untouched.

## Imagery

Every plate was generated with GPT Image 2.5 (`gpt-image-2.5-sunburst`, 1536×1024, high quality) from the copy doc's artifact list: the build, its program and the exact visible text. All are labeled "Example build" and should be swapped for real learner builds as they're cleared.

Prompts live in `design/image-prompts/<direction>/<plate>.json`, next to `public/directions/<direction>/<plate>.webp`. To regenerate one after editing its prompt:

```
OPENAI_API_KEY=... npx tsx scripts/generate-plates.ts riso briefing
```

Check every word on the result before committing.

## Logo

`public/brand/logo-ink.png` and `logo-white.png` come from the production logo PNG on besuper.ai, recolored to one flat color. They're never redrawn. Swap in the original vector file when it's available.

## Calls made where the copy doc left a gap

- Foundations is shown as live (`status: "live"` in content). Set it to `"soon"` when the launch decision lands.
- The subscription button shows "Join the waitlist", matching the early-2027 thinking.
- The finder's "Why this" line is written for each route in the doc's voice. The doc gave only the "Just me · most days" example.
- "My team" + "A plan and rules" isn't in the routing table. Following the doc's fallback rule, it routes to the Champions Bootcamp.
- The proof headline uses the doc's suggested fallback, "Learn alongside people from". The learner-work and quote slots are dropped until real, cleared items exist, as the doc asks.
