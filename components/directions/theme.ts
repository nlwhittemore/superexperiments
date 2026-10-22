import type { Direction } from "@/components/site/plate";

// One headline option from the copy doc, plus the phrase the direction
// emphasizes (a highlight block in Editorial, an accent in Document).
export type Headline = {
  text: string;
  emphasis: string;
  breakAfterEmphasis?: boolean;
};

export type EditorialTheme = {
  direction: Direction;
  headline: Headline;
  logo: "ink" | "white";
};

// GPT Image illustrations by slot. Slots left out simply aren't drawn.
export type Illustrations = {
  finder?: string;
  levels?: [string, string, string];
  champions?: string;
  subscription?: string;
  method?: string;
  closing?: string;
};

export type DocumentTheme = {
  direction: Direction;
  headline: Headline;
  logo: "ink" | "white";
  ills?: Illustrations;
  sparks?: boolean;
};

export function splitHeadline({ text, emphasis }: Headline) {
  const at = text.indexOf(emphasis);
  return { before: text.slice(0, at), after: text.slice(at + emphasis.length) };
}
