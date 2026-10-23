// Regenerate homepage artifact plates with OpenAI's image model.
//
//   npx tsx scripts/generate-plates.ts <paper|studio|riso> [plate-id ...]
//
// Each plate's prompt and settings live in design/image-prompts/<direction>/<id>.json
// next to the published file. Edit the prompt there, rerun, and check every
// word on the result before committing (the model can misspell).
import { readdirSync, readFileSync } from "node:fs";
import sharp from "sharp";
import { loadEnvLocal } from "./lib";

loadEnvLocal();

type PromptFile = { model: string; size: string; quality: string; prompt: string; file: string };

async function generate(spec: PromptFile) {
  const res = await fetch("https://api.openai.com/v1/images/generations", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ model: spec.model, prompt: spec.prompt, size: spec.size, quality: spec.quality, n: 1 }),
  });
  if (!res.ok) throw new Error(`${res.status} ${await res.text()}`);
  const { data } = (await res.json()) as { data: { b64_json: string }[] };
  await sharp(Buffer.from(data[0].b64_json, "base64")).webp({ quality: 82 }).toFile(spec.file);
}

async function main() {
  const [direction, ...ids] = process.argv.slice(2);
  if (!direction || !process.env.OPENAI_API_KEY) {
    console.error("Usage: npx tsx scripts/generate-plates.ts <paper|studio|riso> [plate-id ...] (needs OPENAI_API_KEY)");
    process.exit(1);
  }
  const dir = `design/image-prompts/${direction}`;
  const targets = ids.length ? ids : readdirSync(dir).map((f) => f.replace(/\.json$/, ""));
  await Promise.all(
    targets.map(async (id) => {
      const spec = JSON.parse(readFileSync(`${dir}/${id}.json`, "utf8")) as PromptFile;
      await generate(spec);
      console.log(`✓ ${spec.file}`);
    }),
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
