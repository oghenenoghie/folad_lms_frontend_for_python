"use client";

import { useState, type ReactNode } from "react";
import { toast } from "sonner";
import { Loader2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { sendMessage } from "@/lib/actions/messages";

// Recipient is fixed (passed in), not picked from a directory — there's
// no org-wide "list every user" endpoint a non-admin account can call
// (see MessageSerializer's sender_name/recipient_name comment), so this
// is opened from a context that already knows who the recipient is: a
// specific guardian/staff/student's own detail page, or "Reply" on an
// existing message thread.
export function ComposeMessageDialog({
  trigger,
  recipientPublicId,
  recipientName,
  defaultSubject = "",
}: {
  trigger: ReactNode;
  recipientPublicId: string;
  recipientName: string;
  defaultSubject?: string;
}) {
  const [open, setOpen] = useState(false);
  const [subject, setSubject] = useState(defaultSubject);
  const [body, setBody] = useState("");
  const [pending, setPending] = useState(false);

  async function handleSend() {
    if (!body.trim()) return;
    setPending(true);
    const result = await sendMessage({ recipient: recipientPublicId, subject, body });
    setPending(false);
    if (result.success) {
      toast.success("Message sent");
      setBody("");
      setSubject(defaultSubject);
      setOpen(false);
    } else {
      toast.error(result.errors?.join(" ") || result.message || "Could not send message");
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Message {recipientName}</DialogTitle>
          <DialogDescription>Sent directly to {recipientName} — they&apos;ll see it in their Messages inbox.</DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <Input
            placeholder="Subject (optional)"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
          />
          <Textarea
            placeholder="Write your message…"
            rows={5}
            value={body}
            onChange={(e) => setBody(e.target.value)}
          />
        </div>

        <DialogFooter>
          <Button type="button" onClick={handleSend} disabled={!body.trim() || pending}>
            {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            Send
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
