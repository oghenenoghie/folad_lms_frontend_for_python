"use client";

import { useState, type ReactNode } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ActionResult } from "@/lib/action-result";

// A generic one-click server-action button with a pending spinner and a
// toast on success/failure — same shape as FinalizeScoreButton
// (examinations), just parameterized over the action/label since Return /
// Mark lost / Pay / Waive are otherwise identical.
export function LibraryActionButton({
  label,
  icon,
  variant = "secondary",
  action,
}: {
  label: string;
  icon?: ReactNode;
  variant?: "secondary" | "destructive" | "outline" | "ghost";
  action: () => Promise<ActionResult<unknown>>;
}) {
  const [pending, setPending] = useState(false);

  async function handleClick() {
    setPending(true);
    const result = await action();
    setPending(false);
    if (result.success) {
      toast.success(result.message ?? "Done");
    } else {
      toast.error(result.errors?.join(" ") || result.message || "Something went wrong");
    }
  }

  return (
    <Button type="button" variant={variant} size="sm" onClick={handleClick} disabled={pending}>
      {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : icon}
      {label}
    </Button>
  );
}
