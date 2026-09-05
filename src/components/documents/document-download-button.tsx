"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getDocumentDownloadUrl } from "@/lib/actions/documents";

// A fresh presigned URL is fetched on every click rather than embedded at
// render time — see actions/documents.ts's getDocumentDownloadUrl.
export function DocumentDownloadButton({ publicId }: { publicId: string }) {
  const [pending, setPending] = useState(false);

  async function handleClick() {
    setPending(true);
    const result = await getDocumentDownloadUrl(publicId);
    setPending(false);
    if (result.success && result.data) {
      window.open(result.data.url, "_blank", "noopener,noreferrer");
    } else {
      toast.error(result.errors?.join(" ") || result.message || "Could not get download link");
    }
  }

  return (
    <Button type="button" variant="ghost" size="icon-sm" onClick={handleClick} disabled={pending}>
      {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
    </Button>
  );
}
