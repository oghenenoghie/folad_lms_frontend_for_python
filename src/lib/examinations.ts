import "server-only";
import { cache } from "react";
import { djangoFetch } from "@/lib/session";
import type { DetailResult, Envelope, Paginated } from "@/lib/api-types";
import type { Assessment, Question, QuestionOption, Result, StudentAnswer } from "@/lib/examinations-types";

// Data shapes live in examinations-types.ts (no "server-only" import) so
// client components can import them without pulling this module's fetch
// functions — and their djangoFetch/next-headers dependency chain — into
// the client bundle. Re-exported here so existing server-side callers can
// keep importing everything from this one module.
export * from "@/lib/examinations-types";

/** null return means "not permitted to view" (403) — same convention as
 * lib/schools.ts's listOrNull. */
async function listOrNull<T>(path: string): Promise<T[] | null> {
  const res = await djangoFetch(path);
  if (!res.ok) return null;
  const body: Envelope<Paginated<T>> = await res.json();
  return body.success && body.data ? body.data.results : null;
}

// `class_subject_id` is an optional filter server-side — used by the
// student-exams list, which fans this out over each of a student's own
// class subjects rather than fetching the whole org's assessments.
export async function getAssessments(classSubjectId?: string): Promise<Assessment[] | null> {
  const query = classSubjectId ? `class_subject_id=${classSubjectId}&` : "";
  return listOrNull<Assessment>(`/api/v1/assessments?${query}page_size=100`);
}

// Wrapped in cache(): both detail pages that use this (/assessments/[id]
// and /my-exams/[id]) call it from generateMetadata() and the page body
// with the same publicId per request.
export const getAssessmentResult = cache(async (publicId: string): Promise<DetailResult<Assessment>> => {
  const res = await djangoFetch(`/api/v1/assessments/${publicId}`);
  if (res.status === 403) return { status: "forbidden" };
  if (!res.ok) return { status: "not_found" };
  const body: Envelope<Assessment> = await res.json();
  if (!body.success || !body.data) return { status: "not_found" };
  return { status: "ok", data: body.data };
});

export async function getQuestions(assessmentId: string): Promise<Question[] | null> {
  const questions = await listOrNull<Question>(
    `/api/v1/questions?assessment_id=${assessmentId}&page_size=100`
  );
  return questions ? [...questions].sort((a, b) => a.sequence - b.sequence) : questions;
}

export async function getQuestionOptions(questionId: string): Promise<QuestionOption[] | null> {
  const options = await listOrNull<QuestionOption>(
    `/api/v1/question-options?question_id=${questionId}&page_size=100`
  );
  return options ? [...options].sort((a, b) => a.sequence - b.sequence) : options;
}

export async function getStudentAnswers(questionId: string): Promise<StudentAnswer[] | null> {
  return listOrNull<StudentAnswer>(`/api/v1/student-answers?question_id=${questionId}&page_size=100`);
}

export async function getResultsForAssessment(assessmentId: string): Promise<Result[] | null> {
  return listOrNull<Result>(`/api/v1/results?assessment_id=${assessmentId}&page_size=100`);
}

// --- Student-facing (a student's own answers/results across assessments) ---

export async function getAnswersForStudent(studentId: string): Promise<StudentAnswer[] | null> {
  return listOrNull<StudentAnswer>(`/api/v1/student-answers?student_id=${studentId}&page_size=100`);
}

// `question`+`student` is a unique pair (uq_student_answer_question_student
// on the backend), so this list can only ever hold 0 or 1 row.
export async function getAnswerForQuestion(
  questionId: string,
  studentId: string
): Promise<StudentAnswer | null> {
  const answers = await listOrNull<StudentAnswer>(
    `/api/v1/student-answers?question_id=${questionId}&student_id=${studentId}`
  );
  return answers && answers.length > 0 ? answers[0] : null;
}

export async function getResultsForStudent(studentId: string): Promise<Result[] | null> {
  return listOrNull<Result>(`/api/v1/results?student_id=${studentId}&page_size=100`);
}
