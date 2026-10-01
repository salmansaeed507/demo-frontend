import {
  FormEvent,
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
} from "react";
import { FileUp, Loader2 } from "lucide-react";
import { upload } from "@/api/s3Client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useKnowledgeStore } from "../store/knowledgeStore";

const ALLOWED_EXTENSIONS = [".txt", ".md", ".docx", ".pdf"] as const;

const EXT_TO_TYPE: Record<(typeof ALLOWED_EXTENSIONS)[number], string> = {
  ".txt": "TXT",
  ".md": "Markdown",
  ".docx": "DOCX",
  ".pdf": "PDF",
};

function fileExtension(name: string): string {
  const i = name.lastIndexOf(".");
  return i >= 0 ? name.slice(i).toLowerCase() : "";
}

function isAllowedDoc(file: File): boolean {
  const ext = fileExtension(file.name);
  return (ALLOWED_EXTENSIONS as readonly string[]).includes(ext);
}

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export default function KnowledgeDocFormDialog({ open, onOpenChange }: Props) {
  const createDoc = useKnowledgeStore((s) => s.createDoc);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setSaving(false);
    setFile(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, [open]);

  function onFileSelected(e: ChangeEvent<HTMLInputElement>) {
    const next = e.target.files?.[0] ?? null;
    setError(null);
    if (!next) {
      setFile(null);
      return;
    }
    if (!isAllowedDoc(next)) {
      setFile(null);
      e.target.value = "";
      setError("Only .txt, .md, .docx, or .pdf files are allowed.");
      return;
    }
    setFile(next);
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!file || saving) return;
    if (!isAllowedDoc(file)) {
      setError("Only .txt, .md, .docx, or .pdf files are allowed.");
      return;
    }

    const ext = fileExtension(file.name) as (typeof ALLOWED_EXTENSIONS)[number];
    setSaving(true);
    setError(null);
    try {
      const uploaded = await upload(file);
      await createDoc({
        name: file.name,
        type: EXT_TO_TYPE[ext],
        sizeKb: Math.max(1, Math.round(file.size / 1024)),
        embeddingStatus: "pending",
        indexed: false,
        uploadedAt: new Date().toISOString().slice(0, 10),
        chunkCount: 0,
        lastIndexedAt: null,
        collection: "support",
        tags: [],
        fileUrl: uploaded.key,
      });
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
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
      <DialogContent className="w-[calc(100%-1.5rem)] sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add document</DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <fieldset disabled={saving} className="space-y-3 border-0 p-0">
            <div className="space-y-1.5">
              <Label htmlFor="doc-file">Document</Label>
              <p className="text-xs text-muted-foreground">
                Upload a .txt, .md, .docx, or .pdf file. It will be stored in S3
                and added to the knowledge base.
              </p>
              <input
                ref={fileInputRef}
                id="doc-file"
                type="file"
                accept=".txt,.md,.docx,.pdf,text/plain,text/markdown,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                className="sr-only"
                onChange={onFileSelected}
              />
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <FileUp data-icon="inline-start" />
                  Choose file
                </Button>
                <span className="truncate text-sm text-slate-600">
                  {file ? file.name : "No file selected"}
                </span>
              </div>
              {error ? (
                <p className="text-sm text-rose-600">{error}</p>
              ) : null}
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
              disabled={saving || !file}
              className="bg-teal-800 text-white hover:bg-teal-700"
            >
              {saving ? <Loader2 className="size-4 animate-spin" /> : "Upload"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
