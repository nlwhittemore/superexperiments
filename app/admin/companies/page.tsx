import { supabaseAdmin } from "@/lib/supabase/admin";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  CreateCompanyButton,
  InviteClientButton,
} from "@/components/admin/companies-ui";

export const dynamic = "force-dynamic";

export default async function CompaniesPage() {
  const db = supabaseAdmin();
  const { data: companies } = await db
    .from("companies")
    .select("id, name, slug, created_at, engagements(count), profiles(count)")
    .order("created_at", { ascending: false });

  const count = (rel: unknown) =>
    (rel as { count: number }[] | null)?.[0]?.count ?? 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight">Companies</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Client organizations and their portal users.
          </p>
        </div>
        <CreateCompanyButton />
      </div>

      <div className="rounded-xl border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Company</TableHead>
              <TableHead>Engagements</TableHead>
              <TableHead>Portal users</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(companies ?? []).map((c) => (
              <TableRow key={c.id}>
                <TableCell>
                  <p className="font-medium">{c.name}</p>
                  <p className="text-muted-foreground text-xs">{c.slug}</p>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {count(c.engagements)}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {count(c.profiles)}
                </TableCell>
                <TableCell className="text-right">
                  <InviteClientButton companyId={c.id} companyName={c.name} />
                </TableCell>
              </TableRow>
            ))}
            {(companies ?? []).length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-muted-foreground h-24 text-center">
                  No companies yet.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
