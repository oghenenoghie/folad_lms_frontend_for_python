"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Loader2, Calculator } from "lucide-react";
import { Button } from "@/components/ui/button";
import { finalizeAssessmentScore } from "@/lib/actions/examinations";

export function FinalizeScoreButton({
  assessmentId,
  studentId,
}: {
  assessmentId: string;
  studentId: string;
}) {
  const [pending, setPending] = useState(false);

  async function handleClick() {
    setPending(true);
    const result = await finalizeAssessmentScore(assessmentId, studentId);
    setPending(false);
    if (result.success) {
      toast.success(`Score finalized: ${result.data?.score ?? "—"}`);
    } else {
      toast.error(result.errors?.join(" ") || result.message || "Could not finalize score");
    }
  }

  return (
    <Button type="button" variant="secondary" size="sm" onClick={handleClick} disabled={pending}>
      {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Calculator className="h-4 w-4" />}
      Finalize score
    </Button>
  );
}
