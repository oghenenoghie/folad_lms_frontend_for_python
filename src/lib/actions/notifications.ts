"use server";

import { revalidatePath } from "next/cache";
import { authorizedDjangoFetch } from "@/lib/session";
import { toActionResult, type ActionResult } from "@/lib/action-result";

async function call<T>(path: string): Promise<ActionResult<T>> {
  const res = await authorizedDjangoFetch(path, { method: "POST" });
  return toActionResult<T>(res);
}

export async function markNotificationRead(publicId: string) {
  const result = await call(`/api/v1/notifications/${publicId}/read`);
  if (result.success) revalidatePath("/notifications");
  return result;
}

export async function markAllNotificationsRead() {
  const result = await call<{ marked_read: number }>("/api/v1/notifications/mark-all-read");
  if (result.success) revalidatePath("/notifications");
  return result;
}
