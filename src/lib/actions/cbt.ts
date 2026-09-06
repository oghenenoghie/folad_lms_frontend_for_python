"use server";

import { revalidatePath } from "next/cache";
import { authorizedDjangoFetch } from "@/lib/session";
import { toActionResult, type ActionResult } from "@/lib/action-result";
import type {
  CBTAttemptPayload,
  CBTBulkImportResult,
  CBTExamAdmin,
  CBTExamCandidate,
  CBTExamQuestion,
  CBTExamSection,
  CBTQuestionAdmin,
  CBTResponse,
  CBTStudentAnswer,
  CBTTopic,
} from "@/lib/cbt-types";

async function call<T>(path: string, method: string, body?: unknown): Promise<ActionResult<T>> {
  const res = await authorizedDjangoFetch(path, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  return toActionResult<T>(res);
}

// No revalidatePath calls here, unlike most other lib/actions modules —
// the exam-runner client component owns its own state (timer, answers,
// current question) entirely client-side and re-renders from each
// action's returned data rather than a server re-fetch, since a full
// page revalidation would reset in-progress client state (the selected
// question, any unsaved local edits) on every autosave.

export async function startAttempt(candidatePublicId: string): Promise<ActionResult<CBTAttemptPayload>> {
  return call(`/api/v1/cbt/my/candidates/${candidatePublicId}/start-attempt`, "POST");
}

export async function heartbeat(attemptPublicId: string): Promise<ActionResult<CBTAttemptPayload>> {
  return call(`/api/v1/cbt/my/attempts/${attemptPublicId}/heartbeat`, "POST");
}

export async function saveAnswer(
  attemptPublicId: string,
  examQuestionPublicId: string,
  response: CBTResponse,
  timeSpentSeconds: number
): Promise<ActionResult<CBTStudentAnswer>> {
  return call(`/api/v1/cbt/my/attempts/${attemptPublicId}/answers`, "POST", {
    exam_question: examQuestionPublicId,
    response,
    time_spent_seconds: timeSpentSeconds,
  });
}

export async function setFlag(
  attemptPublicId: string,
  examQuestionPublicId: string,
  flagged: boolean
): Promise<ActionResult<CBTStudentAnswer>> {
  return call(`/api/v1/cbt/my/attempts/${attemptPublicId}/flag`, "POST", {
    exam_question: examQuestionPublicId,
    flagged,
  });
}

export async function submitAttempt(attemptPublicId: string): Promise<ActionResult<CBTAttemptPayload>> {
  return call(`/api/v1/cbt/my/attempts/${attemptPublicId}/submit`, "POST");
}

// Fire-and-forget from the exam runner's visibility/fullscreen/blur
// listeners — never surfaced to the candidate as an error even on
// failure, since a proctoring ping is never something the exam should
// stall or fail over.
export async function logAttemptEvent(
  attemptPublicId: string,
  eventType: string,
  metadata?: Record<string, unknown>
): Promise<void> {
  await call(`/api/v1/cbt/my/attempts/${attemptPublicId}/events`, "POST", {
    event_type: eventType,
    metadata: metadata ?? {},
  });
}

// --- Staff-facing: topics ---

export async function createTopic(input: Record<string, unknown>): Promise<ActionResult<CBTTopic>> {
  const result = await call<CBTTopic>("/api/v1/cbt/topics", "POST", input);
  if (result.success) revalidatePath("/cbt-questions");
  return result;
}

export async function updateTopic(
  publicId: string,
  input: Record<string, unknown>
): Promise<ActionResult<CBTTopic>> {
  const result = await call<CBTTopic>(`/api/v1/cbt/topics/${publicId}`, "PATCH", input);
  if (result.success) revalidatePath("/cbt-questions");
  return result;
}

export async function deleteTopic(publicId: string): Promise<ActionResult<unknown>> {
  const result = await call(`/api/v1/cbt/topics/${publicId}`, "DELETE");
  if (result.success) revalidatePath("/cbt-questions");
  return result;
}

// --- Staff-facing: question bank ---

// `topic` is a nullable FK — an empty string from the "no topic" select
// has to become a real `null`, same reasoning as actions/examinations.ts's
// normalizeRoom.
function normalizeTopic(input: Record<string, unknown>) {
  return { ...input, topic: input.topic || null };
}

export async function createQuestion(
  input: Record<string, unknown>
): Promise<ActionResult<CBTQuestionAdmin>> {
  const result = await call<CBTQuestionAdmin>("/api/v1/cbt/questions", "POST", normalizeTopic(input));
  if (result.success) revalidatePath("/cbt-questions");
  return result;
}

export async function updateQuestion(
  publicId: string,
  input: Record<string, unknown>
): Promise<ActionResult<CBTQuestionAdmin>> {
  const result = await call<CBTQuestionAdmin>(`/api/v1/cbt/questions/${publicId}`, "PATCH", normalizeTopic(input));
  if (result.success) {
    revalidatePath("/cbt-questions");
    revalidatePath(`/cbt-questions/${publicId}`);
  }
  return result;
}

export async function deleteQuestion(publicId: string): Promise<ActionResult<unknown>> {
  const result = await call(`/api/v1/cbt/questions/${publicId}`, "DELETE");
  if (result.success) revalidatePath("/cbt-questions");
  return result;
}

async function questionTransition(
  publicId: string,
  transition: "submit" | "approve" | "reject"
): Promise<ActionResult<CBTQuestionAdmin>> {
  const result = await call<CBTQuestionAdmin>(`/api/v1/cbt/questions/${publicId}/${transition}`, "POST");
  if (result.success) {
    revalidatePath("/cbt-questions");
    revalidatePath(`/cbt-questions/${publicId}`);
  }
  return result;
}

export async function submitQuestion(publicId: string) {
  return questionTransition(publicId, "submit");
}
export async function approveQuestion(publicId: string) {
  return questionTransition(publicId, "approve");
}
export async function rejectQuestion(publicId: string) {
  return questionTransition(publicId, "reject");
}

export async function duplicateQuestion(publicId: string): Promise<ActionResult<CBTQuestionAdmin>> {
  const result = await call<CBTQuestionAdmin>(`/api/v1/cbt/questions/${publicId}/duplicate`, "POST");
  if (result.success) revalidatePath("/cbt-questions");
  return result;
}

// Multipart, not JSON — same reasoning as actions/examinations.ts's
// uploadQuestionImage: this posts a real CSV file, and fetch() derives
// the multipart/form-data boundary from the FormData itself.
export async function bulkImportQuestions(
  formData: FormData
): Promise<ActionResult<CBTBulkImportResult>> {
  const res = await authorizedDjangoFetch("/api/v1/cbt/questions/bulk-import", {
    method: "POST",
    body: formData,
  });
  const result = await toActionResult<CBTBulkImportResult>(res);
  if (result.success) revalidatePath("/cbt-questions");
  return result;
}

// --- Staff-facing: question blocks (paragraph/heading/callout only —
// see HTML_BLOCK_TYPES) ---

// The form only collects a flat `html` string (see CBTBlockFormValues);
// the backend wants it nested as content.html — same shape BlockContent
// on the student side already expects to render.
function blockPayload(input: { block_type: string; html: string; order: number }) {
  return { block_type: input.block_type, content: { html: input.html }, order: input.order };
}

export async function addQuestionBlock(
  questionPublicId: string,
  input: { block_type: string; html: string; order: number }
) {
  const result = await call(`/api/v1/cbt/questions/${questionPublicId}/blocks`, "POST", blockPayload(input));
  if (result.success) revalidatePath(`/cbt-questions/${questionPublicId}`);
  return result;
}

export async function updateQuestionBlock(
  questionPublicId: string,
  blockPublicId: string,
  input: { block_type: string; html: string; order: number }
) {
  const result = await call(
    `/api/v1/cbt/questions/${questionPublicId}/blocks/${blockPublicId}`,
    "PATCH",
    blockPayload(input)
  );
  if (result.success) revalidatePath(`/cbt-questions/${questionPublicId}`);
  return result;
}

export async function deleteQuestionBlock(questionPublicId: string, blockPublicId: string) {
  const result = await call(`/api/v1/cbt/questions/${questionPublicId}/blocks/${blockPublicId}`, "DELETE");
  if (result.success) revalidatePath(`/cbt-questions/${questionPublicId}`);
  return result;
}

// --- Staff-facing: question options ---

type OptionFormInput = {
  label: string;
  text: string;
  is_correct: boolean;
  order: number;
  explanation?: string;
};

// The form's flat `text` field nests into content.text, matching the
// {"text": "..."} shape optionText() on the student side already reads.
function optionPayload(input: OptionFormInput) {
  return {
    label: input.label,
    content: { text: input.text },
    is_correct: input.is_correct,
    order: input.order,
    explanation: input.explanation || "",
  };
}

export async function addQuestionOption(questionPublicId: string, input: OptionFormInput) {
  const result = await call(
    `/api/v1/cbt/questions/${questionPublicId}/options`,
    "POST",
    optionPayload(input)
  );
  if (result.success) revalidatePath(`/cbt-questions/${questionPublicId}`);
  return result;
}

export async function updateQuestionOption(
  questionPublicId: string,
  optionPublicId: string,
  input: OptionFormInput
) {
  const result = await call(
    `/api/v1/cbt/questions/${questionPublicId}/options/${optionPublicId}`,
    "PATCH",
    optionPayload(input)
  );
  if (result.success) revalidatePath(`/cbt-questions/${questionPublicId}`);
  return result;
}

export async function deleteQuestionOption(questionPublicId: string, optionPublicId: string) {
  const result = await call(
    `/api/v1/cbt/questions/${questionPublicId}/options/${optionPublicId}`,
    "DELETE"
  );
  if (result.success) revalidatePath(`/cbt-questions/${questionPublicId}`);
  return result;
}

// --- Staff-facing: exam builder ---

export async function createCBTExam(input: Record<string, unknown>): Promise<ActionResult<CBTExamAdmin>> {
  const result = await call<CBTExamAdmin>("/api/v1/cbt/exams", "POST", input);
  if (result.success) revalidatePath("/cbt-exams");
  return result;
}

export async function updateCBTExam(
  publicId: string,
  input: Record<string, unknown>
): Promise<ActionResult<CBTExamAdmin>> {
  const result = await call<CBTExamAdmin>(`/api/v1/cbt/exams/${publicId}`, "PATCH", input);
  if (result.success) {
    revalidatePath("/cbt-exams");
    revalidatePath(`/cbt-exams/${publicId}`);
  }
  return result;
}

export async function deleteCBTExam(publicId: string): Promise<ActionResult<unknown>> {
  const result = await call(`/api/v1/cbt/exams/${publicId}`, "DELETE");
  if (result.success) revalidatePath("/cbt-exams");
  return result;
}

async function examTransition(
  publicId: string,
  transition: "publish" | "archive"
): Promise<ActionResult<CBTExamAdmin>> {
  const result = await call<CBTExamAdmin>(`/api/v1/cbt/exams/${publicId}/${transition}`, "POST");
  if (result.success) {
    revalidatePath("/cbt-exams");
    revalidatePath(`/cbt-exams/${publicId}`);
  }
  return result;
}

export async function publishCBTExam(publicId: string) {
  return examTransition(publicId, "publish");
}
export async function archiveCBTExam(publicId: string) {
  return examTransition(publicId, "archive");
}

// --- Staff-facing: exam sections ---

export async function addExamSection(
  examPublicId: string,
  input: Record<string, unknown>
): Promise<ActionResult<CBTExamSection>> {
  const result = await call<CBTExamSection>(`/api/v1/cbt/exams/${examPublicId}/sections`, "POST", input);
  if (result.success) revalidatePath(`/cbt-exams/${examPublicId}`);
  return result;
}

export async function updateExamSection(
  examPublicId: string,
  sectionPublicId: string,
  input: Record<string, unknown>
) {
  const result = await call(
    `/api/v1/cbt/exams/${examPublicId}/sections/${sectionPublicId}`,
    "PATCH",
    input
  );
  if (result.success) revalidatePath(`/cbt-exams/${examPublicId}`);
  return result;
}

export async function deleteExamSection(examPublicId: string, sectionPublicId: string) {
  const result = await call(`/api/v1/cbt/exams/${examPublicId}/sections/${sectionPublicId}`, "DELETE");
  if (result.success) revalidatePath(`/cbt-exams/${examPublicId}`);
  return result;
}

// --- Staff-facing: exam questions (attaching bank questions to an exam) ---

// `section`/`marks_override` are nullable FKs/decimals — an empty string
// from the "no section" select or a blank override field has to become a
// real `null`, same reasoning as actions/examinations.ts's normalizeRoom.
function examQuestionPayload(input: { question: string; section?: string; order: number; marks_override?: string }) {
  return {
    question: input.question,
    section: input.section || null,
    order: input.order,
    marks_override: input.marks_override || null,
  };
}

export async function addExamQuestion(
  examPublicId: string,
  input: { question: string; section?: string; order: number; marks_override?: string }
): Promise<ActionResult<CBTExamQuestion>> {
  const result = await call<CBTExamQuestion>(
    `/api/v1/cbt/exams/${examPublicId}/questions`,
    "POST",
    examQuestionPayload(input)
  );
  if (result.success) revalidatePath(`/cbt-exams/${examPublicId}`);
  return result;
}

export async function removeExamQuestion(examPublicId: string, examQuestionPublicId: string) {
  const result = await call(
    `/api/v1/cbt/exams/${examPublicId}/questions/${examQuestionPublicId}`,
    "DELETE"
  );
  if (result.success) revalidatePath(`/cbt-exams/${examPublicId}`);
  return result;
}

// --- Staff-facing: exam candidates ---

export async function addExamCandidate(
  examPublicId: string,
  input: Record<string, unknown>
): Promise<ActionResult<CBTExamCandidate>> {
  const result = await call<CBTExamCandidate>(`/api/v1/cbt/exams/${examPublicId}/candidates`, "POST", input);
  if (result.success) revalidatePath(`/cbt-exams/${examPublicId}`);
  return result;
}

export async function removeExamCandidate(examPublicId: string, candidatePublicId: string) {
  const result = await call(
    `/api/v1/cbt/exams/${examPublicId}/candidates/${candidatePublicId}`,
    "DELETE"
  );
  if (result.success) revalidatePath(`/cbt-exams/${examPublicId}`);
  return result;
}

export async function addExamCandidatesFromClassArm(
  examPublicId: string,
  input: Record<string, unknown>
): Promise<ActionResult<CBTExamCandidate[]>> {
  const result = await call<CBTExamCandidate[]>(
    `/api/v1/cbt/exams/${examPublicId}/candidates/from-class-arm`,
    "POST",
    input
  );
  if (result.success) revalidatePath(`/cbt-exams/${examPublicId}`);
  return result;
}
