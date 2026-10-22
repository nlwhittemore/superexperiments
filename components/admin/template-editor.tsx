"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  addQuestion,
  createPreviewLink,
  deleteMaterial,
  deleteQuestion,
  moveQuestion,
  saveDimensions,
  saveMaterial,
  updateQuestion,
  updateTemplateMeta,
} from "@/app/admin/templates/actions";
import type { Dimension, MaturityLevelDef, Question } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { ArrowDown, ArrowUp, ExternalLink, Plus, Trash2 } from "lucide-react";

const selectCls =
  "border-input h-9 w-full rounded-md border bg-transparent px-3 text-sm shadow-xs outline-none focus-visible:ring-2 focus-visible:ring-ring/50";

function fd(entries: Record<string, string>): FormData {
  const f = new FormData();
  for (const [k, v] of Object.entries(entries)) f.set(k, v);
  return f;
}

export type TemplateRow = {
  id: string;
  name: string;
  description: string | null;
  intro_message: string | null;
  status: string;
};

export type MaterialRow = {
  id: string;
  kind: string;
  title: string;
  content: string;
};

export function TemplateEditor({
  template,
  questions,
  materials,
  dimensions,
  maturityLevels,
}: {
  template: TemplateRow;
  questions: Question[];
  materials: MaterialRow[];
  dimensions: Dimension[];
  maturityLevels: MaturityLevelDef[];
}) {
  return (
    <div className="space-y-6">
      <MetaSection template={template} />
      <QuestionsSection
        templateId={template.id}
        questions={questions}
        dimensions={dimensions}
      />
      <MaterialsSection templateId={template.id} materials={materials} />
      <DimensionsSection
        templateId={template.id}
        dimensions={dimensions}
        maturityLevels={maturityLevels}
      />
    </div>
  );
}

function MetaSection({ template }: { template: TemplateRow }) {
  const [previewing, setPreviewing] = useState(false);
  return (
    <Card>
      <CardHeader className="flex-row items-start justify-between space-y-0">
        <div>
          <CardTitle>Template</CardTitle>
          <CardDescription>
            The intro message is shown to participants on the welcome screen.
          </CardDescription>
        </div>
        <Button
          variant="outline"
          size="sm"
          disabled={previewing}
          onClick={async () => {
            setPreviewing(true);
            const r = await createPreviewLink(fd({ template_id: template.id }));
            setPreviewing(false);
            if (r.ok && r.url) {
              window.open(r.url, "_blank");
            } else {
              toast.error(r.error ?? "Preview failed.");
            }
          }}
        >
          <ExternalLink className="size-3.5" />
          {previewing ? "Setting up…" : "Preview interview"}
        </Button>
      </CardHeader>
      <CardContent>
        <form
          action={async (data) => {
            const r = await updateTemplateMeta(data);
            if (r.ok) toast.success("Template saved.");
            else toast.error(r.error ?? "Save failed.");
          }}
          className="space-y-4"
        >
          <input type="hidden" name="id" value={template.id} />
          <div className="grid gap-4 sm:grid-cols-[1fr_180px]">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" name="name" defaultValue={template.name} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <select
                id="status"
                name="status"
                defaultValue={template.status}
                className={selectCls}
              >
                <option value="draft">Draft</option>
                <option value="active">Active</option>
                <option value="archived">Archived</option>
              </select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Internal description</Label>
            <Input
              id="description"
              name="description"
              defaultValue={template.description ?? ""}
              placeholder="What this template is for (team-only)"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="intro_message">Participant intro message</Label>
            <Textarea
              id="intro_message"
              name="intro_message"
              defaultValue={template.intro_message ?? ""}
              rows={5}
              placeholder="Shown on the welcome screen. Separate paragraphs with a blank line."
            />
          </div>
          <div className="flex justify-end">
            <Button type="submit">Save template</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

function QuestionDialog({
  templateId,
  dimensions,
  question,
  trigger,
}: {
  templateId: string;
  dimensions: Dimension[];
  question?: Question;
  trigger: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>
            {question ? `Edit question ${question.position}` : "Add question"}
          </DialogTitle>
        </DialogHeader>
        <form
          action={async (data) => {
            const r = question
              ? await updateQuestion(data)
              : await addQuestion(data);
            if (r.ok) {
              toast.success("Question saved.");
              setOpen(false);
            } else {
              toast.error(r.error ?? "Save failed.");
            }
          }}
          className="space-y-4"
        >
          <input type="hidden" name="template_id" value={templateId} />
          {question && <input type="hidden" name="id" value={question.id} />}
          <div className="space-y-2">
            <Label htmlFor="q-prompt">Question (as asked)</Label>
            <Textarea
              id="q-prompt"
              name="prompt"
              defaultValue={question?.prompt ?? ""}
              rows={3}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="q-intent">What we&apos;re trying to learn</Label>
            <Textarea
              id="q-intent"
              name="intent"
              defaultValue={question?.intent ?? ""}
              rows={2}
              placeholder="Internal — guides the interviewer and the assessment"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="q-probe">Probing guidance</Label>
            <Textarea
              id="q-probe"
              name="probe_guidance"
              defaultValue={question?.probe_guidance ?? ""}
              rows={2}
              placeholder="When and how to dig deeper"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="q-dimension">Dimension</Label>
            <select
              id="q-dimension"
              name="dimension"
              defaultValue={question?.dimension ?? ""}
              className={selectCls}
            >
              <option value="">— none —</option>
              {dimensions.map((d) => (
                <option key={d.key} value={d.key}>
                  {d.label}
                </option>
              ))}
            </select>
          </div>
          <div className="flex justify-end">
            <Button type="submit">{question ? "Save" : "Add question"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function QuestionsSection({
  templateId,
  questions,
  dimensions,
}: {
  templateId: string;
  questions: Question[];
  dimensions: Dimension[];
}) {
  const dimLabel = (key: string | null) =>
    dimensions.find((d) => d.key === key)?.label ?? key;

  return (
    <Card>
      <CardHeader className="flex-row items-start justify-between space-y-0">
        <div>
          <CardTitle>Questions</CardTitle>
          <CardDescription>
            Asked in order. Intent and probing guidance stay internal.
          </CardDescription>
        </div>
        <QuestionDialog
          templateId={templateId}
          dimensions={dimensions}
          trigger={
            <Button size="sm">
              <Plus className="size-3.5" /> Add question
            </Button>
          }
        />
      </CardHeader>
      <CardContent className="space-y-2">
        {questions.length === 0 && (
          <p className="text-muted-foreground py-6 text-center text-sm">
            No questions yet.
          </p>
        )}
        {questions.map((q, i) => (
          <div
            key={q.id}
            className="border-border/70 flex items-start gap-3 rounded-lg border px-3 py-2.5"
          >
            <span className="text-muted-foreground mt-0.5 w-6 shrink-0 text-right text-sm tabular-nums">
              {q.position}.
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm leading-snug">{q.prompt}</p>
              <div className="mt-1 flex flex-wrap items-center gap-2">
                {q.dimension && (
                  <Badge variant="secondary" className="text-[10px]">
                    {dimLabel(q.dimension)}
                  </Badge>
                )}
                {q.intent && (
                  <span className="text-muted-foreground truncate text-xs">
                    {q.intent}
                  </span>
                )}
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-0.5">
              <Button
                variant="ghost"
                size="icon"
                className="size-7"
                disabled={i === 0}
                aria-label="Move up"
                onClick={() =>
                  moveQuestion(
                    fd({ id: q.id, template_id: templateId, direction: "up" }),
                  )
                }
              >
                <ArrowUp className="size-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="size-7"
                disabled={i === questions.length - 1}
                aria-label="Move down"
                onClick={() =>
                  moveQuestion(
                    fd({ id: q.id, template_id: templateId, direction: "down" }),
                  )
                }
              >
                <ArrowDown className="size-3.5" />
              </Button>
              <QuestionDialog
                templateId={templateId}
                dimensions={dimensions}
                question={q}
                trigger={
                  <Button variant="ghost" size="sm" className="h-7 px-2 text-xs">
                    Edit
                  </Button>
                }
              />
              <Button
                variant="ghost"
                size="icon"
                className="text-muted-foreground hover:text-destructive size-7"
                aria-label="Delete question"
                onClick={async () => {
                  if (!confirm("Delete this question?")) return;
                  const r = await deleteQuestion(
                    fd({ id: q.id, template_id: templateId }),
                  );
                  if (!r.ok) toast.error(r.error ?? "Delete failed.");
                }}
              >
                <Trash2 className="size-3.5" />
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function MaterialDialog({
  templateId,
  material,
  trigger,
}: {
  templateId: string;
  material?: MaterialRow;
  trigger: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="flex max-h-[85vh] flex-col sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>
            {material ? "Edit reference material" : "Add reference material"}
          </DialogTitle>
        </DialogHeader>
        <form
          action={async (data) => {
            const r = await saveMaterial(data);
            if (r.ok) {
              toast.success("Material saved.");
              setOpen(false);
            } else {
              toast.error(r.error ?? "Save failed.");
            }
          }}
          className="flex min-h-0 flex-1 flex-col space-y-4"
        >
          <input type="hidden" name="template_id" value={templateId} />
          {material && <input type="hidden" name="id" value={material.id} />}
          <div className="grid gap-4 sm:grid-cols-[1fr_200px]">
            <div className="space-y-2">
              <Label htmlFor="m-title">Title</Label>
              <Input
                id="m-title"
                name="title"
                defaultValue={material?.title ?? ""}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="m-kind">Kind</Label>
              <select
                id="m-kind"
                name="kind"
                defaultValue={material?.kind ?? "context"}
                className={selectCls}
              >
                <option value="rubric">Rubric (scoring)</option>
                <option value="playbook">Playbook (recommendations)</option>
                <option value="context">Context</option>
              </select>
            </div>
          </div>
          <div className="flex min-h-0 flex-1 flex-col space-y-2">
            <Label htmlFor="m-content">Content (markdown)</Label>
            <Textarea
              id="m-content"
              name="content"
              defaultValue={material?.content ?? ""}
              required
              className="min-h-64 flex-1 font-mono text-xs leading-relaxed"
            />
          </div>
          <div className="flex justify-end">
            <Button type="submit">Save material</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

const kindVariant = {
  rubric: "default",
  playbook: "secondary",
  context: "outline",
} as const;

function MaterialsSection({
  templateId,
  materials,
}: {
  templateId: string;
  materials: MaterialRow[];
}) {
  return (
    <Card>
      <CardHeader className="flex-row items-start justify-between space-y-0">
        <div>
          <CardTitle>Reference materials</CardTitle>
          <CardDescription>
            The rubric drives scoring; the playbook drives recommendations.
          </CardDescription>
        </div>
        <MaterialDialog
          templateId={templateId}
          trigger={
            <Button size="sm">
              <Plus className="size-3.5" /> Add material
            </Button>
          }
        />
      </CardHeader>
      <CardContent className="space-y-2">
        {materials.length === 0 && (
          <p className="text-muted-foreground py-6 text-center text-sm">
            No reference materials yet.
          </p>
        )}
        {materials.map((m) => (
          <div
            key={m.id}
            className="border-border/70 flex items-center gap-3 rounded-lg border px-3 py-2.5"
          >
            <Badge
              variant={kindVariant[m.kind as keyof typeof kindVariant] ?? "outline"}
              className="shrink-0 text-[10px]"
            >
              {m.kind}
            </Badge>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{m.title}</p>
              <p className="text-muted-foreground text-xs">
                {m.content.length.toLocaleString()} characters
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-0.5">
              <MaterialDialog
                templateId={templateId}
                material={m}
                trigger={
                  <Button variant="ghost" size="sm" className="h-7 px-2 text-xs">
                    Edit
                  </Button>
                }
              />
              <Button
                variant="ghost"
                size="icon"
                className="text-muted-foreground hover:text-destructive size-7"
                aria-label="Delete material"
                onClick={async () => {
                  if (!confirm(`Delete "${m.title}"?`)) return;
                  const r = await deleteMaterial(
                    fd({ id: m.id, template_id: templateId }),
                  );
                  if (!r.ok) toast.error(r.error ?? "Delete failed.");
                }}
              >
                <Trash2 className="size-3.5" />
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function DimensionsSection({
  templateId,
  dimensions,
  maturityLevels,
}: {
  templateId: string;
  dimensions: Dimension[];
  maturityLevels: MaturityLevelDef[];
}) {
  const [rows, setRows] = useState<(Dimension & { isNew?: boolean })[]>(
    dimensions,
  );
  const [saving, setSaving] = useState(false);

  function update(i: number, patch: Partial<Dimension>) {
    setRows((r) => r.map((row, j) => (j === i ? { ...row, ...patch } : row)));
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Scoring dimensions</CardTitle>
        <CardDescription>
          Each dimension is scored 0–4 during analysis. Keys are referenced by
          questions and assessments — they lock after creation.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          {rows.map((d, i) => (
            <div
              key={i}
              className="grid items-start gap-2 sm:grid-cols-[140px_160px_1fr_32px]"
            >
              <Input
                value={d.key}
                disabled={!d.isNew}
                placeholder="key_snake"
                onChange={(e) => update(i, { key: e.target.value })}
              />
              <Input
                value={d.label}
                placeholder="Label"
                onChange={(e) => update(i, { label: e.target.value })}
              />
              <Input
                value={d.description}
                placeholder="What a high score means"
                onChange={(e) => update(i, { description: e.target.value })}
              />
              <Button
                variant="ghost"
                size="icon"
                className="text-muted-foreground hover:text-destructive size-9"
                aria-label="Remove dimension"
                onClick={() => setRows((r) => r.filter((_, j) => j !== i))}
              >
                <Trash2 className="size-3.5" />
              </Button>
            </div>
          ))}
        </div>
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              setRows((r) => [
                ...r,
                { key: "", label: "", description: "", isNew: true },
              ])
            }
          >
            <Plus className="size-3.5" /> Add dimension
          </Button>
          <Button
            size="sm"
            disabled={saving}
            onClick={async () => {
              setSaving(true);
              const r = await saveDimensions(
                fd({
                  id: templateId,
                  dimensions: JSON.stringify(
                    rows.map(({ key, label, description }) => ({
                      key,
                      label,
                      description,
                    })),
                  ),
                }),
              );
              setSaving(false);
              if (r.ok) toast.success("Dimensions saved.");
              else toast.error(r.error ?? "Save failed.");
            }}
          >
            {saving ? "Saving…" : "Save dimensions"}
          </Button>
        </div>

        {maturityLevels.length > 0 && (
          <div className="border-border/70 rounded-lg border px-4 py-3">
            <p className="mb-2 text-xs font-medium tracking-wide uppercase">
              Maturity ladder (headline metric)
            </p>
            <div className="space-y-1">
              {maturityLevels.map((l) => (
                <p key={l.level} className="text-muted-foreground text-xs">
                  <span className="text-foreground font-medium">
                    L{l.level} {l.name}
                  </span>{" "}
                  — {l.description}
                </p>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
