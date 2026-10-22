import { getInterviewState } from "@/lib/interview/state";
import { InterviewExperience } from "@/components/chat/interview-experience";

export const metadata = { title: "Agent Readiness Audit — Superintelligent" };

export default async function InterviewPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const state = await getInterviewState(token);

  if (!state) {
    return (
      <main className="flex min-h-dvh items-center justify-center p-8">
        <div className="max-w-md space-y-3 text-center">
          <p className="kicker text-muted-foreground">Superintelligent</p>
          <h1 className="font-display text-2xl font-bold tracking-tight">
            This link isn&apos;t valid
          </h1>
          <p className="text-muted-foreground text-sm">
            Double-check the link from your invitation, or contact the person
            who sent it to you.
          </p>
        </div>
      </main>
    );
  }

  return <InterviewExperience token={token} initial={state} />;
}
