"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  addParticipant,
  bulkAddParticipants,
  deleteDocument,
  deleteParticipant,
  sendInvites,
  updateEngagementSettings,
  uploadDocument,
} from "@/app/admin/engagements/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Copy, FileText, Mail, Plus, Trash2 } from "lucide-react";

const selectCls =
  "border-input h-9 w-full rounded-md border bg-transparent px-3 text-sm shadow-xs outline-none focus-visible:ring-2 focus-visible:ring-ring/50";

function fd(entries: Record<string, string>): FormData {
  const f = new FormData();
  for (const [k, v] of Object.entries(entries)) f.set(k, v);
  return f;
}

export type ParticipantRow = {
  id: string;
  name: string;
  email: string | null;
  role_title: string | null;
  segment: string;
  status: string;
  token: string;
  covered: number;
};

export type DocumentRow = {
  id: string;
  title: string;
  file_name: string;
  size: number;
  source: string;
  extraction_status: string;
  extracted_chars: number;
  created_at: string;
};

const participantStatusVariant = {
  invited: "outline",
  started: "secondary",
  completed: "default",
} as const;

export function ParticipantsSection({
  engagementId,
  participants,
  totalQuestions,
}: {
  engagementId: string;
  participants: ParticipantRow[];
  totalQuestions: number;
}) {
  const [sending, setSending] = useState(false);

  return (
    <Card>
      <CardHeader className="flex-row items-start justify-between space-y-0">
        <div>
          <CardTitle>Participants</CardTitle>
          <CardDescription>
            Each person gets a private interview link — no account needed.
          </CardDescription>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={sending}
            onClick={async () => {
              setSending(true);
              const r = await sendInvites(fd({ engagement_id: engagementId }));
              setSending(false);
              if (r.message) toast.success(r.message);
              if (r.error) toast.error(r.error);
            }}
          >
            <Mail className="size-3.5" />
            {sending ? "Sending…" : "Email invites"}
          </Button>
          <AddParticipantsDialog engagementId={engagementId} />
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Segment</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {participants.map((p) => (
              <TableRow key={p.id}>
                <TableCell>
                  <p className="font-medium">{p.name}</p>
                  <p className="text-muted-foreground text-xs">
                    {p.email ?? "no email"}
                  </p>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {p.role_title ?? "—"}
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="text-[10px]">
                    {p.segment}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge
                    variant={
                      participantStatusVariant[
                        p.status as keyof typeof participantStatusVariant
                      ] ?? "outline"
                    }
                  >
                    {p.status}
                  </Badge>
                  {p.status === "started" && (
                    <span className="text-muted-foreground ml-2 text-xs tabular-nums">
                      {p.covered}/{totalQuestions}
                    </span>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-0.5">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-7"
                      aria-label="Copy interview link"
                      onClick={() => {
                        navigator.clipboard.writeText(
                          `${window.location.origin}/i/${p.token}`,
                        );
                        toast.success(`Link copied for ${p.name}.`);
                      }}
                    >
                      <Copy className="size-3.5" />
                    </Button>
                    {p.status !== "invited" && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 px-2 text-xs"
                        asChild
                      >
                        <Link
                          href={`/admin/engagements/${engagementId}/participants/${p.id}`}
                        >
                          Transcript
                        </Link>
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-muted-foreground hover:text-destructive size-7"
                      aria-label="Delete participant"
                      onClick={async () => {
                        if (
                          !confirm(
                            `Remove ${p.name}? Their interview data is deleted too.`,
                          )
                        )
                          return;
                        const r = await deleteParticipant(
                          fd({ id: p.id, engagement_id: engagementId }),
                        );
                        if (!r.ok) toast.error(r.error ?? "Delete failed.");
                      }}
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {participants.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-muted-foreground h-24 text-center">
                  No participants yet — add them individually or paste a list.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

function AddParticipantsDialog({ engagementId }: { engagementId: string }) {
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="size-3.5" /> Add participants
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Add participants</DialogTitle>
        </DialogHeader>
        <Tabs defaultValue="single">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="single">One at a time</TabsTrigger>
            <TabsTrigger value="bulk">Paste a list</TabsTrigger>
          </TabsList>
          <TabsContent value="single" className="pt-2">
            <form
              action={async (data) => {
                const r = await addParticipant(data);
                if (r.ok) {
                  toast.success("Participant added.");
                  setOpen(false);
                } else {
                  toast.error(r.error ?? "Could not add participant.");
                }
              }}
              className="space-y-4"
            >
              <input type="hidden" name="engagement_id" value={engagementId} />
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="p-name">Name</Label>
                  <Input id="p-name" name="name" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="p-email">Email</Label>
                  <Input id="p-email" name="email" type="email" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="p-role">Role title</Label>
                  <Input id="p-role" name="role_title" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="p-segment">Segment</Label>
                  <select id="p-segment" name="segment" className={selectCls}>
                    <option value="ic">Individual contributor</option>
                    <option value="leader">Leader</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end">
                <Button type="submit">Add</Button>
              </div>
            </form>
          </TabsContent>
          <TabsContent value="bulk" className="pt-2">
            <form
              action={async (data) => {
                const r = await bulkAddParticipants(data);
                if (r.ok) {
                  toast.success(r.message ?? "Participants added.");
                  setOpen(false);
                } else {
                  toast.error(r.error ?? "Could not add participants.");
                }
              }}
              className="space-y-4"
            >
              <input type="hidden" name="engagement_id" value={engagementId} />
              <div className="space-y-2">
                <Label htmlFor="p-list">One per line</Label>
                <Textarea
                  id="p-list"
                  name="list"
                  rows={8}
                  placeholder={
                    "Name, email, role title, leader|ic\nDana Reyes, dana@acme.com, VP Operations, leader\nSam Lee, sam@acme.com, Analyst, ic"
                  }
                  className="font-mono text-xs"
                  required
                />
              </div>
              <div className="flex justify-end">
                <Button type="submit">Add all</Button>
              </div>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

function extractionLabel(d: DocumentRow): string {
  if (d.extraction_status === "failed") return "extraction failed";
  if (d.extraction_status === "pending") return "extraction pending";
  return d.extracted_chars > 0 ? "text extracted" : "no text found";
}

export function DocumentsSection({
  engagementId,
  documents,
}: {
  engagementId: string;
  documents: DocumentRow[];
}) {
  const [uploading, setUploading] = useState(false);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Documents</CardTitle>
        <CardDescription>
          Company background that feeds the analysis — org charts, strategy
          docs, tooling inventories. PDF, DOCX, TXT, or MD.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <form
          action={async (data) => {
            setUploading(true);
            const r = await uploadDocument(data);
            setUploading(false);
            if (r.message && r.ok) toast.success(r.message);
            else toast.error(r.error ?? r.message ?? "Upload failed.");
          }}
          className="flex flex-wrap items-end gap-3"
        >
          <input type="hidden" name="engagement_id" value={engagementId} />
          <div className="min-w-48 flex-1 space-y-2">
            <Label htmlFor="doc-title">Title (optional)</Label>
            <Input id="doc-title" name="title" placeholder="e.g. 2026 Ops Tooling Inventory" />
          </div>
          <div className="min-w-56 flex-1 space-y-2">
            <Label htmlFor="doc-file">File</Label>
            <Input
              id="doc-file"
              name="file"
              type="file"
              required
              accept=".pdf,.docx,.txt,.md,application/pdf,text/plain,text/markdown,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            />
          </div>
          <Button type="submit" disabled={uploading}>
            {uploading ? "Uploading…" : "Upload"}
          </Button>
        </form>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Document</TableHead>
              <TableHead>Source</TableHead>
              <TableHead>Extraction</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {documents.map((d) => (
              <TableRow key={d.id}>
                <TableCell>
                  <p className="flex items-center gap-1.5 font-medium">
                    <FileText className="text-muted-foreground size-3.5" />
                    {d.title}
                  </p>
                  <p className="text-muted-foreground text-xs">
                    {d.file_name} · {(d.size / 1024).toFixed(0)} KB ·{" "}
                    {new Date(d.created_at).toLocaleDateString()}
                  </p>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="text-[10px]">
                    {d.source}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground text-xs">
                  {extractionLabel(d)}
                  {d.extracted_chars > 0 && (
                    <span className="tabular-nums">
                      {" "}
                      · {d.extracted_chars.toLocaleString()} chars
                    </span>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-muted-foreground hover:text-destructive size-7"
                    aria-label="Delete document"
                    onClick={async () => {
                      if (!confirm(`Delete "${d.title}"?`)) return;
                      const r = await deleteDocument(
                        fd({ id: d.id, engagement_id: engagementId }),
                      );
                      if (!r.ok) toast.error(r.error ?? "Delete failed.");
                    }}
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {documents.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-muted-foreground h-20 text-center">
                  No documents yet.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

export function SettingsSection({
  engagement,
}: {
  engagement: {
    id: string;
    status: string;
    auto_assess: boolean;
    notes: string | null;
  };
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Settings</CardTitle>
        <CardDescription>
          Interview links only work while the engagement is active or analyzing.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          action={async (data) => {
            const r = await updateEngagementSettings(data);
            if (r.ok) toast.success("Settings saved.");
            else toast.error(r.error ?? "Save failed.");
          }}
          className="space-y-5"
        >
          <input type="hidden" name="id" value={engagement.id} />
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="eng-status">Status</Label>
              <select
                id="eng-status"
                name="status"
                defaultValue={engagement.status}
                className={selectCls}
              >
                <option value="setup">Setup</option>
                <option value="active">Active (interviews open)</option>
                <option value="analyzing">Analyzing</option>
                <option value="delivered">Delivered</option>
                <option value="archived">Archived</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="eng-auto">Auto-assess</Label>
              <div className="flex h-9 items-center gap-3">
                <Switch
                  id="eng-auto"
                  name="auto_assess"
                  defaultChecked={engagement.auto_assess}
                />
                <span className="text-muted-foreground text-xs">
                  Score each interview the moment it completes
                </span>
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="eng-notes">Internal notes</Label>
            <Textarea
              id="eng-notes"
              name="notes"
              rows={3}
              defaultValue={engagement.notes ?? ""}
            />
          </div>
          <div className="flex justify-end">
            <Button type="submit">Save settings</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
