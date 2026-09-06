"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Loader2, Check, X, Send, Copy } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import type { ActionResult } from "@/lib/action-result";
import type { CBTQuestionAdmin, CBTQuestionStatus } from "@/lib/cbt-types";

// The draft -> submitted -> review -> approved -> published/archived
// workflow (see apps.cbt.services.question_service.QUESTION_STATUS_TRANSITIONS)
// mirrored as one action button per legal next step from the question's
// current status — "review" and "submitted" both offer approve/reject
// since the backend allows approving straight from either.
export function QuestionStatusActions({
  status,
  onSubmit,
  onApprove,
  onReject,
  onDuplicate,
}: {
  status: CBTQuestionStatus;
  onSubmit: () => Promise<ActionResult<CBTQuestionAdmin>>;
  onApprove: () => Promise<ActionResult<CBTQuestionAdmin>>;
  onReject: () => Promise<ActionResult<CBTQuestionAdmin>>;
  onDuplicate: () => Promise<ActionResult<CBTQuestionAdmin>>;
}) {
  const router = useRouter();
  const [pending, setPending] = useState<string | null>(null);

  async function run(label: string, action: () => Promise<ActionResult<CBTQuestionAdmin>>, redirectOnCopy = false) {
    setPending(label);
    const result = await action();
    setPending(null);
    if (result.success) {
      toast.success(result.message ?? "Done");
      if (redirectOnCopy && result.data) router.push(`/cbt-questions/${result.data.public_id}`);
    } else {
      toast.error(result.errors?.join(" ") || result.message || "Something went wrong");
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {status === "draft" && (
        <Button size="sm" variant="secondary" disabled={pending !== null} onClick={() => run("submit", onSubmit)}>
          {pending === "submit" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          Submit for review
        </Button>
      )}
      {(status === "submitted" || status === "review") && (
        <>
          <Button size="sm" disabled={pending !== null} onClick={() => run("approve", onApprove)}>
            {pending === "approve" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
            Approve
          </Button>
          <Button
            size="sm"
            variant="outline"
            disabled={pending !== null}
            onClick={() => run("reject", onReject)}
          >
            {pending === "reject" ? <Loader2 className="h-4 w-4 animate-spin" /> : <X className="h-4 w-4" />}
            Reject
          </Button>
        </>
      )}
      <Button
        size="sm"
        variant="ghost"
        disabled={pending !== null}
        onClick={() => run("duplicate", onDuplicate, true)}
      >
        {pending === "duplicate" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Copy className="h-4 w-4" />}
        Duplicate
      </Button>
    </div>
  );
}
