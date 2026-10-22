"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createEngagement } from "@/app/admin/engagements/actions";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const selectCls =
  "border-input h-9 w-full rounded-md border bg-transparent px-3 text-sm shadow-xs outline-none focus-visible:ring-2 focus-visible:ring-ring/50";

export function NewEngagementButton({
  companies,
  templates,
}: {
  companies: { id: string; name: string }[];
  templates: { id: string; name: string; status: string }[];
}) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const usable = templates.filter((t) => t.status !== "archived");

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>New engagement</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>New engagement</DialogTitle>
        </DialogHeader>
        {companies.length === 0 || usable.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            You need at least one company and one non-archived template first.
          </p>
        ) : (
          <form
            action={async (fd) => {
              const r = await createEngagement(fd);
              if (r.ok && r.id) {
                setOpen(false);
                router.push(`/admin/engagements/${r.id}`);
              } else {
                toast.error(r.error ?? "Could not create engagement.");
              }
            }}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label htmlFor="ne-company">Company</Label>
              <select id="ne-company" name="company_id" className={selectCls} required>
                {companies.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="ne-template">Audit template</Label>
              <select id="ne-template" name="template_id" className={selectCls} required>
                {usable.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                    {t.status === "draft" ? " (draft)" : ""}
                  </option>
                ))}
              </select>
            </div>
            <p className="text-muted-foreground text-xs">
              Starts in <span className="font-medium">setup</span> — add
              participants, then set it active to open the interview links.
            </p>
            <div className="flex justify-end">
              <Button type="submit">Create</Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
