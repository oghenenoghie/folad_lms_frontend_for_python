"use server";

import { revalidatePath } from "next/cache";
import { authorizedDjangoFetch } from "@/lib/session";
import { toActionResult, type ActionResult } from "@/lib/action-result";

export async function submitAssignmentText(
  assignmentId: string,
  studentId: string,
  textContent: string
): Promise<ActionResult<unknown>> {
  const res = await authorizedDjangoFetch("/api/v1/assignment-submissions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ assignment: assignmentId, student: studentId, text_content: textContent }),
  });
  const result = await toActionResult(res);
  if (result.success) revalidatePath(`/my-assignments/${assignmentId}`);
  return result;
}

// Multipart, not JSON — the upload endpoint takes a real file, not a JSON
// body. Deliberately doesn't set a Content-Type header: fetch() derives the
// correct multipart/form-data boundary from the FormData body itself.
export async function submitAssignmentFile(
  assignmentId: string,
  formData: FormData
): Promise<ActionResult<unknown>> {
  const res = await authorizedDjangoFetch("/api/v1/assignment-submissions/upload", {
    method: "POST",
    body: formData,
  });
  const result = await toActionResult(res);
  if (result.success) revalidatePath(`/my-assignments/${assignmentId}`);
  return result;
}
