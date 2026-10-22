"use client";

import { useState, useTransition } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { toast } from "sonner";
import { saveReport, setReportStatus } from "@/app/admin/engagements/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

function fd(entries: Record<string, string>): FormData {
  const f = new FormData();
  for (const [k, v] of Object.entries(entries)) f.set(k, v);
  return f;
}

export function ReportEditor({
  report,
  engagementId,
}: {
  report: {
    id: string;
    title: string;
    content: string;
    status: string;
  };
  engagementId: string;
}) {
  const [title, setTitle] = useState(report.title);
  const [content, setContent] = useState(report.content);
  const [status, setStatus] = useState(report.status);
  const [dirty, setDirty] = useState(false);
  const [saving, startSave] = useTransition();
  const [publishing, startPublish] = useTransition();

  const save = () =>
    startSave(async () => {
      const r = await saveReport(
        fd({ id: report.id, engagement_id: engagementId, title, content }),
      );
      if (r.ok) {
        setDirty(false);
        toast.success("Report saved.");
      } else {
        toast.error(r.error ?? "Save failed.");
      }
    });

  const toggleStatus = () =>
    startPublish(async () => {
      const next = status === "published" ? "draft" : "published";
      if (dirty) {
        const s = await saveReport(
          fd({ id: report.id, engagement_id: engagementId, title, content }),
        );
        if (!s.ok) {
          toast.error(s.error ?? "Save failed.");
          return;
        }
        setDirty(false);
      }
      const r = await setReportStatus(
        fd({ id: report.id, engagement_id: engagementId, status: next }),
      );
      if (r.ok) {
        setStatus(next);
        toast.success(r.message ?? "Done.");
      } else {
        toast.error(r.error ?? "Failed.");
      }
    });

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <Input
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            setDirty(true);
          }}
          className="max-w-xl text-base font-medium"
        />
        <Badge variant={status === "published" ? "default" : "secondary"}>
          {status}
        </Badge>
        <div className="ml-auto flex items-center gap-2">
          <Button variant="outline" onClick={save} disabled={saving || !dirty}>
            {saving ? "Saving…" : dirty ? "Save" : "Saved"}
          </Button>
          <Button onClick={toggleStatus} disabled={publishing}>
            {publishing
              ? "Working…"
              : status === "published"
                ? "Unpublish"
                : "Publish to portal"}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="edit">
        <TabsList>
          <TabsTrigger value="edit">Edit</TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
        </TabsList>
        <TabsContent value="edit" className="pt-2">
          <textarea
            value={content}
            onChange={(e) => {
              setContent(e.target.value);
              setDirty(true);
            }}
            spellCheck={false}
            className="border-input focus-visible:ring-ring/50 min-h-[70vh] w-full rounded-md border bg-transparent p-4 font-mono text-xs leading-relaxed shadow-xs outline-none focus-visible:ring-2"
          />
        </TabsContent>
        <TabsContent value="preview" className="pt-2">
          <div className="prose prose-sm prose-invert font-display prose-headings:font-display prose-headings:font-medium prose-headings:tracking-tight prose-a:text-teal prose-blockquote:not-italic prose-blockquote:border-teal/40 bg-card max-w-none rounded-md border p-6 text-[15px] leading-relaxed">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
