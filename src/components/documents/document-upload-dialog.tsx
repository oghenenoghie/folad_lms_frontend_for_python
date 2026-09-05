"use client";

import { useState, type ReactNode } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { ActionResult } from "@/lib/action-result";

// A plain (non react-hook-form) dialog, since EntityFormDialog's FieldConfig
// has no "file" type — the file comes from a plain <input type="file">
// and is sent as FormData, not JSON, same reasoning as
// question-image-control.tsx.
export function DocumentUploadDialog({
  trigger,
  action,
}: {
  trigger: ReactNode;
  action: (formData: FormData) => Promise<ActionResult<unknown>>;
}) {
  const [open, setOpen] = useState(false);
  const [documentType, setDocumentType] = useState("");
  const [title, setTitle] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function reset() {
    setDocumentType("");
    setTitle("");
    setFile(null);
    setError(null);
  }

  async function handleUpload() {
    if (!documentType.trim() || !title.trim() || !file) {
      setError("Document type, title, and a file are all required");
      return;
    }
    setError(null);
    setPending(true);
    const formData = new FormData();
    formData.set("document_type", documentType);
    formData.set("title", title);
    formData.set("file", file);
    const result = await action(formData);
    setPending(false);
    if (result.success) {
      toast.success(result.message ?? "Document uploaded");
      setOpen(false);
      reset();
    } else {
      setError(result.errors?.join(" ") || result.message || "Could not upload document");
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (next) reset();
      }}
    >
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Upload document</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="document_type">Document type</Label>
            <Input
              id="document_type"
              placeholder="e.g. Birth certificate"
              value={documentType}
              onChange={(e) => setDocumentType(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="file">File</Label>
            <Input id="file" type="file" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="secondary" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button type="button" onClick={handleUpload} disabled={pending}>
            {pending && <Loader2 className="h-4 w-4 animate-spin" />}
            Upload
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
