import { requireClient } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { signOut } from "@/app/login/actions";
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/sonner";
import { Spark } from "@/components/spark";

export const metadata = { title: "Client Portal — Superintelligent" };

export default async function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await requireClient();
  const db = supabaseAdmin();
  const { data: company } = await db
    .from("companies")
    .select("name")
    .eq("id", profile.company_id)
    .maybeSingle();

  return (
    <div className="bg-background min-h-dvh">
      <header className="border-border/70 bg-background/95 sticky top-0 z-40 border-b backdrop-blur print:hidden">
        <div className="mx-auto flex h-16 w-full max-w-5xl items-center justify-between gap-6 px-4">
          <div className="flex min-w-0 items-center gap-3">
            <Spark className="size-6 shrink-0" />
            <div className="min-w-0 leading-tight">
              <p className="kicker text-muted-foreground truncate">
                Superintelligent <span className="text-teal">·</span> Client
                Portal
              </p>
              <p className="font-display mt-0.5 truncate text-[15px]">
                {company?.name ?? "Client"}
              </p>
            </div>
          </div>
          <form action={signOut} className="flex shrink-0 items-center gap-3">
            <span className="text-muted-foreground hidden text-xs sm:inline">
              {profile.email}
            </span>
            <Button variant="ghost" size="sm" type="submit">
              Sign out
            </Button>
          </form>
        </div>
      </header>
      <main className="mx-auto w-full max-w-5xl px-4 py-10">{children}</main>
      <Toaster />
    </div>
  );
}
