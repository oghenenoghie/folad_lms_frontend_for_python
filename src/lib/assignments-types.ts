// Plain data shapes, split out from assignments.ts (which has a
// "server-only" import) so a client component can import
// SUBMISSION_STATUS_LABELS/types without dragging that module's fetch
// functions into the client bundle — same reasoning as
// examinations-types.ts vs examinations.ts.

export type SubmissionStatus = "submitted" | "late" | "graded";

export type Assignment = {
  public_id: string;
  class_subject: string;
  term: string;
  title: string;
  description: string;
  due_date: string;
  max_score: string;
};

export type AssignmentSubmission = {
  public_id: string;
  assignment: string;
  student: string;
  text_content: string;
  file_name: string;
  content_type: string;
  size_bytes: number | null;
  submitted_at: string;
  status: SubmissionStatus;
  score: string | null;
  feedback: string;
  graded_at: string | null;
};

export const SUBMISSION_STATUS_LABELS: Record<SubmissionStatus, string> = {
  submitted: "Submitted",
  late: "Late",
  graded: "Graded",
};
