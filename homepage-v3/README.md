# Homepage v3: simple illustrations throughout

`Superintelligent_Homepage.html` is a new single-file page built from `../homepage-base/original.html`. It extends the two pieces that worked in the last round, the seats illustration in For teams and the How-it-works icons, to every section. Everything else on the page is unchanged: copy, layout, finder logic, color picker.

Open it in any browser. It needs no server and no network.

## The illustration system

Two families, both generated with GPT Image 2.5 using the liked images as style references:

- **Icons** (`images/p-*`, `q-*`, `b-*`, `f-*`, `s-*`, `r-*`, `t-*`, `how-*`, `refund`): bold, flat and simple enough to read at 20px.
- **Scenes** (`images/sc-*`, `teams`): small isometric line drawings, about 260–440px.

Each image is a black alpha mask that CSS paints in a color, so it follows the accent picker:

- **Ink** (`#161616`) on light and accent backgrounds.
- **The accent** on dark sections.
- **The route's own color** in the goal map.

## Where they are

| Section | Added |
|---|---|
| Hero | Program icons in the "starts" list |
| Finder | An icon per question (accent on dark); the result card shows the recommended program's icon and changes with your answers |
| What people build | An icon per build, in place of the 01–06 numbers |
| Programs | A program icon on each level card and on the Champions Bootcamp card; an icon on the refund line |
| Start free | An icon per program in the list (it greys out with the name), plus the active program's icon on the card |
| Subscription | Operator and Leader icons; a worksheets-and-calendar scene under the button |
| By goal | An icon in each goal pill, in the route color |
| For teams | Icons for the four features (replacing "+"); the seats scene |
| Champions | A scene of one raised seat in a row |
| How it works | The four step icons |
| FAQ | A speech-bubbles scene |
| Closing | A block-snapping-into-place scene, in the accent |

## Props

The page's props are unchanged except for a new one, `illustrations` (`On` by default, or `Off`). Off renders the original page exactly, including the "+" markers and the 01–06 build numbers.

## Rebuild

`python3 homepage-v3/build.py` rebuilds the page from the untouched original plus `images/`. Every edit is an exact, checked replacement, so it fails loudly if the base changes. Prompts for every image are in `image-prompts/`.
