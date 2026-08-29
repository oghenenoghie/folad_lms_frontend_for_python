"use server";

import { revalidatePath } from "next/cache";
import { authorizedDjangoFetch } from "@/lib/session";
import { toActionResult, type ActionResult } from "@/lib/action-result";
import type { Result } from "@/lib/examinations";

async function call<T>(path: string, method: string, body?: unknown): Promise<ActionResult<T>> {
  const res = await authorizedDjangoFetch(path, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  return toActionResult<T>(res);
}

// --- Assessments ---
export async function createAssessment(input: Record<string, unknown>) {
  const result = await call("/api/v1/assessments", "POST", input);
  if (result.success) revalidatePath("/assessments");
  return result;
}

export async function updateAssessment(publicId: string, input: Record<string, unknown>) {
  const result = await call(`/api/v1/assessments/${publicId}`, "PATCH", input);
  if (result.success) {
    revalidatePath("/assessments");
    revalidatePath(`/assessments/${publicId}`);
  }
  return result;
}

export async function deleteAssessment(publicId: string) {
  const result = await call(`/api/v1/assessments/${publicId}`, "DELETE");
  if (result.success) revalidatePath("/assessments");
  return result;
}

// --- Questions ---
export async function createQuestion(assessmentId: string, input: Record<string, unknown>) {
  const result = await call("/api/v1/questions", "POST", { ...input, assessment: assessmentId });
  if (result.success) revalidatePath(`/assessments/${assessmentId}`);
  return result;
}

export async function updateQuestion(
  assessmentId: string,
  publicId: string,
  input: Record<string, unknown>
) {
  const result = await call(`/api/v1/questions/${publicId}`, "PATCH", input);
  if (result.success) revalidatePath(`/assessments/${assessmentId}`);
  return result;
}

export async function deleteQuestion(assessmentId: string, publicId: string) {
  const result = await call(`/api/v1/questions/${publicId}`, "DELETE");
  if (result.success) revalidatePath(`/assessments/${assessmentId}`);
  return result;
}

// --- Question options ---
export async function createQuestionOption(
  assessmentId: string,
  questionId: string,
  input: Record<string, unknown>
) {
  const result = await call("/api/v1/question-options", "POST", { ...input, question: questionId });
  if (result.success) revalidatePath(`/assessments/${assessmentId}`);
  return result;
}

export async function updateQuestionOption(
  assessmentId: string,
  publicId: string,
  input: Record<string, unknown>
) {
  const result = await call(`/api/v1/question-options/${publicId}`, "PATCH", input);
  if (result.success) revalidatePath(`/assessments/${assessmentId}`);
  return result;
}

export async function deleteQuestionOption(assessmentId: string, publicId: string) {
  const result = await call(`/api/v1/question-options/${publicId}`, "DELETE");
  if (result.success) revalidatePath(`/assessments/${assessmentId}`);
  return result;
}

// --- Grading ---
export async function gradeStudentAnswer(
  assessmentId: string,
  publicId: string,
  input: Record<string, unknown>
) {
  const result = await call(`/api/v1/student-answers/${publicId}/grade`, "POST", input);
  if (result.success) revalidatePath(`/assessments/${assessmentId}`);
  return result;
}

export async function finalizeAssessmentScore(
  assessmentId: string,
  studentPublicId: string
): Promise<ActionResult<Result>> {
  const result = await call<Result>(`/api/v1/assessments/${assessmentId}/finalize-score`, "POST", {
    student: studentPublicId,
  });
  if (result.success) revalidatePath(`/assessments/${assessmentId}`);
  return result;
}
