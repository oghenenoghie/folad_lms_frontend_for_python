import "server-only";
import { djangoFetch } from "@/lib/session";
import type { Envelope, Paginated } from "@/lib/api-types";

export type Student = {
  public_id: string;
  school: string;
  user: string | null;
  admission_number: string;
  first_name: string;
  last_name: string;
  email: string;
  date_of_birth: string;
  gender: string;
  enrollment_status: string;
  photo_url: string | null;
};

/** null return means "not permitted to view" (403) — same convention as
 * lib/schools.ts's listOrNull. */
async function listOrNull<T>(path: string): Promise<T[] | null> {
  const res = await djangoFetch(path);
  if (!res.ok) return null;
  const body: Envelope<Paginated<T>> = await res.json();
  return body.success && body.data ? body.data.results : null;
}

export async function getStudentsBySchool(schoolId: string): Promise<Student[] | null> {
  return listOrNull<Student>(`/api/v1/students?school_id=${schoolId}&page_size=200`);
}
