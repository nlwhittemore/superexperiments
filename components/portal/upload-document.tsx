"use client";

import { useRef, useState, useTransition } from "react";
import { toast } from "sonner";
import { Loader2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { uploadClientDocument } from "@/app/portal/actions";

export function UploadDocument({ engagementId }: { engagementId: string }) {
  const [pending, startTransition] = useTransition();
  const [title, setTitle] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const submit = () => {
    const file = fileRef.current?.files?.[0];
    if (!file) {
      toast.error("Choose a file to upload.");
      return;
    }
    const fd = new FormData();
    fd.set("engagement_id", engagementId);
    fd.set("title", title);
    fd.set("file", file);
    startTransition(async () => {
      const res = await uploadClientDocument(fd);
      if (res.ok) {
        toast.success(res.message ?? "Uploaded.");
        setTitle("");
        if (fileRef.current) fileRef.current.value = "";
      } else {
        toast.error(res.error ?? "Upload failed.");
      }
    });
  };

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
      <Input
        ref={fileRef}
        type="file"
        accept=".pdf,.docx,.txt,.md"
        className="sm:max-w-60"
        aria-label="Document file"
      />
      <Input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Title (optional)"
        className="sm:max-w-52"
      />
      <Button onClick={submit} disabled={pending} size="sm">
        {pending ? (
          <Loader2 className="size-3.5 animate-spin" />
        ) : (
          <Upload className="size-3.5" />
        )}
        Upload
      </Button>
    </div>
  );
}
