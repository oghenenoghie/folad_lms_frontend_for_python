"use server";

import { revalidatePath } from "next/cache";
import { authorizedDjangoFetch } from "@/lib/session";
import { toActionResult, type ActionResult } from "@/lib/action-result";

async function call<T>(path: string, method: string, body?: unknown): Promise<ActionResult<T>> {
  const res = await authorizedDjangoFetch(path, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  return toActionResult<T>(res);
}

// --- Announcements ---
export async function createAnnouncement(schoolId: string, input: Record<string, unknown>) {
  const result = await call("/api/v1/announcements", "POST", { ...input, school: schoolId });
  if (result.success) revalidatePath(`/schools/${schoolId}`);
  return result;
}

export async function updateAnnouncement(schoolId: string, publicId: string, input: Record<string, unknown>) {
  const result = await call(`/api/v1/announcements/${publicId}`, "PATCH", input);
  if (result.success) revalidatePath(`/schools/${schoolId}`);
  return result;
}

export async function deleteAnnouncement(schoolId: string, publicId: string) {
  const result = await call(`/api/v1/announcements/${publicId}`, "DELETE");
  if (result.success) revalidatePath(`/schools/${schoolId}`);
  return result;
}

export async function publishAnnouncement(schoolId: string, publicId: string) {
  const result = await call(`/api/v1/announcements/${publicId}/publish`, "POST");
  if (result.success) revalidatePath(`/schools/${schoolId}`);
  return result;
}

// --- Notification preferences (the current user's own, not school-scoped) ---
export async function updateNotificationPreferences(input: Record<string, unknown>) {
  const result = await call("/api/v1/notification-preferences", "PATCH", input);
  if (result.success) revalidatePath("/notification-preferences");
  return result;
}
