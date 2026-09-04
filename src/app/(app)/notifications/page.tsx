import type { Metadata } from "next";
import { Bell } from "lucide-react";
import { ActivateButton } from "@/components/schools/activate-button";
import { NotificationRow } from "@/components/notifications/notification-row";
import { getNotifications } from "@/lib/notifications";
import { markAllNotificationsRead } from "@/lib/actions/notifications";

export const metadata: Metadata = { title: "Notifications" };

export default async function NotificationsPage() {
  const notifications = await getNotifications();
  const unreadCount = (notifications ?? []).filter((n) => !n.is_read).length;

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Notifications</h1>
          <p className="text-sm text-muted-foreground">
            {unreadCount > 0 ? `${unreadCount} unread` : "You're all caught up"}
          </p>
        </div>
        {unreadCount > 0 && <ActivateButton label="Mark all read" action={markAllNotificationsRead} />}
      </div>

      {notifications === null ? (
        <p className="text-sm text-muted-foreground">Could not load notifications.</p>
      ) : notifications.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed py-16 text-center">
          <Bell className="h-8 w-8 text-muted-foreground" />
          <p className="font-medium">No notifications yet</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((notification) => (
            <NotificationRow key={notification.public_id} notification={notification} />
          ))}
        </div>
      )}
    </div>
  );
}
