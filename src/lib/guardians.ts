import "server-only";
import { djangoFetch } from "@/lib/session";
import type { Envelope, Paginated } from "@/lib/api-types";

export type Guardian = {
  public_id: string;
  user: string | null;
  first_name: string;
  last_name: string;
  phone: string;
  email: string;
  occupation: string;
};

export type GuardianStudentLink = {
  public_id: string;
  guardian: string;
  student: string;
  relationship_type: string;
  is_primary: boolean;
};

/** null return means "not permitted to view" (403) — same convention as
 * lib/schools.ts's listOrNull. */
async function listOrNull<T>(path: string): Promise<T[] | null> {
  const res = await djangoFetch(path);
  if (!res.ok) return null;
  const body: Envelope<Paginated<T>> = await res.json();
  return body.success && body.data ? body.data.results : null;
}

export async function getGuardians(): Promise<Guardian[] | null> {
  return listOrNull<Guardian>("/api/v1/guardians?page_size=100");
}

export async function getGuardian(publicId: string): Promise<Guardian | null> {
  const res = await djangoFetch(`/api/v1/guardians/${publicId}`);
  if (!res.ok) return null;
  const body: Envelope<Guardian> = await res.json();
  return body.success ? body.data : null;
}

export async function getGuardianStudentLinks(guardianId: string): Promise<GuardianStudentLink[] | null> {
  return listOrNull<GuardianStudentLink>(`/api/v1/guardian-students?guardian_id=${guardianId}&page_size=100`);
}
