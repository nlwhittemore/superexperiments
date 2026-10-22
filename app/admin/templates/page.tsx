import Link from "next/link";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CreateTemplateButton } from "@/components/admin/create-template";

export const dynamic = "force-dynamic";

const statusVariant = {
  draft: "secondary",
  active: "default",
  archived: "outline",
} as const;

export default async function TemplatesPage() {
  const db = supabaseAdmin();
  const { data: templates } = await db
    .from("audit_templates")
    .select("id, name, status, created_at, questions(count)")
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight">Audit templates</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Question scripts, reference materials, and scoring dimensions.
          </p>
        </div>
        <CreateTemplateButton />
      </div>

      <div className="rounded-xl border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Questions</TableHead>
              <TableHead className="text-right">Created</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(templates ?? []).map((t) => (
              <TableRow key={t.id}>
                <TableCell>
                  <Link
                    href={`/admin/templates/${t.id}`}
                    className="font-medium hover:underline"
                  >
                    {t.name}
                  </Link>
                </TableCell>
                <TableCell>
                  <Badge
                    variant={
                      statusVariant[t.status as keyof typeof statusVariant] ??
                      "secondary"
                    }
                  >
                    {t.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {(t.questions as unknown as { count: number }[])[0]?.count ?? 0}
                </TableCell>
                <TableCell className="text-muted-foreground text-right">
                  {new Date(t.created_at).toLocaleDateString()}
                </TableCell>
              </TableRow>
            ))}
            {(templates ?? []).length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-muted-foreground h-24 text-center">
                  No templates yet — create your first one.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
