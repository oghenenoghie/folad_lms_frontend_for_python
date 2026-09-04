"use client";

import { useState } from "react";
import { Circle, Reply } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { markMessageRead } from "@/lib/actions/messages";
import { ComposeMessageDialog } from "@/components/messages/compose-message-dialog";
import type { AppMessage } from "@/lib/messages";

// A single row in the flat sent+received inbox. Incoming messages mark
// themselves read on click (reveal-on-click, same interaction as
// NotificationRow); outgoing ones are already implicitly "read" by the
// sender and just render for reference — no click behavior on those.
export function MessageRow({
  message,
  currentUserPublicId,
}: {
  message: AppMessage;
  currentUserPublicId: string;
}) {
  const isIncoming = message.recipient === currentUserPublicId;
  const [isRead, setIsRead] = useState(message.is_read);
  const [pending, setPending] = useState(false);

  async function handleClick() {
    if (!isIncoming || isRead || pending) return;
    setPending(true);
    const result = await markMessageRead(message.public_id);
    setPending(false);
    if (result.success) setIsRead(true);
  }

  const unread = isIncoming && !isRead;

  return (
    <Card
      role={unread ? "button" : undefined}
      onClick={handleClick}
      className={`transition-colors ${unread ? "cursor-pointer border-primary/40 bg-primary/5 hover:bg-primary/10" : ""}`}
    >
      <CardContent className="flex items-start gap-3 py-4">
        {unread && <Circle className="mt-1.5 h-2 w-2 shrink-0 fill-primary text-primary" />}
        <div className={`min-w-0 flex-1 ${!unread ? "pl-5" : ""}`}>
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs text-muted-foreground">
              {isIncoming ? `From ${message.sender_name}` : `To ${message.recipient_name}`}
            </p>
            <span className="shrink-0 text-xs text-muted-foreground">
              {new Date(message.created_at).toLocaleString()}
            </span>
          </div>
          {message.subject && <p className="mt-1 font-medium">{message.subject}</p>}
          <p className="mt-1 whitespace-pre-wrap text-sm text-muted-foreground">{message.body}</p>
          {isIncoming && (
            <div className="mt-2" onClick={(e) => e.stopPropagation()}>
              <ComposeMessageDialog
                trigger={
                  // Opening the reply composer implies you've read this
                  // message — mark it read here too, not just on a
                  // direct click on the row itself.
                  <Button type="button" variant="ghost" size="sm" onClick={handleClick}>
                    <Reply className="h-3.5 w-3.5" />
                    Reply
                  </Button>
                }
                recipientPublicId={message.sender}
                recipientName={message.sender_name}
                defaultSubject={message.subject ? `Re: ${message.subject}` : ""}
              />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
