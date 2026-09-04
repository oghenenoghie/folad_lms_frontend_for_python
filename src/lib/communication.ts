import "server-only";
import { djangoFetch } from "@/lib/session";
import type { Envelope, Paginated } from "@/lib/api-types";

export type AnnouncementAudience = "all" | "students" | "staff" | "parents";

export type Announcement = {
  public_id: string;
  school: string;
  title: string;
  body: string;
  audience: AnnouncementAudience;
  is_pinned: boolean;
  published_at: string | null;
};

export type NotificationPreference = {
  public_id: string;
  user: string;
  email_enabled: boolean;
  sms_enabled: boolean;
  push_enabled: boolean;
  in_app_enabled: boolean;
};

/** null return means "not permitted to view" (403) — same convention as
 * lib/schools.ts's listOrNull. */
async function listOrNull<T>(path: string): Promise<T[] | null> {
  const res = await djangoFetch(path);
  if (!res.ok) return null;
  const body: Envelope<Paginated<T>> = await res.json();
  return body.success && body.data ? body.data.results : null;
}

export async function getAnnouncements(schoolId: string): Promise<Announcement[] | null> {
  return listOrNull<Announcement>(`/api/v1/announcements?school_id=${schoolId}&page_size=100`);
}

// Not paginated server-side — NotificationPreferenceView.get always
// returns (get_or_create_preference) exactly one object for the current
// user, never a 404, so this can't return null the way the list fetchers
// above do; a request failure just falls back to the model's own defaults.
export async function getNotificationPreference(): Promise<NotificationPreference | null> {
  const res = await djangoFetch("/api/v1/notification-preferences");
  if (!res.ok) return null;
  const body: Envelope<NotificationPreference> = await res.json();
  return body.success && body.data ? body.data : null;
}
