import { redirect } from "next/navigation";
import { getProfile } from "@/lib/auth";
import { supabaseServer } from "@/lib/supabase/server";
import { signOut } from "@/app/login/actions";
import { Button } from "@/components/ui/button";

export default async function Home() {
  const supa = await supabaseServer();
  const {
    data: { user },
  } = await supa.auth.getUser();
  if (!user) redirect("/login");

  const profile = await getProfile();
  if (profile?.role === "admin") redirect("/admin");
  if (profile?.role === "client") redirect("/portal");

  return (
    <main className="flex min-h-screen items-center justify-center p-8">
      <div className="max-w-md space-y-4 text-center">
        <h1 className="text-xl font-semibold">No access</h1>
        <p className="text-muted-foreground text-sm">
          Your account ({user.email}) isn&apos;t associated with a workspace.
          Contact the Superintelligent team if you believe this is a mistake.
        </p>
        <form action={signOut}>
          <Button variant="outline" type="submit">
            Sign out
          </Button>
        </form>
      </div>
    </main>
  );
}
