import "server-only";
import { djangoFetch } from "@/lib/session";
import type { DetailResult, Envelope, Paginated } from "@/lib/api-types";

export type EmploymentStatus = "active" | "on_leave" | "terminated";

export type Staff = {
  public_id: string;
  school: string;
  department: string | null;
  user: string | null;
  employee_number: string;
  first_name: string;
  last_name: string;
  position: string;
  employment_status: EmploymentStatus;
  date_joined: string;
};

export type Teacher = {
  public_id: string;
  staff: string;
  qualification: string;
  specialization: string;
};

/** null return means "not permitted to view" (403) — same convention as
 * lib/schools.ts's listOrNull. */
async function listOrNull<T>(path: string): Promise<T[] | null> {
  const res = await djangoFetch(path);
  if (!res.ok) return null;
  const body: Envelope<Paginated<T>> = await res.json();
  return body.success && body.data ? body.data.results : null;
}

export async function getStaffList(): Promise<Staff[] | null> {
  return listOrNull<Staff>("/api/v1/staff?page_size=100");
}

export async function getStaffMemberResult(publicId: string): Promise<DetailResult<Staff>> {
  const res = await djangoFetch(`/api/v1/staff/${publicId}`);
  if (res.status === 403) return { status: "forbidden" };
  if (!res.ok) return { status: "not_found" };
  const body: Envelope<Staff> = await res.json();
  if (!body.success || !body.data) return { status: "not_found" };
  return { status: "ok", data: body.data };
}

// Teacher is a strict one-to-one profile on Staff (§4 ARCHITECTURE.md) —
// there's no detail-by-staff-id route, so this filters the list to at
// most one row instead.
export async function getTeacherForStaff(staffId: string): Promise<Teacher | null> {
  const teachers = await listOrNull<Teacher>(`/api/v1/teachers?staff_id=${staffId}&page_size=1`);
  return teachers && teachers.length > 0 ? teachers[0] : null;
}

export async function getTeachers(): Promise<Teacher[] | null> {
  return listOrNull<Teacher>("/api/v1/teachers?page_size=200");
}
