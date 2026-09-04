"use client";

import { useState, type ReactNode } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ActionResult } from "@/lib/action-result";

// A generic one-click server-action button with a pending spinner and a
// toast on success/failure — same shape as finance's FinanceActionButton
// and library's LibraryActionButton. Used here for "Publish", which (unlike
// the edit/delete dialogs) takes no input.
export function AnnouncementActionButton({
  label,
  icon,
  action,
}: {
  label: string;
  icon?: ReactNode;
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
    <Button
      type="button"
      variant="ghost"
      size="icon-sm"
      aria-label={label}
      title={label}
      onClick={handleClick}
      disabled={pending}
    >
      {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : icon}
    </Button>
  );
}
