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

// --- Staff-facing: question bank authoring ---

export type CBTQuestionStatus = "draft" | "submitted" | "review" | "approved" | "published" | "archived";

export type CBTDifficulty = "easy" | "medium" | "hard";

// The full set the backend accepts (QUESTION_TYPE_CHOICES) — a superset
// of SUPPORTED_QUESTION_TYPES above, which is only what the student exam
// runner can render/answer. Staff can author any of these; this frontend
// just can't deliver matching/ordering/hotspot/image_selection/drag_drop/
// label_diagram to a candidate yet.
export const ALL_QUESTION_TYPES: CBTQuestionType[] = [
  "single_choice",
  "multiple_choice",
  "true_false",
  "short_answer",
  "long_answer",
  "numeric",
  "matching",
  "ordering",
  "drag_drop",
  "hotspot",
  "label_diagram",
  "image_selection",
];

// Block types whose content is a plain "html" string — the only shape
// this editor authors directly (matching what CBTQuestionCard's
// BlockContent can render). The backend's other block types (image,
// equation, table, graph, audio, video, document, diagram, divider) need
// a richer editor this phase doesn't build; questions needing them still
// exist in the bank, they're just not editable here.
export type CBTHtmlBlockType = "paragraph" | "heading" | "callout";
export const HTML_BLOCK_TYPES: CBTHtmlBlockType[] = ["paragraph", "heading", "callout"];

export type CBTTopic = {
  public_id: string;
  subject: string;
  name: string;
  is_active: boolean;
};

export type CBTQuestionBlockAdmin = {
  public_id: string;
  question: string;
  block_type: string;
  content: Record<string, unknown>;
  order: number;
};

export type CBTQuestionOptionAdmin = {
  public_id: string;
  question: string;
  label: string;
  content: Record<string, unknown>;
  is_correct: boolean;
  order: number;
  explanation: string;
};

export type CBTQuestionAdmin = {
  public_id: string;
  code: string;
  subject: string;
  class_level: string;
  topic: string | null;
  question_type: CBTQuestionType;
  difficulty: CBTDifficulty;
  marks: string;
  negative_marks: string;
  status: CBTQuestionStatus;
  approved_by: string | null;
  blocks: CBTQuestionBlockAdmin[];
  options: CBTQuestionOptionAdmin[];
  created_at: string;
  updated_at: string;
};

export type CBTBulkImportResult = {
  created: CBTQuestionAdmin[];
  errors: { row: number; error: string }[];
  created_count: number;
  error_count: number;
};

// --- Staff-facing: exam builder ---

export type CBTExamStatus = "draft" | "scheduled" | "open" | "closed" | "marking" | "published" | "archived";

export const CBT_EXAM_TYPES = [
  "ca",
  "test",
  "quiz",
  "midterm",
  "terminal",
  "mock",
  "entrance",
  "promotion",
] as const;
export type CBTExamType = (typeof CBT_EXAM_TYPES)[number];

export type CBTExamAdmin = {
  public_id: string;
  code: string;
  school: string;
  academic_year: string;
  term: string;
  subject: string;
  class_level: string;
  name: string;
  exam_type: CBTExamType;
  duration_minutes: number;
  total_marks: string;
  pass_mark: string;
  instructions: Record<string, unknown>;
  randomize_questions: boolean;
  randomize_options: boolean;
  allow_resume: boolean;
  negative_marking: boolean;
  status: CBTExamStatus;
  start_at: string;
  end_at: string;
  published_at: string | null;
  created_at: string;
};

export type CBTExamSection = {
  public_id: string;
  exam: string;
  name: string;
  instructions: string;
  order: number;
  marks: string | null;
};

export type CBTExamQuestion = {
  public_id: string;
  exam: string;
  question: string;
  section: string | null;
  order: number;
  marks_override: string | null;
  effective_marks: string;
  snapshot: Record<string, unknown>;
};

export type CBTExamCandidate = {
  public_id: string;
  exam: string;
  student: string;
  candidate_number: string;
  extra_time_minutes: number;
  is_eligible: boolean;
};

export type CBTExamAttemptAdmin = {
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

// --- Staff-facing: live invigilation ---

export type CBTLiveCandidateRow = {
  candidate: string;
  candidate_number: string;
  student_name: string;
  is_eligible: boolean;
  status: CBTAttemptStatus | "not_started";
  answered_count: number;
  total_questions: number;
  seconds_remaining: number | null;
  flagged_for_review: boolean;
  last_activity_at: string | null;
};

export type CBTLiveStatus = {
  server_time: string;
  candidates: CBTLiveCandidateRow[];
};
