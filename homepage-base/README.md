# Homepage base: generated imagery upgrades

`original.html` is the homepage we're building from, exactly as received. `Superintelligent_Homepage.html` is the same page with GPT Image 2.5 visuals added in six places. Both are self-contained single files: open either one in a browser.

Every new image is a black-ink illustration that CSS paints in the current accent. Picking a swatch in the header recolors the illustrations along with everything else.

## What changed

| Area | Before | After |
|---|---|---|
| Hero | A type plate with the briefing lines | **Diagram + type** (default): calendar, inbox and priorities flow into an agent, which feeds the same big briefing type. **Photo**: a tinted photograph of the printed briefing. |
| What people build | One static card (the ranked map) | A live panel: hover or tab through the six builds and the panel swaps to that build's illustration and caption |
| Programs | Numbered dots | An emblem tile per level, using each level's existing dot colors (grey / accent / black) |
| Start free | Text-only card | A cover illustration per free program, swapping with the selection |
| For teams | Text only | A seats-and-calendar illustration under "Who takes what" |
| How it works | Text only | An icon per step, in the accent on the dark band |

The finder, route map, champions, FAQ and footer are unchanged.

## Props

The page's existing props are kept and extended:

- `imagery`: `Generated` (new default), `Type plates` (the original visuals), `Photo slots`
- `heroVisual`: `Diagram + type` (default) or `Photo`
- `review`: `Show` or `Hide` for the small review panel at the bottom-right, which switches imagery and hero live. It isn't part of the design.

## Files

- `images/`: the 22 images as WebP. The illustrations are alpha masks painted with CSS; the hero photo is grayscale and multiplied over the accent.
- `image-prompts/`: the GPT Image 2.5 prompt and settings for each image.
- `rebundle.py`: rebuilds `Superintelligent_Homepage.html` from `original.html` plus `images/`. Every edit is an exact, checked replacement, so it fails loudly if the base changes. Run `python3 homepage-base/rebundle.py`.

## Known issue in the base

At phone width (390px) the header's "Log in" and "Find my program" buttons don't fit, so the page scrolls sideways. This is in `original.html` too and isn't touched here.
