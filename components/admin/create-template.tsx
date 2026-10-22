"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createTemplate } from "@/app/admin/templates/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function CreateTemplateButton() {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>New template</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>New audit template</DialogTitle>
        </DialogHeader>
        <form
          action={async (fd) => {
            const r = await createTemplate(fd);
            if (r.ok && r.id) {
              setOpen(false);
              router.push(`/admin/templates/${r.id}`);
            } else {
              toast.error(r.error ?? "Could not create template.");
            }
          }}
          className="space-y-4"
        >
          <div className="space-y-2">
            <Label htmlFor="tpl-name">Name</Label>
            <Input
              id="tpl-name"
              name="name"
              placeholder="e.g. Agentic Readiness Audit"
              required
              autoFocus
            />
          </div>
          <p className="text-muted-foreground text-xs">
            Starts as a draft with the standard six besuper.ai dimensions — add
            questions and reference materials next.
          </p>
          <div className="flex justify-end">
            <Button type="submit">Create</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
