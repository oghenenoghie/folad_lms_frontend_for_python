import "server-only";
import { djangoFetch } from "@/lib/session";
import type { DetailResult, Envelope, Paginated } from "@/lib/api-types";

export type School = {
  public_id: string;
  name: string;
  code: string;
  address: string;
  phone: string;
  email: string;
  default_grading_scheme: string;
  is_active: boolean;
};

export type Campus = {
  public_id: string;
  school: string;
  name: string;
  code: string;
  address: string;
  is_main: boolean;
  is_active: boolean;
};

export type AcademicYear = {
  public_id: string;
  school: string;
  name: string;
  start_date: string;
  end_date: string;
  is_current: boolean;
  is_active: boolean;
};

export type Term = {
  public_id: string;
  academic_year: string;
  name: string;
  sequence: number;
  start_date: string;
  end_date: string;
  is_current: boolean;
  is_active: boolean;
};

export type Department = {
  public_id: string;
  school: string;
  name: string;
  code: string;
  description: string;
  is_active: boolean;
};

/** null return means "not permitted to view" (403) — callers hide that
 * section, same 403-derived-visibility pattern as lib/dashboard.ts. */
async function listOrNull<T>(path: string): Promise<T[] | null> {
  const res = await djangoFetch(path);
  if (!res.ok) return null;
  const body: Envelope<Paginated<T>> = await res.json();
  return body.success && body.data ? body.data.results : null;
}

export async function getSchools(): Promise<School[] | null> {
  return listOrNull<School>("/api/v1/schools?page_size=100");
}

export async function getSchool(publicId: string): Promise<School | null> {
  const res = await djangoFetch(`/api/v1/schools/${publicId}`);
  if (!res.ok) return null;
  const body: Envelope<School> = await res.json();
  return body.success ? body.data : null;
}

// Used by the schools detail page, which needs to distinguish "forbidden"
// (403) from "not found" — see DetailResult. getSchool above stays as-is
// for its other, secondary callers (staff/students detail pages), which
// treat any failure as "no school info to show" and don't call notFound().
export async function getSchoolResult(publicId: string): Promise<DetailResult<School>> {
  const res = await djangoFetch(`/api/v1/schools/${publicId}`);
  if (res.status === 403) return { status: "forbidden" };
  if (!res.ok) return { status: "not_found" };
  const body: Envelope<School> = await res.json();
  if (!body.success || !body.data) return { status: "not_found" };
  return { status: "ok", data: body.data };
}

export async function getCampuses(schoolId: string): Promise<Campus[] | null> {
  return listOrNull<Campus>(`/api/v1/campuses?school_id=${schoolId}&page_size=100`);
}

// `school_id` is an optional filter server-side (apps/schools/views.py) —
// omitting it returns every academic year in the org, used by the
// assessment-creation picker which isn't scoped to one school up front.
export async function getAcademicYears(schoolId?: string): Promise<AcademicYear[] | null> {
  const query = schoolId ? `school_id=${schoolId}&` : "";
  return listOrNull<AcademicYear>(`/api/v1/academic-years?${query}page_size=100`);
}

// `academic_year_id` is likewise an optional filter — see getAcademicYears.
export async function getTerms(academicYearId?: string): Promise<Term[] | null> {
  const query = academicYearId ? `academic_year_id=${academicYearId}&` : "";
  return listOrNull<Term>(`/api/v1/terms?${query}page_size=100`);
}

export async function getDepartments(schoolId: string): Promise<Department[] | null> {
  return listOrNull<Department>(`/api/v1/departments?school_id=${schoolId}&page_size=100`);
}
