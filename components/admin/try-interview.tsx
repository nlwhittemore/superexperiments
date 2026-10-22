"use client";

import { useState } from "react";
import { ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { createPreviewLink } from "@/app/admin/templates/actions";
import { Button } from "@/components/ui/button";

export function TryInterviewButton({ templateId }: { templateId: string }) {
  const [busy, setBusy] = useState(false);
  return (
    <Button
      variant="outline"
      disabled={busy}
      onClick={async () => {
        setBusy(true);
        const f = new FormData();
        f.set("template_id", templateId);
        const r = await createPreviewLink(f);
        setBusy(false);
        if (r.ok && r.url) window.open(r.url, "_blank");
        else toast.error(r.error ?? "Could not set up a preview.");
      }}
    >
      <ExternalLink className="size-3.5" />
      {busy ? "Setting up…" : "Try the interview"}
    </Button>
  );
}
