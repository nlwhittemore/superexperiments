import "server-only";
import { env } from "@/lib/env";

export async function transcribeWav(opts: {
  wav: ArrayBuffer;
  vocabulary?: string[];
}): Promise<string> {
  const key = env.openaiKey();
  if (!key) throw new Error("OPENAI_API_KEY is not configured");

  const form = new FormData();
  form.append(
    "file",
    new File([opts.wav], "answer.wav", { type: "audio/wav" }),
  );
  form.append("model", env.transcribeModel());
  form.append("language", "en");
  if (opts.vocabulary?.length) {
    form.append("prompt", `Vocabulary: ${opts.vocabulary.join(", ")}.`);
  }

  const res = await fetch("https://api.openai.com/v1/audio/transcriptions", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}` },
    body: form,
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`OpenAI STT error ${res.status}: ${detail.slice(0, 300)}`);
  }
  const json = (await res.json()) as { text?: string };
  return (json.text ?? "").trim();
}
