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

// --- Teacher-facing: managing an assignment ---
export async function createAssignment(input: Record<string, unknown>) {
  const result = await call("/api/v1/assignments", "POST", input);
  if (result.success) revalidatePath("/assignments");
  return result;
}

export async function updateAssignment(publicId: string, input: Record<string, unknown>) {
  const result = await call(`/api/v1/assignments/${publicId}`, "PATCH", input);
  if (result.success) {
    revalidatePath("/assignments");
    revalidatePath(`/assignments/${publicId}`);
  }
  return result;
}

export async function deleteAssignment(publicId: string) {
  const result = await call(`/api/v1/assignments/${publicId}`, "DELETE");
  if (result.success) revalidatePath("/assignments");
  return result;
}

// --- Teacher-facing: grading a submission ---
// Dedicated endpoint, not a generic PATCH (see apps.assignments.views'
// module docstring) — score/feedback only, no envelope-standard body.
export async function gradeSubmission(assignmentId: string, publicId: string, input: Record<string, unknown>) {
  const result = await call(`/api/v1/assignment-submissions/${publicId}/grade`, "POST", input);
  if (result.success) revalidatePath(`/assignments/${assignmentId}`);
  return result;
}

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
