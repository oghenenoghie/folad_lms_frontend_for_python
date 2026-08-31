import { Banknote, Wallet, UserPlus, CalendarCheck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AdminStatCard } from "@/components/dashboard/admin-stat-card";
import { RevenueChart } from "@/components/dashboard/revenue-chart";
import { AttendanceHeatmapTable } from "@/components/dashboard/attendance-heatmap-table";
import { TopDefaultersList } from "@/components/dashboard/top-defaulters-list";
import { RecentActivityList } from "@/components/dashboard/recent-activity-list";
import type { AdminDashboardSummary } from "@/lib/dashboard";

const money = (minor: number) => (minor / 100).toLocaleString(undefined, { minimumFractionDigits: 2 });

export function AdminDashboard({ summary }: { summary: AdminDashboardSummary }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <AdminStatCard
          label="Today's collection"
          value={money(summary.today_collection_minor)}
          icon={Banknote}
          tone="emerald"
        />
        <AdminStatCard
          label="Total receivables"
          value={money(summary.total_receivables_minor)}
          icon={Wallet}
          tone="blue"
        />
        <AdminStatCard
          label="New admissions (this month)"
          value={summary.new_admissions_this_month.toLocaleString()}
          icon={UserPlus}
          tone="violet"
        />
        <AdminStatCard
          label="Attendance today"
          value={summary.attendance_today_pct !== null ? `${summary.attendance_today_pct}%` : "—"}
          icon={CalendarCheck}
          tone="amber"
        />
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
            <RecentActivityList entries={summary.recent_activity} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
