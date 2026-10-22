import { NextResponse } from "next/server";
import { env } from "@/lib/env";
import { loadInterviewContext } from "@/lib/interview/context";
import { transcribeWav } from "@/lib/transcribe";

export const maxDuration = 60;

const MAX_BYTES = 4 * 1024 * 1024;

const AI_VOCAB = [
  "Superintelligent",
  "agentic",
  "AI agent",
  "ChatGPT",
  "Claude",
  "Copilot",
  "Gemini",
  "custom GPT",
  "LLM",
  "large language model",
  "automation",
  "workflow",
  "chatbot",
  "prompt",
  "deep research",
];

export async function POST(request: Request) {
  if (!env.openaiKey()) {
    return NextResponse.json(
      { error: "Voice isn't available right now — please type your answer." },
      { status: 503 },
    );
  }

  const token = request.headers.get("x-interview-token") ?? "";
  const ctx = token ? await loadInterviewContext(token) : null;
  if (!ctx) {
    return NextResponse.json({ error: "Invalid link" }, { status: 401 });
  }

  const audio = await request.arrayBuffer();
  if (audio.byteLength === 0) {
    return NextResponse.json({ error: "Empty recording" }, { status: 400 });
  }
  if (audio.byteLength > MAX_BYTES) {
    return NextResponse.json(
      { error: "That recording was too long — keep takes under two minutes." },
      { status: 413 },
    );
  }

  try {
    const text = await transcribeWav({
      wav: audio,
      vocabulary: [ctx.company.name, ...AI_VOCAB],
    });
    return NextResponse.json({ text });
  } catch (e) {
    console.error("[transcribe]", e);
    return NextResponse.json(
      { error: "Transcription failed — try again, or type instead." },
      { status: 502 },
    );
  }
}
