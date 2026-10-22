"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowUp, Loader2, Mic, Square, X } from "lucide-react";
import {
  canRecord,
  startRecording,
  type ActiveRecording,
} from "@/lib/audio/record-wav";

const MAX_SECONDS = 120;

export function Composer({
  token,
  disabled,
  onSend,
}: {
  token: string;
  disabled: boolean;
  onSend: (text: string) => void;
}) {
  const [text, setText] = useState("");
  const [recState, setRecState] = useState<"idle" | "recording" | "transcribing">(
    "idle",
  );
  const [elapsed, setElapsed] = useState(0);
  const [hint, setHint] = useState<string | null>(null);
  const [micSupported, setMicSupported] = useState(true);

  const recRef = useRef<ActiveRecording | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const taRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setMicSupported(canRecord());
  }, []);

  useEffect(() => {
    return () => {
      recRef.current?.cancel();
      recRef.current = null;
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  useEffect(() => {
    const ta = taRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = Math.min(ta.scrollHeight, 192) + "px";
  }, [text]);

  useEffect(() => {
    if (recState === "recording" && elapsed >= MAX_SECONDS) void stopRecording_();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [elapsed, recState]);

  function clearTimer() {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }

  function submit() {
    const t = text.trim();
    if (!t || disabled || recState !== "idle") return;
    onSend(t);
    setText("");
    taRef.current?.focus();
  }

  async function startRecording_() {
    setHint(null);
    try {
      const rec = await startRecording();
      recRef.current = rec;
      setElapsed(0);
      setRecState("recording");
      timerRef.current = setInterval(() => setElapsed((s) => s + 1), 1000);
    } catch {
      setHint("Couldn't access the microphone — typing works just as well.");
      setRecState("idle");
    }
  }

  async function stopRecording_() {
    const rec = recRef.current;
    if (!rec) return;
    recRef.current = null;
    clearTimer();
    setRecState("transcribing");
    try {
      const wav = await rec.stop();
      const res = await fetch("/api/transcribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/octet-stream",
          "x-interview-token": token,
        },
        body: wav,
      });
      const json = (await res.json().catch(() => null)) as {
        text?: string;
        error?: string;
      } | null;
      if (!res.ok) {
        throw new Error(json?.error ?? "Transcription failed — type instead.");
      }
      const t = (json?.text ?? "").trim();
      if (t) {
        setText((prev) => (prev.trim() ? prev.replace(/\s+$/, "") + " " + t : t));
        taRef.current?.focus();
      } else {
        setHint("Didn't catch anything — try again, or type your answer.");
      }
    } catch (e) {
      setHint(
        e instanceof Error ? e.message : "Transcription failed — type instead.",
      );
    } finally {
      setRecState("idle");
      setElapsed(0);
    }
  }

  function cancelRecording() {
    recRef.current?.cancel();
    recRef.current = null;
    clearTimer();
    setRecState("idle");
    setElapsed(0);
  }

  const remaining = MAX_SECONDS - elapsed;
  const timeLabel = `${Math.floor(elapsed / 60)}:${String(elapsed % 60).padStart(2, "0")}`;

  return (
    <div className="border-border/60 bg-background border-t">
      <div className="mx-auto w-full max-w-2xl px-4 pt-3 pb-4">
        {hint && (
          <p className="text-muted-foreground mb-2 text-center text-xs">{hint}</p>
        )}
        <div className="border-input bg-card focus-within:border-ring/60 focus-within:ring-ring/15 flex items-end gap-1.5 rounded-xl border px-2.5 py-2 shadow-sm transition focus-within:ring-2">
          <textarea
            ref={taRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
                e.preventDefault();
                submit();
              }
            }}
            rows={1}
            placeholder={
              micSupported
                ? "Type, or tap the mic and just talk…"
                : "Type your answer…"
            }
            className="placeholder:text-muted-foreground max-h-48 min-h-9 flex-1 resize-none bg-transparent px-1.5 py-1.5 text-[15px] leading-relaxed outline-none"
          />

          {recState === "recording" && (
            <div className="flex items-center gap-1.5 pb-0.5">
              <span className="text-muted-foreground mr-1 flex items-center gap-1.5 font-mono text-xs tabular-nums">
                <span className="inline-block size-2 animate-pulse rounded-full bg-red-500" />
                {timeLabel}
                {remaining <= 15 && (
                  <span className="text-red-500">· {remaining}s left</span>
                )}
              </span>
              <Button
                type="button"
                size="icon"
                variant="ghost"
                className="size-9 rounded-full"
                onClick={cancelRecording}
                aria-label="Discard recording"
              >
                <X className="size-4" />
              </Button>
              <Button
                type="button"
                size="icon"
                className="size-9 rounded-full"
                onClick={() => void stopRecording_()}
                aria-label="Finish recording"
              >
                <Square className="size-3.5 fill-current" />
              </Button>
            </div>
          )}

          {recState === "transcribing" && (
            <div className="flex items-center gap-2 pb-0.5">
              <span className="text-muted-foreground text-xs">Transcribing…</span>
              <Button
                type="button"
                size="icon"
                variant="ghost"
                className="size-9 rounded-full"
                disabled
                aria-label="Transcribing"
              >
                <Loader2 className="size-4 animate-spin" />
              </Button>
            </div>
          )}

          {recState === "idle" && (
            <div className="flex items-center gap-1.5 pb-0.5">
              {micSupported && (
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  className="size-9 rounded-full"
                  onClick={() => void startRecording_()}
                  aria-label="Answer with your voice"
                >
                  <Mic className="size-4" />
                </Button>
              )}
              <Button
                type="button"
                size="icon"
                className="size-9 rounded-full"
                onClick={submit}
                disabled={disabled || !text.trim()}
                aria-label="Send"
              >
                <ArrowUp className="size-4" />
              </Button>
            </div>
          )}
        </div>
        <p className="text-muted-foreground mt-2 text-center text-[11px]">
          {micSupported
            ? "Tap the mic and ramble — messy is fine. Long, specific answers make the audit better."
            : "Long, specific answers make the audit better."}
        </p>
      </div>
    </div>
  );
}
