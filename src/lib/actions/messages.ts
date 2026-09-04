"use server";

import { revalidatePath } from "next/cache";
import { authorizedDjangoFetch } from "@/lib/session";
import { toActionResult, type ActionResult } from "@/lib/action-result";
import type { AppMessage } from "@/lib/messages";

export async function sendMessage(input: { recipient: string; subject: string; body: string }) {
  const res = await authorizedDjangoFetch("/api/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  const result = await toActionResult<AppMessage>(res);
  if (result.success) revalidatePath("/messages");
  return result;
}

export async function markMessageRead(publicId: string) {
  const res = await authorizedDjangoFetch(`/api/v1/messages/${publicId}/read`, { method: "POST" });
  const result: ActionResult<AppMessage> = await toActionResult<AppMessage>(res);
  if (result.success) revalidatePath("/messages");
  return result;
}
