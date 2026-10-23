# besuper.ai homepage directions

Round 2 builds on 1 (Paper) and 2 (Studio) from round 1 and adds three more directions at the same level of simplicity. There's no yellow anywhere, because yellow belongs to How We Got Here. Copy, sections and finder logic are identical in every direction; each direction is a theme on one of two templates.

| Route | Direction | Template | Headline tried |
|---|---|---|---|
| `/directions` | Side-by-side index | | |
| `/directions/paper` | **1 · Paper** | Editorial | Learn AI by building with it. |
| `/directions/studio` | **2 · Studio** | Document | AI is already part of your job. Get good at it. |
| `/directions/mono` | **3 · Mono** | Editorial | Get good at AI. |
| `/directions/prism` | **4 · Prism** | Document | Learn AI by building with it. |
| `/directions/night` | **5 · Night** | Editorial | AI is already part of your job. Get good at it. |
| `/directions/riso` | Round 1's Riso, set aside | (own page) | Get good at AI. |

Run `npm run dev` and open http://localhost:3000/directions. These routes need no env vars.

## The directions

**1 · Paper.** Round 1's Paper & Sun with tomato red in place of yellow. Warm paper, ink, heavy grotesk. Builds are printed pages photographed in hard morning light.
Tokens: paper `#F4F2EA`, ink `#141414`, tomato `#F2552C`. Type: Hanken Grotesk.

**2 · Studio.** The Swiss document, with a visual layer so it no longer reads as a wireframe:
- builds drawn as annotated blueprints on cobalt (construction lines, dimension marks, spark glints)
- fine-line cobalt isometric illustrations for the finder, each level, champions, subscription, method and closing
- the logo's four-point spark as a glyph on section rails and lists, and as a twinkling cluster in the hero

Tokens: white, ink `#0E0E11`, cobalt `#2D4BFF`. Type: Geist + Geist Mono.

**3 · Mono.** Paper's layout in black and white only. No accent: knockout blocks, deep window shadows, gallery-print photography.
Tokens: `#F5F5F3`, ink `#0A0A0A`. Type: Inter Tight.

**4 · Prism.** Studio's document in white and ink. The only color is light split through a prism, in the photographs, the sparks and one underline.
Tokens: white, ink `#111114`, spectrum gradient. Type: Host Grotesk + IBM Plex Mono.

**5 · Night.** Today's dark besuper.ai, grown up. Near-black, a serif display, the current brand teal, builds lit by one slice of light.
Tokens: `#0E0F0F`, `#EFEDE6`, teal `#5BC4C4`. Type: Instrument Serif + Instrument Sans.

## How it's built

- `content/homepage.ts` holds every word, in copy-doc order. `[[PLACEHOLDER]]` items render as visibly unfinished "TBD" slots; `[[CHECK]]` and `[[LEANING]]` items are marked in comments.
- `lib/site/finder.ts` holds the three-question routing table plus a headless `useFinder()` hook.
- `components/directions/editorial/` and `components/directions/document/` are the two templates. Each has a CSS file where every color, font and display weight is a token.
- `components/directions/theme.ts` defines what a direction passes in: its image set, headline and emphasis, logo tone, and for Document, illustration slots and sparks.
- `app/directions/<name>/` is a direction: a layout with fonts and a CSS file of tokens, plus a one-component page that picks a template and a theme.
- `components/site/` holds the real logo, image plates, illustrations, the spark glyph, placeholder slots and the review bar.

A new direction is a new folder with tokens and a theme, not a new page.

## Imagery

All images were generated with GPT Image 2.5 (`gpt-image-2.5-sunburst`, 1536×1024, high quality) and are labeled "Example build" until real learner builds replace them. Each build plate shows the artifact named in the copy doc, with its exact visible text checked by eye.

Prompts live in `design/image-prompts/<direction>/<name>.json`, next to `public/directions/<direction>/<name>.webp`. To regenerate one after editing its prompt:

```
OPENAI_API_KEY=... npx tsx scripts/generate-plates.ts studio briefing
```

Studio's illustrations had their near-white grounds flattened to pure white so multiply blending drops them cleanly. Do the same if you regenerate one.

## Logo

`public/brand/logo-ink.png` and `logo-white.png` come from the production logo PNG on besuper.ai, recolored to one flat color and never redrawn. Swap in the original vector file when it's available.

## Calls made where the copy doc left a gap

- Foundations is shown as live (`status: "live"` in content). Set it to `"soon"` when the launch decision lands.
- The subscription button shows "Join the waitlist", matching the early-2027 thinking.
- The finder's "Why this" line is written for each route in the doc's voice. The doc gave only the "Just me · most days" example.
- "My team" + "A plan and rules" isn't in the routing table. Following the doc's fallback rule, it routes to the Champions Bootcamp.
- The proof headline uses the doc's fallback, "Learn alongside people from". The learner-work and quote slots are left out until real, cleared items exist.
