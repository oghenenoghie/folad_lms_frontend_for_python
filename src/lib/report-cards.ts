import "server-only";
import { djangoFetch } from "@/lib/session";
import type { Envelope, Paginated } from "@/lib/api-types";

export type ReportCardStatus = "draft" | "generated" | "published" | "archived";

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
  subjects: ReportCardSubject[];
};

export const REPORT_CARD_STATUS_LABELS: Record<ReportCardStatus, string> = {
  draft: "Draft",
  generated: "Generated",
  published: "Published",
  archived: "Archived",
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
