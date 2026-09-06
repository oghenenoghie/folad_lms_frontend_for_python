// Mirrors apps.cbt's serializers (backend/django_app/apps/cbt/serializers.py)
// for the self-service ("cbt/my/...") surface only — the staff-facing
// authoring/analytics/invigilation endpoints have no frontend yet.

export type CBTQuestionType =
  | "single_choice"
  | "multiple_choice"
  | "true_false"
  | "numeric"
  | "short_answer"
  | "long_answer"
  | "matching"
  | "ordering"
  | "hotspot"
  | "image_selection"
  | "drag_drop"
  | "label_diagram";

// The question types this frontend actually knows how to render and
// answer. The rest (matching/ordering/hotspot/image_selection/drag_drop/
// label_diagram) have no agreed-on flat content shape yet for their
// left/right pairs, sequence items, or hotspot image — see
// CBTQuestionCard's fallback notice for candidates who reach one.
export const SUPPORTED_QUESTION_TYPES: CBTQuestionType[] = [
  "single_choice",
  "multiple_choice",
  "true_false",
  "numeric",
  "short_answer",
  "long_answer",
];

export type CBTBlock = {
  block_type: string;
  content: Record<string, unknown>;
  order: number;
};

export type CBTDeliveryOption = {
  label: string;
  content: Record<string, unknown>;
  order: number;
};

// Answer-key-only types (numeric/matching/ordering/hotspot) always
// deliver an empty options array — see attempt_service.
// sanitize_snapshot_for_delivery on the backend.
export type CBTDeliverySnapshot = {
  question_type: CBTQuestionType;
  difficulty: string;
  marks: string;
  blocks: CBTBlock[];
  options: CBTDeliveryOption[];
};

export type CBTResponse = Record<string, unknown>;

export type CBTDeliveryQuestion = {
  exam_question: string;
  marks: string;
  snapshot: CBTDeliverySnapshot;
  response: CBTResponse | null;
  flagged: boolean;
};

export type CBTAttemptStatus = "not_started" | "in_progress" | "submitted" | "expired" | "abandoned";

export type CBTAttempt = {
  public_id: string;
  exam: string;
  candidate: string;
  status: CBTAttemptStatus;
  question_order: string[];
  started_at: string | null;
  submitted_at: string | null;
  expires_at: string | null;
  score: string;
  percentage: string;
  grade: string;
  passed: boolean;
  flagged_for_review: boolean;
  created_at: string;
};

// The shape of start-attempt / heartbeat / submit / the my-attempt-detail
// GET — an attempt plus its answer-key-stripped question content.
export type CBTAttemptPayload = {
  attempt: CBTAttempt;
  questions: CBTDeliveryQuestion[];
};

export type CBTStudentAnswer = {
  public_id: string;
  attempt: string;
  exam_question: string;
  response: CBTResponse;
  is_correct: boolean | null;
  marks_awarded: string;
  graded_at: string | null;
  time_spent_seconds: number;
  flagged: boolean;
  answered_at: string;
};

export type CBTMyExamSummary = {
  public_id: string;
  code: string;
  name: string;
  exam_type: string;
  status: string;
  subject: string;
  duration_minutes: number;
  total_marks: string;
  pass_mark: string;
  instructions: Record<string, unknown>;
  start_at: string;
  end_at: string;
};

export type CBTMyAttemptSummary = {
  public_id: string;
  status: CBTAttemptStatus;
  started_at: string | null;
  submitted_at: string | null;
  expires_at: string | null;
  score: string;
  percentage: string;
  grade: string;
  passed: boolean;
};

export type CBTMyCandidate = {
  public_id: string;
  exam: CBTMyExamSummary;
  candidate_number: string;
  extra_time_minutes: number;
  is_eligible: boolean;
  attempt: CBTMyAttemptSummary | null;
};
