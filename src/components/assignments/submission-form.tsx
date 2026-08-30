"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { submitAssignmentFile, submitAssignmentText } from "@/lib/actions/assignments";

export function SubmissionForm({ assignmentId, studentId }: { assignmentId: string; studentId: string }) {
  const [textContent, setTextContent] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmitText() {
    if (!textContent.trim()) {
      setError("Enter your answer before submitting");
      return;
    }
    setError(null);
    setPending(true);
    const result = await submitAssignmentText(assignmentId, studentId, textContent);
    setPending(false);
    if (result.success) {
      toast.success("Assignment submitted");
    } else {
      setError(result.errors?.join(" ") || result.message || "Could not submit assignment");
    }
  }

  async function handleSubmitFile() {
    if (!file) {
      setError("Choose a file before submitting");
      return;
    }
    setError(null);
    setPending(true);
    const formData = new FormData();
    formData.set("assignment", assignmentId);
    formData.set("student", studentId);
    formData.set("file", file);
    const result = await submitAssignmentFile(assignmentId, formData);
    setPending(false);
    if (result.success) {
      toast.success("Assignment submitted");
    } else {
      setError(result.errors?.join(" ") || result.message || "Could not submit assignment");
    }
  }

  return (
    <Tabs defaultValue="text" className="w-full">
      <TabsList>
        <TabsTrigger value="text">Write answer</TabsTrigger>
        <TabsTrigger value="file">Upload file</TabsTrigger>
      </TabsList>

      <TabsContent value="text" className="space-y-3">
        <Textarea
          value={textContent}
          onChange={(e) => setTextContent(e.target.value)}
          placeholder="Type your answer..."
          rows={6}
        />
        <Button type="button" size="sm" onClick={handleSubmitText} disabled={pending}>
          {pending && <Loader2 className="h-4 w-4 animate-spin" />}
          Submit answer
        </Button>
      </TabsContent>

      <TabsContent value="file" className="space-y-3">
        <Input type="file" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
        <Button type="button" size="sm" onClick={handleSubmitFile} disabled={pending}>
          {pending && <Loader2 className="h-4 w-4 animate-spin" />}
          Upload submission
        </Button>
      </TabsContent>

      {error && <p className="mt-2 text-sm text-destructive">{error}</p>}
    </Tabs>
  );
}
