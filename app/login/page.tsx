import { Suspense } from "react";
import { LoginForm } from "./login-form";
import { Spark } from "@/components/spark";

export const metadata = { title: "Sign in — Superintelligent" };

export default function LoginPage() {
  return (
    <main className="glow-top flex min-h-dvh items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <Spark className="size-8" />
        <p className="kicker text-muted-foreground mt-6">
          Superintelligent <span className="text-teal">·</span> Agent
          Readiness Audit
        </p>
        <h1 className="font-display gradient-text mt-5 text-3xl font-bold tracking-tight">
          Sign in
        </h1>
        <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
          Your workspace for audits, documents, and readiness reports.
        </p>
        <div className="border-border mt-8 border-t pt-7">
          <Suspense>
            <LoginForm />
          </Suspense>
        </div>
      </div>
    </main>
  );
}
