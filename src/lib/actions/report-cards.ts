"use server";

import { revalidatePath } from "next/cache";
import { authorizedDjangoFetch } from "@/lib/session";
import { toActionResult, type ActionResult } from "@/lib/action-result";

export async function requestReportCard(
  studentId: string,
  input: Record<string, unknown>
): Promise<ActionResult<unknown>> {
  const res = await authorizedDjangoFetch("/api/v1/report-cards", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...input, student: studentId }),
  });
  const result = await toActionResult(res);
  if (result.success) revalidatePath("/my-report-cards");
  return result;
}
