import { FormEvent, useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import type { EmbeddingStatus, KnowledgeDoc } from "../store/types";
import { useKnowledgeStore } from "../store/knowledgeStore";
import { fieldClass } from "./styles";

type FormState = {
  name: string;
  type: string;
  sizeKb: string;
  collection: string;
  tags: string;
  embeddingStatus: EmbeddingStatus;
  chunkCount: string;
};

const empty: FormState = {
  name: "",
  type: "PDF",
  sizeKb: "32",
  collection: "policies",
  tags: "",
  embeddingStatus: "pending",
  chunkCount: "0",
};

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export default function KnowledgeDocFormDialog({ open, onOpenChange }: Props) {
  const createDoc = useKnowledgeStore((s) => s.createDoc);
  const [form, setForm] = useState<FormState>(empty);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setSaving(false);
    setForm(empty);
  }, [open]);

  function parseTags(raw: string) {
    return raw
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (saving) return;
    const status = form.embeddingStatus;
    const sizeKb = Number(form.sizeKb) || 0;
    const chunkCount =
      status === "ready"
        ? Number(form.chunkCount) || Math.max(4, Math.round(sizeKb / 4))
        : Number(form.chunkCount) || 0;

    const payload: Omit<KnowledgeDoc, "id"> = {
      name: form.name.trim(),
      type: form.type.trim() || "PDF",
      sizeKb,
      embeddingStatus: status,
      indexed: status === "ready",
      uploadedAt: new Date().toISOString().slice(0, 10),
      chunkCount,
      lastIndexedAt: status === "ready" ? new Date().toISOString() : null,
      collection: form.collection.trim() || "support",
      tags: parseTags(form.tags),
    };
    if (!payload.name) return;
    setSaving(true);
    try {
      await createDoc(payload);
      onOpenChange(false);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (saving) return;
        onOpenChange(next);
      }}
    >
      <DialogContent className="max-h-[90vh] w-[calc(100%-1.5rem)] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Add document</DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-3">
          <fieldset disabled={saving} className="space-y-3 border-0 p-0">
            <div className="space-y-1.5">
              <Label htmlFor="doc-name">File name</Label>
              <input
                id="doc-name"
                className={fieldClass()}
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="returns-policy.pdf"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="doc-type">Type</Label>
                <input
                  id="doc-type"
                  className={fieldClass()}
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="doc-size">Size (KB)</Label>
                <input
                  id="doc-size"
                  type="number"
                  min={0}
                  className={fieldClass()}
                  value={form.sizeKb}
                  onChange={(e) => setForm({ ...form, sizeKb: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="doc-collection">Collection</Label>
                <input
                  id="doc-collection"
                  className={fieldClass()}
                  value={form.collection}
                  onChange={(e) =>
                    setForm({ ...form, collection: e.target.value })
                  }
                  placeholder="policies"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="doc-status">Embedding status</Label>
                <select
                  id="doc-status"
                  className={fieldClass()}
                  value={form.embeddingStatus}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      embeddingStatus: e.target.value as EmbeddingStatus,
                    })
                  }
                >
                  <option value="ready">ready</option>
                  <option value="pending">pending</option>
                  <option value="indexing">indexing</option>
                  <option value="failed">failed</option>
                </select>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="doc-chunks">Chunk count</Label>
              <input
                id="doc-chunks"
                type="number"
                min={0}
                className={fieldClass()}
                value={form.chunkCount}
                onChange={(e) =>
                  setForm({ ...form, chunkCount: e.target.value })
                }
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="doc-tags">Tags (comma-separated)</Label>
              <input
                id="doc-tags"
                className={fieldClass()}
                value={form.tags}
                onChange={(e) => setForm({ ...form, tags: e.target.value })}
                placeholder="returns, refunds"
              />
            </div>
          </fieldset>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              disabled={saving}
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={saving}
              className="bg-teal-800 text-white hover:bg-teal-700"
            >
              {saving ? <Loader2 className="size-4 animate-spin" /> : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
