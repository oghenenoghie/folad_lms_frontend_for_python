import "server-only";
import { djangoFetch } from "@/lib/session";
import type { Envelope, Paginated } from "@/lib/api-types";

export type AssessmentType = "test" | "quiz" | "assignment" | "project" | "practical" | "exam";

export type Assessment = {
  public_id: string;
  class_subject: string;
  term: string;
  exam: string | null;
  name: string;
  assessment_type: AssessmentType;
  weight: string;
  max_score: string;
};

export type QuestionType = "multiple_choice" | "true_false" | "short_answer" | "essay";

export const OBJECTIVE_QUESTION_TYPES: QuestionType[] = ["multiple_choice", "true_false"];

export type Question = {
  public_id: string;
  assessment: string;
  question_type: QuestionType;
  text: string;
  marks: string;
  sequence: number;
};

export type QuestionOption = {
  public_id: string;
  question: string;
  text: string;
  is_correct: boolean;
  sequence: number;
};

export type StudentAnswer = {
  public_id: string;
  question: string;
  student: string;
  selected_option: string | null;
  text_answer: string;
  is_correct: boolean | null;
  marks_awarded: string | null;
  submitted_at: string;
};

export type Result = {
  public_id: string;
  assessment: string;
  student: string;
  score: string;
  grade: string;
  remark: string;
  status: string;
};

/** null return means "not permitted to view" (403) — same convention as
 * lib/schools.ts's listOrNull. */
async function listOrNull<T>(path: string): Promise<T[] | null> {
  const res = await djangoFetch(path);
  if (!res.ok) return null;
  const body: Envelope<Paginated<T>> = await res.json();
  return body.success && body.data ? body.data.results : null;
}

export async function getAssessments(): Promise<Assessment[] | null> {
  return listOrNull<Assessment>("/api/v1/assessments?page_size=100");
}

export async function getAssessment(publicId: string): Promise<Assessment | null> {
  const res = await djangoFetch(`/api/v1/assessments/${publicId}`);
  if (!res.ok) return null;
  const body: Envelope<Assessment> = await res.json();
  return body.success ? body.data : null;
}

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
