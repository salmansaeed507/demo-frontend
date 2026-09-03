import { FormEvent, useRef, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { knowledgeDocs, type KnowledgeDoc } from "../../mock/admin";

export default function KnowledgeBasePage() {
  const [docs, setDocs] = useState<KnowledgeDoc[]>(knowledgeDocs);
  const [note, setNote] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  function onUpload(e: FormEvent) {
    e.preventDefault();
    const file = fileRef.current?.files?.[0];
    if (!file) {
      setNote("Choose a file to simulate an upload.");
      return;
    }
    const next: KnowledgeDoc = {
      id: `doc-${Date.now()}`,
      name: file.name,
      type: file.name.split(".").pop()?.toUpperCase() ?? "FILE",
      sizeKb: Math.max(1, Math.round(file.size / 1024)),
      indexed: false,
      uploadedAt: new Date().toISOString().slice(0, 10),
    };
    setDocs((prev) => [next, ...prev]);
    setNote(`Queued “${file.name}” for indexing (UI-only — not uploaded).`);
    if (fileRef.current) fileRef.current.value = "";
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Upload document</CardTitle>
          <CardDescription>
            Policies, FAQs, shipping, returns — accepted as a demo file pick.
          </CardDescription>
        </CardHeader>
        <form onSubmit={onUpload}>
          <CardContent className="space-y-3">
            <div className="grid gap-1.5">
              <Label htmlFor="kb-file">Document</Label>
              <Input id="kb-file" ref={fileRef} type="file" />
            </div>
            {note && <p className="text-sm text-muted-foreground">{note}</p>}
          </CardContent>
          <CardFooter>
            <Button type="submit">Upload &amp; queue indexing</Button>
          </CardFooter>
        </form>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Indexed documents</CardTitle>
          <CardDescription>{docs.length} documents in demo KB</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Size</TableHead>
                <TableHead>Indexed</TableHead>
                <TableHead>Uploaded</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {docs.map((d) => (
                <TableRow key={d.id}>
                  <TableCell className="font-medium">{d.name}</TableCell>
                  <TableCell>{d.type}</TableCell>
                  <TableCell>{d.sizeKb} KB</TableCell>
                  <TableCell>
                    <Badge variant={d.indexed ? "secondary" : "outline"}>
                      {d.indexed ? "yes" : "pending"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {d.uploadedAt}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
