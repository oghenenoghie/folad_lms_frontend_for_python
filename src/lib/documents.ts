import "server-only";
import { djangoFetch } from "@/lib/session";
import type { Envelope, Paginated } from "@/lib/api-types";

export type DocumentOwnerType = "student" | "staff";

export type Document = {
  public_id: string;
  owner_type: DocumentOwnerType;
  student: string | null;
  staff: string | null;
  document_type: string;
  title: string;
  file_name: string;
  content_type: string;
  size_bytes: number;
  uploaded_by: string | null;
  created_at: string;
};

/** null return means "not permitted to view" (403) — same convention as
 * lib/schools.ts's listOrNull. */
async function listOrNull<T>(path: string): Promise<T[] | null> {
  const res = await djangoFetch(path);
  if (!res.ok) return null;
  const body: Envelope<Paginated<T>> = await res.json();
  return body.success && body.data ? body.data.results : null;
}

export async function getDocuments(filters: {
  studentId?: string;
  staffId?: string;
}): Promise<Document[] | null> {
  const params = new URLSearchParams();
  if (filters.studentId) params.set("student_id", filters.studentId);
  if (filters.staffId) params.set("staff_id", filters.staffId);
  const query = params.toString() ? `${params.toString()}&` : "";
  return listOrNull<Document>(`/api/v1/documents?${query}page_size=100`);
}
