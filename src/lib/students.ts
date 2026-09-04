import "server-only";
import { cache } from "react";
import { djangoFetch } from "@/lib/session";
import type { DetailResult, Envelope, Paginated } from "@/lib/api-types";

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

export async function getStudents(): Promise<Student[] | null> {
  return listOrNull<Student>("/api/v1/students?page_size=100");
}

// Wrapped in cache(): the detail page's generateMetadata() and page body
// both call this with the same publicId per request.
export const getStudentResult = cache(async (publicId: string): Promise<DetailResult<Student>> => {
  const res = await djangoFetch(`/api/v1/students/${publicId}`);
  if (res.status === 403) return { status: "forbidden" };
  if (!res.ok) return { status: "not_found" };
  const body: Envelope<Student> = await res.json();
  if (!body.success || !body.data) return { status: "not_found" };
  return { status: "ok", data: body.data };
});
