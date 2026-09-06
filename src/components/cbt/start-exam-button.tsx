"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { startAttempt } from "@/lib/actions/cbt";

// start_attempt is idempotent server-side (resumes an in_progress
// attempt rather than erroring) — this button is used for both the
// first "Start" and every later "Resume", so it never needs to know
// which case it is.
export function StartExamButton({ candidateId, label }: { candidateId: string; label: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    setPending(true);
    setError(null);
    const result = await startAttempt(candidateId);
    if (result.success) {
      router.push(`/my-cbt-exams/${candidateId}/take`);
      return;
    }
    setPending(false);
    setError(result.errors?.join(" ") || result.message || "Could not start this exam");
  }

  return (
    <div className="space-y-2">
      <Button onClick={handleClick} disabled={pending}>
        {pending && <Loader2 className="h-4 w-4 animate-spin" />}
        {label}
      </Button>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
