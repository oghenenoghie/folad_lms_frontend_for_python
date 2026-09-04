"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Circle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { markNotificationRead } from "@/lib/actions/notifications";
import type { AppNotification } from "@/lib/notifications";

// A clickable notification: marks itself read (if unread) and, when the
// notification carries a link_url (not every type does — see
// reminder_service's guardian case), navigates there afterward. Split out
// from the (server) page since it needs the click handler.
export function NotificationRow({ notification }: { notification: AppNotification }) {
  const router = useRouter();
  const [isRead, setIsRead] = useState(notification.is_read);
  const [pending, setPending] = useState(false);

  async function handleClick() {
    if (pending) return;
    setPending(true);
    if (!isRead) {
      const result = await markNotificationRead(notification.public_id);
      if (result.success) setIsRead(true);
    }
    setPending(false);
    if (notification.link_url) router.push(notification.link_url);
  }

  return (
    <Card
      role={notification.link_url || !isRead ? "button" : undefined}
      onClick={handleClick}
      className={`transition-colors ${!isRead ? "border-primary/40 bg-primary/5" : ""} ${
        notification.link_url || !isRead ? "cursor-pointer hover:bg-muted/50" : ""
      }`}
    >
      <CardContent className="flex items-start gap-3 py-4">
        {!isRead && <Circle className="mt-1.5 h-2 w-2 shrink-0 fill-primary text-primary" />}
        <div className={`min-w-0 flex-1 ${isRead ? "pl-5" : ""}`}>
          <div className="flex items-center justify-between gap-2">
            <p className="font-medium">{notification.title}</p>
            <span className="shrink-0 text-xs text-muted-foreground">
              {new Date(notification.created_at).toLocaleString()}
            </span>
          </div>
          {notification.body && <p className="mt-1 text-sm text-muted-foreground">{notification.body}</p>}
        </div>
      </CardContent>
    </Card>
  );
}
