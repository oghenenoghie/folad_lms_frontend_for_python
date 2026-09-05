import "server-only";
import { djangoFetch } from "@/lib/session";
import type { Envelope, Paginated } from "@/lib/api-types";

export type ReportType = "student_list" | "attendance_summary" | "fee_collection" | "results_summary";
export type ReportFormat = "csv" | "xlsx" | "pdf";
export type ReportStatus = "pending" | "generating" | "ready" | "failed";

export type ReportRequest = {
  public_id: string;
  school: string;
  report_type: ReportType;
  format: ReportFormat;
  parameters: Record<string, unknown>;
  status: ReportStatus;
  file_name: string;
  content_type: string;
  requested_by: string | null;
  generated_at: string | null;
  error_message: string;
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

export async function getReportRequests(filters?: {
  reportType?: ReportType;
  schoolId?: string;
}): Promise<ReportRequest[] | null> {
  const params = new URLSearchParams();
  if (filters?.reportType) params.set("report_type", filters.reportType);
  if (filters?.schoolId) params.set("school_id", filters.schoolId);
  const query = params.toString() ? `${params.toString()}&` : "";
  return listOrNull<ReportRequest>(`/api/v1/reports?${query}page_size=100`);
}
