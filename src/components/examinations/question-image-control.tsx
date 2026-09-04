"use client";

import { useState } from "react";
import { toast } from "sonner";
import { ImagePlus, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { removeQuestionImage, uploadQuestionImage } from "@/lib/actions/examinations";

// Lets a teacher attach a diagram/figure to a question (e.g. "label the
// diagram below") or replace/remove the one already there. Read-only
// display of an existing image lives in QuestionCard itself — this is
// just the upload/remove controls, split out since they need client-side
// file-input state that the rest of the (server) card doesn't.
export function QuestionImageControl({
  assessmentId,
  questionId,
  hasImage,
}: {
  assessmentId: string;
  questionId: string;
  hasImage: boolean;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [pending, setPending] = useState(false);

  async function handleUpload() {
    if (!file) return;
    setPending(true);
    const formData = new FormData();
    formData.set("file", file);
    const result = await uploadQuestionImage(assessmentId, questionId, formData);
    setPending(false);
    if (result.success) {
      setFile(null);
      toast.success("Image attached");
    } else {
      toast.error(result.errors?.join(" ") || result.message || "Could not upload image");
    }
  }

  async function handleRemove() {
    setPending(true);
    const result = await removeQuestionImage(assessmentId, questionId);
    setPending(false);
    if (!result.success) {
      toast.error(result.errors?.join(" ") || result.message || "Could not remove image");
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Input
        type="file"
        accept="image/png,image/jpeg"
        className="h-8 max-w-56 text-xs"
        onChange={(e) => setFile(e.target.files?.[0] ?? null)}
      />
      <Button type="button" size="sm" variant="secondary" onClick={handleUpload} disabled={!file || pending}>
        {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImagePlus className="h-4 w-4" />}
        {hasImage ? "Replace" : "Add"} image
      </Button>
      {hasImage && (
        <Button type="button" size="sm" variant="ghost" onClick={handleRemove} disabled={pending}>
          <X className="h-4 w-4" />
          Remove
        </Button>
      )}
    </div>
  );
}
