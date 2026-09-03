// Plain data shapes shared by server-only fetchers (lib/examinations.ts)
// and client components (e.g. components/examinations/answer-question-form.tsx).
// Deliberately has no "server-only" import: a client component importing
// even just a value (OBJECTIVE_QUESTION_TYPES) from a "server-only" module
// pulls its whole dependency chain (djangoFetch -> next/headers) into the
// client bundle, which Next.js rejects at build time.

export type AssessmentType = "test" | "quiz" | "assignment" | "project" | "practical" | "exam";

// Which report-card bucket (see apps.report_cards) this assessment's score
// counts toward — independent of assessment_type.
export type ScoreCategory = "ca" | "cbt" | "exam";

export type Assessment = {
  public_id: string;
  class_subject: string;
  term: string;
  exam: string | null;
  name: string;
  assessment_type: AssessmentType;
  score_category: ScoreCategory;
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
