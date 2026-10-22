import { requireAdmin } from "@/lib/auth";
import { signOut } from "@/app/login/actions";
import { AdminNav } from "@/components/admin/nav";
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/sonner";
import { Spark } from "@/components/spark";

export const metadata = { title: "Audit Console — Superintelligent" };

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await requireAdmin();
  return (
    <div className="bg-background min-h-dvh">
      <header className="border-border/70 bg-background/95 sticky top-0 z-40 border-b backdrop-blur print:hidden">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-6 px-4">
          <div className="flex min-w-0 items-center gap-8">
            <div className="flex items-center gap-3">
              <Spark className="size-6 shrink-0" />
              <div className="leading-tight">
                <p className="kicker text-muted-foreground">Superintelligent</p>
                <p className="font-display mt-0.5 text-[15px]">Audit Console</p>
              </div>
            </div>
            <AdminNav />
          </div>
          <form action={signOut} className="flex items-center gap-3">
            <span className="text-muted-foreground hidden text-xs sm:inline">
              {profile.email}
            </span>
            <Button variant="ghost" size="sm" type="submit">
              Sign out
            </Button>
          </form>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl px-4 py-8">{children}</main>
      <Toaster />
    </div>
  );
}
