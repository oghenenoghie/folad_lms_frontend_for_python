import "server-only";
import { djangoFetch } from "@/lib/session";
import type { Envelope } from "@/lib/api-types";

export type ReportCardVerificationSubject = {
  subject: string;
  ca_score: string;
  cbt_score: string;
  exam_score: string;
  total_score: string;
  percentage: string;
  grade: string;
  remark: string;
};

export type ReportCardVerification = {
  report_card_number: string;
  verification_code: string;
  student_name: string;
  school_name: string;
  class_name: string;
  academic_year: string;
  term: string;
  total_score: string;
  total_possible_score: string;
  average_percentage: string;
  class_position: number | null;
  class_size: number;
  attendance_percentage: string;
  status: "published" | "archived";
  generated_at: string | null;
  published_at: string | null;
  subjects: ReportCardVerificationSubject[];
};

/** Public lookup by verification_code — the page a QR code on a printed
 * report card links to. apps.report_cards.views.ReportCardVerifyView is
 * AllowAny by design, so djangoFetch's "attach a token if one happens to
 * be on the request" behavior is fine here even for a signed-out visitor.
 * `null` covers both "no such code" and "not published/archived yet" —
 * the API deliberately doesn't distinguish them, so this doesn't either. */
export async function verifyReportCard(code: string): Promise<ReportCardVerification | null> {
  const res = await djangoFetch(`/api/v1/report-cards/verify/${encodeURIComponent(code)}`);
  if (!res.ok) return null;
  const body: Envelope<ReportCardVerification> = await res.json();
  return body.success && body.data ? body.data : null;
}
