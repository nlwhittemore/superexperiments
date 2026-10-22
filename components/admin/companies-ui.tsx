"use client";

import { useState } from "react";
import { toast } from "sonner";
import { createCompany, inviteClientUser } from "@/app/admin/companies/actions";
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

export function CreateCompanyButton() {
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>New company</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>New company</DialogTitle>
        </DialogHeader>
        <form
          action={async (fd) => {
            const r = await createCompany(fd);
            if (r.ok) {
              toast.success("Company created.");
              setOpen(false);
            } else {
              toast.error(r.error ?? "Could not create company.");
            }
          }}
          className="space-y-4"
        >
          <div className="space-y-2">
            <Label htmlFor="company-name">Name</Label>
            <Input id="company-name" name="name" required autoFocus />
          </div>
          <div className="flex justify-end">
            <Button type="submit">Create</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function InviteClientButton({
  companyId,
  companyName,
}: {
  companyId: string;
  companyName: string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          Invite client user
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Invite a client user — {companyName}</DialogTitle>
        </DialogHeader>
        <form
          action={async (fd) => {
            const r = await inviteClientUser(fd);
            if (r.ok) {
              toast.success("Invite sent — they'll get an email to set a password.");
              setOpen(false);
            } else {
              toast.error(r.error ?? "Invite failed.");
            }
          }}
          className="space-y-4"
        >
          <input type="hidden" name="company_id" value={companyId} />
          <div className="space-y-2">
            <Label htmlFor="invite-email">Email</Label>
            <Input id="invite-email" name="email" type="email" required autoFocus />
          </div>
          <div className="space-y-2">
            <Label htmlFor="invite-name">Full name (optional)</Label>
            <Input id="invite-name" name="full_name" />
          </div>
          <p className="text-muted-foreground text-xs">
            They get portal access scoped to {companyName}: progress, document
            uploads, and published reports — never transcripts.
          </p>
          <div className="flex justify-end">
            <Button type="submit">Send invite</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
