import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import { env } from "@/lib/env";

let cached: Anthropic | null = null;

export function anthropic(): Anthropic {
  if (cached) return cached;
  cached = new Anthropic({ apiKey: env.anthropicKey() });
  return cached;
}

export const MODELS = {
  interview: process.env.INTERVIEW_MODEL ?? "claude-sonnet-4-6",
  analysis: process.env.ANALYSIS_MODEL ?? "claude-opus-4-7",
};
