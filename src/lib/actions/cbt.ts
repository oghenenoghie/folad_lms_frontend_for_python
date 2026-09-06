"use server";

import { authorizedDjangoFetch } from "@/lib/session";
import { toActionResult, type ActionResult } from "@/lib/action-result";
import type { CBTAttemptPayload, CBTResponse, CBTStudentAnswer } from "@/lib/cbt-types";

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
