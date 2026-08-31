import { Banknote, Wallet, UserPlus, CalendarCheck, GraduationCap, BookOpen, Briefcase, Trophy } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AdminStatCard } from "@/components/dashboard/admin-stat-card";
import { RevenueChart } from "@/components/dashboard/revenue-chart";
import { AttendanceHeatmapTable } from "@/components/dashboard/attendance-heatmap-table";
import { TopDefaultersList } from "@/components/dashboard/top-defaulters-list";
import { RecentActivityList } from "@/components/dashboard/recent-activity-list";
import { RecentLoginsList } from "@/components/dashboard/recent-logins-list";
import { StudentDistributionChart } from "@/components/dashboard/student-distribution-chart";
import { EnrollmentGrowthChart } from "@/components/dashboard/enrollment-growth-chart";
import { WeeklyAttendanceChart } from "@/components/dashboard/weekly-attendance-chart";
import { StudentActivitiesList } from "@/components/dashboard/student-activities-list";
import { MessagesList } from "@/components/dashboard/messages-list";
import { MonthCalendarCard } from "@/components/dashboard/month-calendar";
import type { AdminDashboardSummary } from "@/lib/dashboard";

const money = (minor: number) => (minor / 100).toLocaleString(undefined, { minimumFractionDigits: 2 });

export function AdminDashboard({ summary }: { summary: AdminDashboardSummary }) {
  return (
    <div className="space-y-6">
      {/* Primary KPI row — 3 warm-accent cards + 1 strong-accent card,
          mirroring the Unfold Admin dashboard's kpi_cards. */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <AdminStatCard label="Total Students" value={summary.total_students.toLocaleString()} icon={GraduationCap} tone="warn" />
        <AdminStatCard label="Total Teachers" value={summary.total_teachers.toLocaleString()} icon={BookOpen} tone="warn" />
        <AdminStatCard label="Total Staff" value={summary.total_staff.toLocaleString()} icon={Briefcase} tone="warn" />
        <AdminStatCard label="Achievements" value={summary.total_achievements.toLocaleString()} icon={Trophy} tone="primary" />
      </div>

      {/* Two-column analytics + a compact right panel (calendar, notices,
          recent activity) — the "right dashboard panel" from the brief. */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="flex flex-col gap-4 lg:col-span-2 lg:flex-row">
          <Card className="lg:w-1/2">
            <CardHeader>
              <CardTitle>Student distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <StudentDistributionChart breakdown={summary.gender_breakdown} />
            </CardContent>
          </Card>
          <Card className="lg:w-1/2">
            <CardHeader>
              <CardTitle>Enrollment growth</CardTitle>
            </CardHeader>
            <CardContent>
              <EnrollmentGrowthChart monthly={summary.enrollment_series_monthly} weekly={summary.enrollment_series_weekly} />
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col gap-4">
          <Card>
            <CardContent>
              <MonthCalendarCard calendar={summary.calendar} notices={summary.notices} />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Recent activity</CardTitle>
            </CardHeader>
            <CardContent>
              <RecentActivityList entries={summary.recent_activity} />
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Weekly attendance</CardTitle>
          </CardHeader>
          <CardContent>
            <WeeklyAttendanceChart attendance={summary.weekly_attendance} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Student activities</CardTitle>
          </CardHeader>
          <CardContent>
            <StudentActivitiesList activities={summary.student_activities} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Messages</CardTitle>
          </CardHeader>
          <CardContent>
            <MessagesList messages={summary.recent_messages} unreadCount={summary.unread_message_count} />
          </CardContent>
        </Card>
      </div>

      {/* Financial/operational overview — preserved from the original
          version of this dashboard, not removed by the redesign. */}
      <div className="border-t pt-6">
        <h2 className="mb-3 text-sm font-semibold text-muted-foreground">Operational overview</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <AdminStatCard label="Today's collection" value={money(summary.today_collection_minor)} icon={Banknote} tone="good" />
          <AdminStatCard label="Total receivables" value={money(summary.total_receivables_minor)} icon={Wallet} tone="accent" />
          <AdminStatCard label="New admissions (this month)" value={summary.new_admissions_this_month.toLocaleString()} icon={UserPlus} tone="accent" />
          <AdminStatCard
            label="Attendance today"
            value={summary.attendance_today_pct !== null ? `${summary.attendance_today_pct}%` : "—"}
            icon={CalendarCheck}
            tone="warn"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Revenue (last 30 days)</CardTitle>
          </CardHeader>
          <CardContent className="h-64">
            <RevenueChart series={summary.revenue_series} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top defaulters</CardTitle>
          </CardHeader>
          <CardContent>
            <TopDefaultersList defaulters={summary.top_defaulters} />
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Class attendance (last 7 days)</CardTitle>
          </CardHeader>
          <CardContent>
            <AttendanceHeatmapTable heatmap={summary.attendance_heatmap} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent sign-ins</CardTitle>
          </CardHeader>
          <CardContent>
            <RecentLoginsList entries={summary.recent_logins} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
