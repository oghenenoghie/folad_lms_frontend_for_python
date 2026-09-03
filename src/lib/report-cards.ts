import "server-only";
import { djangoFetch } from "@/lib/session";
import type { DetailResult, Envelope, Paginated } from "@/lib/api-types";

export type ReportCardStatus = "draft" | "generated" | "published" | "archived";
export type ReportCardPdfStatus = "pending" | "generating" | "ready" | "failed";

export type ReportCardSubject = {
  public_id: string;
  subject: string;
  ca_score: string;
  ca_max_score: string;
  cbt_score: string;
  cbt_max_score: string;
  exam_score: string;
  exam_max_score: string;
  total_score: string;
  percentage: string;
  grade: string;
  remark: string;
  class_position: number | null;
  teacher_comment: string;
};

export type ReportCard = {
  public_id: string;
  student: string;
  academic_year: string;
  term: string;
  class_level: string;
  class_arm: string;
  report_card_number: string;
  verification_code: string;
  total_score: string;
  total_possible_score: string;
  average_percentage: string;
  class_position: number | null;
  class_size: number;
  attendance_present: number;
  attendance_absent: number;
  attendance_percentage: string;
  teacher_comment: string;
  principal_comment: string;
  next_term_begins: string | null;
  status: ReportCardStatus;
  generated_at: string | null;
  published_at: string | null;
  pdf_status: ReportCardPdfStatus;
  pdf_generated_at: string | null;
  pdf_error_message: string;
  subjects: ReportCardSubject[];
};

export type ReportCardWeighting = {
  public_id: string;
  school: string;
  ca_weight: string;
  cbt_weight: string;
  exam_weight: string;
};

export type ReportCardBulkExportStatus = "pending" | "processing" | "ready" | "failed";

export type ReportCardBulkExport = {
  public_id: string;
  term: string;
  class_arm: string | null;
  status: ReportCardBulkExportStatus;
  report_card_count: number;
  failed_count: number;
  file_url: string;
  error_message: string;
  started_at: string | null;
  completed_at: string | null;
  created_at: string;
};

export const REPORT_CARD_BULK_EXPORT_STATUS_LABELS: Record<ReportCardBulkExportStatus, string> = {
  pending: "Pending",
  processing: "Processing",
  ready: "Ready",
  failed: "Failed",
};

export const REPORT_CARD_STATUS_LABELS: Record<ReportCardStatus, string> = {
  draft: "Draft",
  generated: "Generated",
  published: "Published",
  archived: "Archived",
};

export const REPORT_CARD_PDF_STATUS_LABELS: Record<ReportCardPdfStatus, string> = {
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

// Report cards are admin/bulk-generated now, not self-requested (see the
// Academic Report Card Engine, apps.report_cards) — a student only ever
// sees the "published" ones here, same as the real report-card-shelf a
// school would hand out.
export async function getPublishedReportCardsForStudent(studentId: string): Promise<ReportCard[] | null> {
  const results = await listOrNull<ReportCard>(
    `/api/v1/report-cards?student_id=${studentId}&status=published&page_size=100`
  );
  return results;
}

// Admin/teacher-facing: every status, not just published — that's the
// whole point of a management screen (reviewing a "generated" report
// before publishing it). `termId`/`classArmId` are optional filters,
// mirroring lib/schools.ts's getAcademicYears(schoolId?) convention.
export async function getReportCards(params?: {
  termId?: string;
  classArmId?: string;
  status?: ReportCardStatus;
}): Promise<ReportCard[] | null> {
  const query = new URLSearchParams({ page_size: "200" });
  if (params?.termId) query.set("term_id", params.termId);
  if (params?.classArmId) query.set("class_arm_id", params.classArmId);
  if (params?.status) query.set("status", params.status);
  return listOrNull<ReportCard>(`/api/v1/report-cards?${query.toString()}`);
}

export async function getReportCardResult(publicId: string): Promise<DetailResult<ReportCard>> {
  const res = await djangoFetch(`/api/v1/report-cards/${publicId}`);
  if (res.status === 403) return { status: "forbidden" };
  if (!res.ok) return { status: "not_found" };
  const body: Envelope<ReportCard> = await res.json();
  if (!body.success || !body.data) return { status: "not_found" };
  return { status: "ok", data: body.data };
}

// "{academic year} — {term}" labels for every term in the org, keyed by
// term public_id — shared by every screen that lists report cards next
// to their term (my-report-cards, the guardian view, the admin list)
// rather than each fetching+building the same map independently.
export async function getTermLabelMap(): Promise<Map<string, string>> {
  const [terms, academicYears] = await Promise.all([
    listOrNull<{ public_id: string; academic_year: string; name: string }>("/api/v1/terms?page_size=200"),
    listOrNull<{ public_id: string; name: string }>("/api/v1/academic-years?page_size=200"),
  ]);
  if (!terms || !academicYears) return new Map();

  const yearNameById = new Map(academicYears.map((y) => [y.public_id, y.name]));
  return new Map(
    terms.map((term) => [term.public_id, `${yearNameById.get(term.academic_year) ?? "Unknown year"} — ${term.name}`])
  );
}

export async function getReportCardBulkExports(termId?: string): Promise<ReportCardBulkExport[] | null> {
  const query = termId ? `term_id=${termId}&` : "";
  return listOrNull<ReportCardBulkExport>(`/api/v1/report-cards/bulk-exports?${query}page_size=50`);
}

// One weighting record per school (uq_report_card_weighting_school on the
// backend) — fetched as a filtered list rather than a dedicated "get one"
// endpoint since that's the only route apps.report_cards exposes for it.
export async function getReportCardWeighting(schoolId: string): Promise<ReportCardWeighting | null> {
  const results = await listOrNull<ReportCardWeighting>(
    `/api/v1/report-card-weightings?school_id=${schoolId}&page_size=1`
  );
  return results && results.length > 0 ? results[0] : null;
}
