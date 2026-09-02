import "server-only";
import { djangoFetch } from "@/lib/session";
import type { DetailResult, Envelope, Paginated } from "@/lib/api-types";
import type { Assignment, AssignmentSubmission } from "@/lib/assignments-types";

export * from "@/lib/assignments-types";

/** null return means "not permitted to view" (403) — same convention as
 * lib/schools.ts's listOrNull. */
async function listOrNull<T>(path: string): Promise<T[] | null> {
  const res = await djangoFetch(path);
  if (!res.ok) return null;
  const body: Envelope<Paginated<T>> = await res.json();
  return body.success && body.data ? body.data.results : null;
}

// `class_subject_id` is an optional filter server-side — used by the
// student-assignments list, which fans this out over each of a student's
// own class subjects (same shape as lib/examinations.ts's getAssessments).
export async function getAssignments(classSubjectId?: string): Promise<Assignment[] | null> {
  const query = classSubjectId ? `class_subject_id=${classSubjectId}&` : "";
  return listOrNull<Assignment>(`/api/v1/assignments?${query}page_size=100`);
}

export async function getAssignmentResult(publicId: string): Promise<DetailResult<Assignment>> {
  const res = await djangoFetch(`/api/v1/assignments/${publicId}`);
  if (res.status === 403) return { status: "forbidden" };
  if (!res.ok) return { status: "not_found" };
  const body: Envelope<Assignment> = await res.json();
  if (!body.success || !body.data) return { status: "not_found" };
  return { status: "ok", data: body.data };
}

export async function getSubmissionsForStudent(studentId: string): Promise<AssignmentSubmission[] | null> {
  return listOrNull<AssignmentSubmission>(
    `/api/v1/assignment-submissions?student_id=${studentId}&page_size=100`
  );
}

// `assignment`+`student` is a unique pair (uq_assignment_submission_
// assignment_student on the backend), so this can only ever hold 0 or 1 row.
export async function getSubmissionForAssignment(
  assignmentId: string,
  studentId: string
): Promise<AssignmentSubmission | null> {
  const submissions = await listOrNull<AssignmentSubmission>(
    `/api/v1/assignment-submissions?assignment_id=${assignmentId}&student_id=${studentId}`
  );
  return submissions && submissions.length > 0 ? submissions[0] : null;
}

export async function getSubmissionDownloadUrl(publicId: string): Promise<string | null> {
  const res = await djangoFetch(`/api/v1/assignment-submissions/${publicId}/download`);
  if (!res.ok) return null;
  const body: Envelope<{ url: string }> = await res.json();
  return body.success && body.data ? body.data.url : null;
}
