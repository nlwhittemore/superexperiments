"use client";

import { useEffect, useRef, useState } from "react";
import { streamSse } from "@/lib/client/sse";
import type { InterviewClientState } from "@/lib/interview/state";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Composer } from "./composer";
import { Spark } from "@/components/spark";

type Msg = { id: string; role: string; text: string };

export function InterviewExperience({
  token,
  initial,
}: {
  token: string;
  initial: InterviewClientState;
}) {
  const alreadyDone = initial.interview?.status === "completed";
  const [phase, setPhase] = useState<"welcome" | "chat">(
    alreadyDone || initial.messages.length > 0 ? "chat" : "welcome",
  );
  const [messages, setMessages] = useState<Msg[]>(initial.messages);
  const [streaming, setStreaming] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [completed, setCompleted] = useState(alreadyDone);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState({
    covered: initial.interview?.covered ?? 0,
    current: initial.interview?.currentQuestion ?? 1,
    total: initial.totalQuestions,
  });

  const lastBodyRef = useRef<Record<string, unknown> | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, streaming, completed]);

  async function run(body: Record<string, unknown>) {
    lastBodyRef.current = body;
    setBusy(true);
    setError(null);
    setStreaming("");
    let acc = "";
    let needBreak = false;
    let completedFlag = false;
    try {
      await streamSse({
        url: `/api/interview/${token}/messages`,
        body,
        onEvent(event, data) {
          if (event === "delta") {
            const t = String(data.t ?? "");
            if (needBreak && acc && !acc.endsWith("\n")) acc += "\n\n";
            needBreak = false;
            acc += t;
            setStreaming(acc);
          } else if (event === "progress") {
            needBreak = true;
            setProgress((p) => ({
              ...p,
              covered: Number(data.covered ?? p.covered),
              current: Number(data.current_question ?? p.current),
            }));
          } else if (event === "complete") {
            completedFlag = true;
          } else if (event === "error") {
            setError(String(data.message ?? "Something went wrong."));
          }
        },
      });
      if (acc.trim()) {
        setMessages((m) => [
          ...m,
          { id: crypto.randomUUID(), role: "assistant", text: acc },
        ]);
      }
      if (completedFlag) setCompleted(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Connection lost.");
    } finally {
      setStreaming(null);
      setBusy(false);
    }
  }

  function handleStart() {
    setPhase("chat");
    void run({ start: true, id: crypto.randomUUID() });
  }

  function handleSend(text: string) {
    const id = crypto.randomUUID();
    setMessages((m) => [...m, { id, role: "user", text }]);
    void run({ id, text });
  }

  function handleRetry() {
    if (lastBodyRef.current) void run(lastBodyRef.current);
  }

  if (phase === "welcome") {
    return (
      <Welcome
        company={initial.company}
        name={initial.participant.name}
        intro={initial.intro}
        total={initial.totalQuestions}
        onStart={handleStart}
      />
    );
  }

  const questionLabel = Math.min(progress.current, progress.total);

  return (
    <div className="bg-background flex h-dvh flex-col">
      <header className="border-border/70 border-b">
        <div className="mx-auto w-full max-w-2xl px-4 py-3">
          <div className="flex items-center justify-between gap-4">
            <div className="flex min-w-0 items-center gap-3">
              <Spark className="size-6 shrink-0" />
              <div className="min-w-0">
                <p className="kicker text-muted-foreground truncate">
                  Superintelligent <span className="text-teal">·</span> Agent
                  Readiness Audit
                </p>
                <p className="font-display mt-1 truncate text-[15px]">
                  {initial.company}
                </p>
              </div>
            </div>
            <p className="kicker shrink-0 tabular-nums">
              {completed ? (
                <span className="text-teal">Complete</span>
              ) : (
                <span className="text-muted-foreground">
                  Question {questionLabel} of {progress.total}
                </span>
              )}
            </p>
          </div>
          <div className="mt-3 flex gap-1">
            {Array.from({ length: progress.total }, (_, i) => (
              <div
                key={i}
                className={cn(
                  "h-[3px] flex-1 rounded-full transition-colors duration-500",
                  completed || i < progress.covered
                    ? "bg-foreground"
                    : i === progress.covered
                      ? "bg-teal"
                      : "bg-border",
                )}
              />
            ))}
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-2xl space-y-7 px-4 py-8">
          {messages.map((m) =>
            m.role === "user" ? (
              <div key={m.id} className="flex justify-end">
                <div className="bg-secondary border-border/70 max-w-[85%] rounded-xl rounded-br-sm border px-4 py-2.5 text-[15px] leading-relaxed whitespace-pre-wrap">
                  {m.text}
                </div>
              </div>
            ) : (
              <div
                key={m.id}
                className="font-display text-[17px] leading-[1.6] whitespace-pre-wrap"
              >
                {m.text}
              </div>
            ),
          )}

          {streaming !== null && (
            <div className="font-display text-[17px] leading-[1.6] whitespace-pre-wrap">
              {streaming.length === 0 ? (
                <span className="text-teal inline-flex gap-1 text-[13px]">
                  <span className="animate-pulse">●</span>
                  <span className="animate-pulse [animation-delay:150ms]">●</span>
                  <span className="animate-pulse [animation-delay:300ms]">●</span>
                </span>
              ) : (
                <>
                  {streaming}
                  <span className="bg-teal ml-0.5 inline-block h-4 w-[2px] animate-pulse align-middle" />
                </>
              )}
            </div>
          )}

          {error && (
            <div className="border-destructive/30 bg-destructive/5 flex items-center justify-between gap-3 rounded-lg border px-4 py-3">
              <p className="text-destructive text-sm">{error}</p>
              <Button size="sm" variant="outline" onClick={handleRetry}>
                Try again
              </Button>
            </div>
          )}

          {completed && (
            <div className="border-border border-y px-2 py-10 text-center">
              <p className="kicker text-teal">Interview complete</p>
              <p className="font-display gradient-text mt-3 text-2xl font-bold tracking-tight">
                That&apos;s everything — thank you.
              </p>
              <p className="text-muted-foreground mx-auto mt-2 max-w-md text-sm">
                Your input feeds directly into {initial.company}&apos;s
                readiness report. You can close this window.
              </p>
            </div>
          )}

          <div ref={bottomRef} />
        </div>
      </main>

      {!completed && (
        <Composer token={token} disabled={busy} onSend={handleSend} />
      )}
    </div>
  );
}

function Welcome({
  company,
  name,
  intro,
  total,
  onStart,
}: {
  company: string;
  name: string;
  intro: string | null;
  total: number;
  onStart: () => void;
}) {
  const firstName = name.split(" ")[0];
  return (
    <main className="glow-top flex min-h-dvh items-center justify-center px-4 py-12">
      <div className="w-full max-w-xl">
        <Spark className="size-8" />
        <p className="kicker text-muted-foreground mt-6">
          Superintelligent <span className="text-teal">·</span> Agent
          Readiness Audit
        </p>
        <h1 className="font-display gradient-text mt-6 text-4xl leading-[1.1] font-bold tracking-tight text-balance sm:text-[2.75rem]">
          Hi {firstName} — a short conversation about how you work with AI.
        </h1>

        <div className="border-border mt-9 flex flex-wrap items-center gap-x-7 gap-y-2 border-y py-3.5">
          <span className="kicker text-foreground/80">{company}</span>
          <span className="kicker text-foreground/80">{total} questions</span>
          <span className="kicker text-foreground/80">≈ 15 minutes</span>
        </div>

        {intro && (
          <div className="text-muted-foreground mt-8 space-y-3 text-[15px] leading-relaxed">
            {intro.split("\n\n").map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
        )}

        <div className="mt-10 space-y-3">
          <Button size="lg" className="h-12 w-full text-base" onClick={onStart}>
            Start the conversation
            <ArrowRight className="size-4" />
          </Button>
          <p className="text-muted-foreground text-center text-xs">
            Prefer talking to typing? Use the mic in the chat to answer with
            your voice.
          </p>
        </div>
      </div>
    </main>
  );
}
