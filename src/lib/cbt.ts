import "server-only";
import { djangoFetch } from "@/lib/session";
import type { DetailResult, Envelope, Paginated } from "@/lib/api-types";
import type {
  CBTAttemptPayload,
  CBTExamAdmin,
  CBTExamAttemptAdmin,
  CBTExamCandidate,
  CBTExamQuestion,
  CBTExamSection,
  CBTLiveStatus,
  CBTMyCandidate,
  CBTQuestionAdmin,
  CBTTopic,
} from "@/lib/cbt-types";

export * from "@/lib/cbt-types";

/** null return means "not permitted to view" (403 or any other non-ok) —
 * same convention as lib/examinations.ts's listOrNull. */
async function listOrNull<T>(path: string): Promise<T[] | null> {
  const res = await djangoFetch(path);
  if (!res.ok) return null;
  const body: Envelope<Paginated<T>> = await res.json();
  return body.success && body.data ? body.data.results : null;
}

async function detailOrResult<T>(path: string): Promise<DetailResult<T>> {
  const res = await djangoFetch(path);
  if (res.status === 403) return { status: "forbidden" };
  if (!res.ok) return { status: "not_found" };
  const body: Envelope<T> = await res.json();
  if (!body.success || !body.data) return { status: "not_found" };
  return { status: "ok", data: body.data };
}

/** Every CBT candidate the signed-in student has — the backend already
 * scopes this to "my own" (see apps.cbt.views.MyCandidateListView), so
 * there's no student_id filter to pass here. */
export async function getMyCandidates(): Promise<CBTMyCandidate[] | null> {
  const res = await djangoFetch("/api/v1/cbt/my/candidates?page_size=100");
  if (!res.ok) return null;
  const body: Envelope<Paginated<CBTMyCandidate>> = await res.json();
  return body.success && body.data ? body.data.results : null;
}

export async function getMyCandidate(candidatePublicId: string): Promise<CBTMyCandidate | null> {
  const candidates = await getMyCandidates();
  return candidates?.find((c) => c.public_id === candidatePublicId) ?? null;
}

/** The current attempt's live state plus its (answer-key-stripped)
 * question content — used to resume an in-progress attempt on page
 * load/refresh. */
export async function getMyAttempt(attemptPublicId: string): Promise<DetailResult<CBTAttemptPayload>> {
  // The endpoint reports an ownership failure as 404, not 403 — a
  // candidate can't probe for other students' attempt IDs by
  // distinguishing "forbidden" from "not found" (see the backend's
  // _own_attempt_or_error) — so there's no separate "forbidden" case here.
  const res = await djangoFetch(`/api/v1/cbt/my/attempts/${attemptPublicId}`);
  if (!res.ok) return { status: "not_found" };
  const body: Envelope<CBTAttemptPayload> = await res.json();
  if (!body.success || !body.data) return { status: "not_found" };
  return { status: "ok", data: body.data };
}

// --- Staff-facing: question bank ---

export async function getTopics(subjectId?: string): Promise<CBTTopic[] | null> {
  const query = subjectId ? `subject_id=${subjectId}&` : "";
  return listOrNull<CBTTopic>(`/api/v1/cbt/topics?${query}page_size=200`);
}

export async function getQuestions(filters?: {
  subjectId?: string;
  classLevelId?: string;
  topicId?: string;
  status?: string;
  questionType?: string;
}): Promise<CBTQuestionAdmin[] | null> {
  const params = new URLSearchParams({ page_size: "200" });
  if (filters?.subjectId) params.set("subject_id", filters.subjectId);
  if (filters?.classLevelId) params.set("class_level_id", filters.classLevelId);
  if (filters?.topicId) params.set("topic_id", filters.topicId);
  if (filters?.status) params.set("status", filters.status);
  if (filters?.questionType) params.set("question_type", filters.questionType);
  return listOrNull<CBTQuestionAdmin>(`/api/v1/cbt/questions?${params.toString()}`);
}

export async function getQuestionResult(publicId: string): Promise<DetailResult<CBTQuestionAdmin>> {
  return detailOrResult<CBTQuestionAdmin>(`/api/v1/cbt/questions/${publicId}`);
}

// --- Staff-facing: exam builder ---

export async function getCBTExams(filters?: {
  subjectId?: string;
  classLevelId?: string;
  termId?: string;
  status?: string;
}): Promise<CBTExamAdmin[] | null> {
  const params = new URLSearchParams({ page_size: "200" });
  if (filters?.subjectId) params.set("subject_id", filters.subjectId);
  if (filters?.classLevelId) params.set("class_level_id", filters.classLevelId);
  if (filters?.termId) params.set("term_id", filters.termId);
  if (filters?.status) params.set("status", filters.status);
  return listOrNull<CBTExamAdmin>(`/api/v1/cbt/exams?${params.toString()}`);
}

export async function getCBTExamResult(publicId: string): Promise<DetailResult<CBTExamAdmin>> {
  return detailOrResult<CBTExamAdmin>(`/api/v1/cbt/exams/${publicId}`);
}

export async function getExamSections(examPublicId: string): Promise<CBTExamSection[] | null> {
  return listOrNull<CBTExamSection>(`/api/v1/cbt/exams/${examPublicId}/sections?page_size=200`);
}

export async function getExamQuestions(examPublicId: string): Promise<CBTExamQuestion[] | null> {
  return listOrNull<CBTExamQuestion>(`/api/v1/cbt/exams/${examPublicId}/questions?page_size=200`);
}

export async function getExamCandidates(examPublicId: string): Promise<CBTExamCandidate[] | null> {
  return listOrNull<CBTExamCandidate>(`/api/v1/cbt/exams/${examPublicId}/candidates?page_size=500`);
}

export async function getExamAttempts(examPublicId: string): Promise<CBTExamAttemptAdmin[] | null> {
  return listOrNull<CBTExamAttemptAdmin>(`/api/v1/cbt/exams/${examPublicId}/attempts?page_size=500`);
}

// --- Staff-facing: live invigilation ---

/** Poll-based — no websocket feed exists server-side (see
 * invigilation_service's module docstring); the caller decides how often
 * to re-fetch. */
export async function getExamLiveStatus(examPublicId: string): Promise<CBTLiveStatus | null> {
  const res = await djangoFetch(`/api/v1/cbt/exams/${examPublicId}/live`);
  if (!res.ok) return null;
  const body: Envelope<CBTLiveStatus> = await res.json();
  return body.success && body.data ? body.data : null;
}
