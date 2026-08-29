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

export async function getClassSubjects(): Promise<ClassSubject[] | null> {
  return listOrNull<ClassSubject>("/api/v1/class-subjects?page_size=100");
}
