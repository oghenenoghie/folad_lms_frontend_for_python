"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Loader2, Send, Archive } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import type { ActionResult } from "@/lib/action-result";
import type { CBTExamAdmin, CBTExamStatus } from "@/lib/cbt-types";

// Mirrors EXAM_STATUS_TRANSITIONS on the backend: draft -> published ->
// archived, one-way, nothing beyond archived.
export function ExamStatusActions({
  status,
  candidateCount,
  questionCount,
  onPublish,
  onArchive,
}: {
  status: CBTExamStatus;
  candidateCount: number;
  questionCount: number;
  onPublish: () => Promise<ActionResult<CBTExamAdmin>>;
  onArchive: () => Promise<ActionResult<CBTExamAdmin>>;
}) {
  const [pending, setPending] = useState(false);

  async function run(action: () => Promise<ActionResult<CBTExamAdmin>>) {
    setPending(true);
    const result = await action();
    setPending(false);
    if (result.success) {
      toast.success(result.message ?? "Done");
    } else {
      toast.error(result.errors?.join(" ") || result.message || "Something went wrong");
    }
  }

  if (status === "draft") {
    return (
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button size="sm" disabled={pending || questionCount === 0 || candidateCount === 0}>
            {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            Publish
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Publish this exam?</AlertDialogTitle>
            <AlertDialogDescription>
              Publishing snapshots every attached question&apos;s content and locks the question/candidate
              list. Candidates will be able to start their attempt once the exam window opens.
              {(questionCount === 0 || candidateCount === 0) && (
                <span className="mt-2 block font-medium text-destructive">
                  Add at least one question and one candidate first.
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => run(onPublish)} disabled={questionCount === 0 || candidateCount === 0}>
              Publish
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  }

  if (status === "published") {
    return (
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button size="sm" variant="outline" disabled={pending}>
            {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Archive className="h-4 w-4" />}
            Archive
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Archive this exam?</AlertDialogTitle>
            <AlertDialogDescription>
              An archived exam can no longer be started or resumed by candidates. This can&apos;t be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => run(onArchive)}>Archive</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  }

  return null;
}
