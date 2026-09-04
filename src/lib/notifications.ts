import "server-only";
import { djangoFetch } from "@/lib/session";
import type { Envelope, Paginated } from "@/lib/api-types";

export type NotificationType = "announcement" | "system" | "fee_reminder";

export type AppNotification = {
  public_id: string;
  notification_type: NotificationType;
  title: string;
  body: string;
  link_url: string;
  is_read: boolean;
  read_at: string | null;
  created_at: string;
};

/** Every notification for the signed-in user (apps.communication's
 * NotificationListView self-scopes to request.user — no id/role param
 * needed, same convention as apps.dashboards' self-scoped endpoints). */
export async function getNotifications(): Promise<AppNotification[] | null> {
  const res = await djangoFetch("/api/v1/notifications?page_size=100");
  if (!res.ok) return null;
  const body: Envelope<Paginated<AppNotification>> = await res.json();
  return body.success && body.data ? body.data.results : null;
}
