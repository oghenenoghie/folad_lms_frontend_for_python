import "server-only";
import { djangoFetch } from "@/lib/session";
import type { Envelope, Paginated } from "@/lib/api-types";

export type ReportCardStatus = "pending" | "generating" | "ready" | "failed";

export type ReportCard = {
  public_id: string;
  student: string;
  academic_year: string;
  term: string;
  status: ReportCardStatus;
  file_url: string;
  generated_at: string | null;
  error_message: string;
};

export const REPORT_CARD_STATUS_LABELS: Record<ReportCardStatus, string> = {
  pending: "Pending",
  generating: "Generating",
  ready: "Ready",
  failed: "Failed",
};

/** null return means "not permitted to view" (403) — same convention as
 * lib/schools.ts's listOrNull. */
async function listOrNull<T>(path: string): Promise<T[] | null> {
  const res = await djangoFetch(path);
  if (!res.ok) return null;
  const body: Envelope<Paginated<T>> = await res.json();
  return body.success && body.data ? body.data.results : null;
}

export async function getReportCardsForStudent(studentId: string): Promise<ReportCard[] | null> {
  return listOrNull<ReportCard>(`/api/v1/report-cards?student_id=${studentId}&page_size=100`);
}
