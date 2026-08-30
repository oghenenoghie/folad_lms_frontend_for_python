import "server-only";
import { djangoFetch } from "@/lib/session";
import type { Envelope, Paginated } from "@/lib/api-types";

export type AttendanceStatus = "present" | "absent" | "late" | "excused" | "leave" | "half_day";

export type Attendance = {
  public_id: string;
  enrollment: string;
  date: string;
  status: AttendanceStatus;
  remarks: string;
};

export const ATTENDANCE_STATUS_LABELS: Record<AttendanceStatus, string> = {
  present: "Present",
  absent: "Absent",
  late: "Late",
  excused: "Excused",
  leave: "Leave",
  half_day: "Half day",
};

/** null return means "not permitted to view" (403) — same convention as
 * lib/schools.ts's listOrNull. */
async function listOrNull<T>(path: string): Promise<T[] | null> {
  const res = await djangoFetch(path);
  if (!res.ok) return null;
  const body: Envelope<Paginated<T>> = await res.json();
  return body.success && body.data ? body.data.results : null;
}

// Attendance hangs off Enrollment, not Student directly — there's no
// student_id filter on this endpoint, only enrollment_id/date, so a
// student's history is fetched one enrollment at a time (see
// app/(app)/my-attendance/page.tsx, which fans this out over all of a
// student's own enrollments).
export async function getAttendanceForEnrollment(enrollmentId: string): Promise<Attendance[] | null> {
  return listOrNull<Attendance>(`/api/v1/attendance?enrollment_id=${enrollmentId}&page_size=200`);
}
