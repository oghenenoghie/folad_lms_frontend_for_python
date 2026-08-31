import "server-only";
import { djangoFetch } from "@/lib/session";
import type { Envelope, Paginated } from "@/lib/api-types";

// apps.dashboards.services.dashboard_service.get_summary's shape — one
// endpoint, response shape branches on the signed-in user's role. The
// "student" and "admin" shapes are modeled precisely here; "teacher" and
// "guardian" pass through as unknown fields since this frontend doesn't
// render those views yet.
export type StudentDashboardSummary = {
  role: "student";
  attendance: Record<string, number>;
  upcoming_assignments: number;
  published_results_count: number;
  outstanding_fees_minor: number;
};

export type AttendanceHeatmap = {
  dates: string[];
  classes: { name: string; values: (number | null)[] }[];
};

export type TopDefaulter = {
  student_public_id: string;
  student_name: string;
  outstanding_minor: number;
  days_overdue: number;
};

export type RecentActivityEntry = {
  email: string;
  success: boolean;
  created_at: string;
};

// _admin_summary()'s shape — only ever returned to a signed-in user with
// no student/staff/guardian profile linked, i.e. a true org admin
// account. Every field is a real aggregate query; there is no fabricated
// "admissions funnel"/"AI insight"/"staff productivity score" data
// anywhere in this schema, so none of that is modeled here either.
export type AdminDashboardSummary = {
  role: "admin";
  total_students: number;
  total_staff: number;
  active_enrollments: number;
  net_receivable_minor: number;
  open_hostel_incidents: number;
  overdue_library_loans: number;
  today_collection_minor: number;
  total_receivables_minor: number;
  attendance_today_pct: number | null;
  new_admissions_this_month: number;
  revenue_series: { date: string; amount_minor: number }[];
  attendance_heatmap: AttendanceHeatmap;
  top_defaulters: TopDefaulter[];
  recent_activity: RecentActivityEntry[];
};

export type DashboardSummary =
  | StudentDashboardSummary
  | AdminDashboardSummary
  | { role: "teacher" | "guardian" | "staff"; [key: string]: unknown };

/** null means "not authenticated" or a non-2xx response — callers fall
 * back to the permission-driven aggregate view below. */
export async function getMySummary(): Promise<DashboardSummary | null> {
  const res = await djangoFetch("/api/v1/dashboard/summary");
  if (!res.ok) return null;
  const body: Envelope<DashboardSummary> = await res.json();
  return body.success ? body.data : null;
}

export type Student = {
  public_id: string;
  admission_number: string;
  first_name: string;
  last_name: string;
  enrollment_status: string;
};

const ENROLLMENT_STATUS_LABELS: Record<string, string> = {
  active: "Active",
  inactive: "Inactive",
  graduated: "Graduated",
  withdrawn: "Withdrawn",
  suspended: "Suspended",
};

export type DashboardData = {
  studentCount: number | null;
  staffCount: number | null;
  teacherCount: number | null;
  guardianCount: number | null;
  students: Student[];
  /** Number of students the enrollment breakdown was computed from, when
   * that's fewer than studentCount (the API has no aggregate endpoint, so
   * the chart is only as complete as the page of students fetched). */
  breakdownSampleSize: number | null;
  enrollmentBreakdown: Record<string, number>;
  hasAnyAccess: boolean;
};

// Fetches counts via the page_size=1 + pagination.total_count trick rather
// than inventing a stats endpoint the JSON API doesn't have. A 403 means
// the signed-in user lacks that module's `.view` permission — the same
// real enforcement Django's own require_permission() applies — so that
// section is simply omitted, mirroring apps/web/views/dashboard.py's
// permission-driven visibility without duplicating its permission checks.
export async function getDashboardData(): Promise<DashboardData> {
  const [studentsRes, staffRes, teachersRes, guardiansRes] = await Promise.all([
    djangoFetch("/api/v1/students?page_size=100"),
    djangoFetch("/api/v1/staff?page_size=1"),
    djangoFetch("/api/v1/teachers?page_size=1"),
    djangoFetch("/api/v1/guardians?page_size=1"),
  ]);

  let studentCount: number | null = null;
  let students: Student[] = [];
  let breakdownSampleSize: number | null = null;
  const enrollmentBreakdown: Record<string, number> = {};

  if (studentsRes.ok) {
    const body: Envelope<Paginated<Student>> = await studentsRes.json();
    if (body.success && body.data) {
      studentCount = body.data.pagination.total_count;
      students = body.data.results;
      if (body.data.pagination.total_count > body.data.results.length) {
        breakdownSampleSize = body.data.results.length;
      }
      for (const student of body.data.results) {
        const label = ENROLLMENT_STATUS_LABELS[student.enrollment_status] ?? student.enrollment_status;
        enrollmentBreakdown[label] = (enrollmentBreakdown[label] ?? 0) + 1;
      }
    }
  }

  const countOnly = async (res: Response): Promise<number | null> => {
    if (!res.ok) return null;
    const body: Envelope<Paginated<unknown>> = await res.json();
    return body.success && body.data ? body.data.pagination.total_count : null;
  };

  const [staffCount, teacherCount, guardianCount] = await Promise.all([
    countOnly(staffRes),
    countOnly(teachersRes),
    countOnly(guardiansRes),
  ]);

  return {
    studentCount,
    staffCount,
    teacherCount,
    guardianCount,
    students: students.slice(0, 5),
    breakdownSampleSize,
    enrollmentBreakdown,
    hasAnyAccess: [studentCount, staffCount, teacherCount, guardianCount].some((c) => c !== null),
  };
}
