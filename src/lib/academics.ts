import "server-only";
import { djangoFetch } from "@/lib/session";
import type { Envelope, Paginated } from "@/lib/api-types";

export type ClassLevel = {
  public_id: string;
  campus: string;
  name: string;
  sequence: number;
  is_active: boolean;
};

export type ClassArm = {
  public_id: string;
  class_level: string;
  name: string;
  is_active: boolean;
};

export type Subject = {
  public_id: string;
  school: string;
  name: string;
  code: string;
  is_active: boolean;
};

export type ClassSubject = {
  public_id: string;
  class_arm: string;
  subject: string;
  teacher: string;
  is_active: boolean;
};

export type Enrollment = {
  public_id: string;
  student: string;
  class_arm: string;
  academic_year: string;
  status: string;
  effective_from: string;
  effective_to: string | null;
};

/** null return means "not permitted to view" (403) — same convention as
 * lib/schools.ts's listOrNull. */
async function listOrNull<T>(path: string): Promise<T[] | null> {
  const res = await djangoFetch(path);
  if (!res.ok) return null;
  const body: Envelope<Paginated<T>> = await res.json();
  return body.success && body.data ? body.data.results : null;
}

// class_level_id/school_id/etc. filters are all optional server-side
// (apps/academics/views.py) — omitted here on purpose, since the
// assessment-creation picker needs every class-subject in the org to
// build one flat "Subject — Class arm" label list, not one school/level
// at a time.
export async function getClassLevels(): Promise<ClassLevel[] | null> {
  return listOrNull<ClassLevel>("/api/v1/class-levels?page_size=100");
}

export async function getClassArms(): Promise<ClassArm[] | null> {
  return listOrNull<ClassArm>("/api/v1/class-arms?page_size=100");
}

export async function getSubjects(): Promise<Subject[] | null> {
  return listOrNull<Subject>("/api/v1/subjects?page_size=100");
}

// `class_arm_id` is optional here, unlike the functions above — the
// student-exams picker filters to one class arm at a time (a student's
// own enrollments), where the unfiltered "build one big label map" shape
// doesn't apply.
export async function getClassSubjects(classArmId?: string): Promise<ClassSubject[] | null> {
  const query = classArmId ? `class_arm_id=${classArmId}&` : "";
  return listOrNull<ClassSubject>(`/api/v1/class-subjects?${query}page_size=100`);
}

export async function getEnrollmentsForStudent(studentId: string): Promise<Enrollment[] | null> {
  return listOrNull<Enrollment>(`/api/v1/enrollments?student_id=${studentId}&page_size=100`);
}
