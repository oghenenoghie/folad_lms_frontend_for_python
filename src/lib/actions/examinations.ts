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

// Multipart, not JSON — same reasoning as actions/assignments.ts's
// submitAssignmentFile: the upload endpoint takes a real file, not a
// JSON body, and fetch() derives the multipart/form-data boundary from
// the FormData itself, so no Content-Type header is set here.
export async function uploadQuestionImage(
  assessmentId: string,
  questionId: string,
  formData: FormData
): Promise<ActionResult<unknown>> {
  const res = await authorizedDjangoFetch(`/api/v1/questions/${questionId}/image`, {
    method: "POST",
    body: formData,
  });
  const result = await toActionResult(res);
  if (result.success) revalidatePath(`/assessments/${assessmentId}`);
  return result;
}

export async function removeQuestionImage(assessmentId: string, questionId: string) {
  const result = await call(`/api/v1/questions/${questionId}/image`, "DELETE");
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

// --- Student-facing: submitting my own answers ---
export async function submitAnswer(assessmentId: string, input: Record<string, unknown>) {
  const result = await call("/api/v1/student-answers", "POST", input);
  if (result.success) revalidatePath(`/my-exams/${assessmentId}`);
  return result;
}

// --- Grading schemes ---
export async function createGradingScheme(schoolId: string, input: Record<string, unknown>) {
  const result = await call("/api/v1/grading-schemes", "POST", { ...input, school: schoolId });
  if (result.success) revalidatePath(`/schools/${schoolId}`);
  return result;
}

export async function updateGradingScheme(
  schoolId: string,
  publicId: string,
  input: Record<string, unknown>
) {
  const result = await call(`/api/v1/grading-schemes/${publicId}`, "PATCH", input);
  if (result.success) revalidatePath(`/schools/${schoolId}`);
  return result;
}

export async function deleteGradingScheme(schoolId: string, publicId: string) {
  const result = await call(`/api/v1/grading-schemes/${publicId}`, "DELETE");
  if (result.success) revalidatePath(`/schools/${schoolId}`);
  return result;
}

// --- Grade bands ---
export async function createGradeBand(
  schoolId: string,
  gradingSchemeId: string,
  input: Record<string, unknown>
) {
  const result = await call("/api/v1/grade-bands", "POST", { ...input, grading_scheme: gradingSchemeId });
  if (result.success) revalidatePath(`/schools/${schoolId}`);
  return result;
}

export async function updateGradeBand(schoolId: string, publicId: string, input: Record<string, unknown>) {
  const result = await call(`/api/v1/grade-bands/${publicId}`, "PATCH", input);
  if (result.success) revalidatePath(`/schools/${schoolId}`);
  return result;
}

export async function deleteGradeBand(schoolId: string, publicId: string) {
  const result = await call(`/api/v1/grade-bands/${publicId}`, "DELETE");
  if (result.success) revalidatePath(`/schools/${schoolId}`);
  return result;
}

// --- Exams ---
export async function createExam(input: Record<string, unknown>) {
  const result = await call("/api/v1/exams", "POST", input);
  if (result.success) revalidatePath("/exams");
  return result;
}

export async function updateExam(publicId: string, input: Record<string, unknown>) {
  const result = await call(`/api/v1/exams/${publicId}`, "PATCH", input);
  if (result.success) {
    revalidatePath("/exams");
    revalidatePath(`/exams/${publicId}`);
  }
  return result;
}

export async function deleteExam(publicId: string) {
  const result = await call(`/api/v1/exams/${publicId}`, "DELETE");
  if (result.success) revalidatePath("/exams");
  return result;
}

// --- Exam schedules ---
// `room` is a nullable FK — an empty string from the "no room" select
// state has to become an actual `null`, same reasoning as
// actions/academics.ts's normalizeEffectiveTo (a nullable
// PublicIdRelatedField 400s on "", it only accepts a real public_id or
// null).
function normalizeRoom(input: Record<string, unknown>) {
  return { ...input, room: input.room || null };
}

export async function createExamSchedule(examId: string, input: Record<string, unknown>) {
  const result = await call("/api/v1/exam-schedules", "POST", {
    ...normalizeRoom(input),
    exam: examId,
  });
  if (result.success) revalidatePath(`/exams/${examId}`);
  return result;
}

export async function updateExamSchedule(
  examId: string,
  publicId: string,
  input: Record<string, unknown>
) {
  const result = await call(`/api/v1/exam-schedules/${publicId}`, "PATCH", normalizeRoom(input));
  if (result.success) revalidatePath(`/exams/${examId}`);
  return result;
}

export async function deleteExamSchedule(examId: string, publicId: string) {
  const result = await call(`/api/v1/exam-schedules/${publicId}`, "DELETE");
  if (result.success) revalidatePath(`/exams/${examId}`);
  return result;
}

// --- Invigilators ---
// No update action: reassigning an invigilator is unassign-then-assign
// server-side (see apps.examinations.services.invigilator_service) —
// InvigilatorDetailView only supports DELETE.
export async function createInvigilator(
  examId: string,
  examScheduleId: string,
  input: Record<string, unknown>
) {
  const result = await call("/api/v1/invigilators", "POST", {
    ...input,
    exam_schedule: examScheduleId,
  });
  if (result.success) revalidatePath(`/exams/${examId}`);
  return result;
}

export async function deleteInvigilator(examId: string, publicId: string) {
  const result = await call(`/api/v1/invigilators/${publicId}`, "DELETE");
  if (result.success) revalidatePath(`/exams/${examId}`);
  return result;
}
