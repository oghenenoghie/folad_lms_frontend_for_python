import Link from "next/link";
import {
  CalendarCheck,
  ClipboardList,
  CreditCard,
  FileText,
  Library,
  NotebookPen,
  Trophy,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/dashboard/stat-card";
import type { StudentDashboardSummary } from "@/lib/dashboard";

const ATTENDANCE_STATUS_LABELS: Record<string, string> = {
  present: "Present",
  absent: "Absent",
  late: "Late",
  excused: "Excused",
  leave: "Leave",
  half_day: "Half day",
};

type QuickLink = {
  label: string;
  description: string;
  icon: typeof NotebookPen;
  href?: string;
};

const QUICK_LINKS: QuickLink[] = [
  {
    label: "My Exams",
    description: "Take exams and see your grades",
    icon: NotebookPen,
    href: "/my-exams",
  },
  {
    label: "Assignments",
    description: "View and submit homework",
    icon: ClipboardList,
    href: "/my-assignments",
  },
  { label: "Attendance", description: "Your attendance history", icon: CalendarCheck },
  { label: "Fees & Invoices", description: "View what you owe and pay online", icon: CreditCard },
  { label: "Report Cards", description: "Download your term report cards", icon: FileText },
  { label: "Library", description: "Books you've borrowed", icon: Library },
];

export function StudentDashboard({ summary }: { summary: StudentDashboardSummary }) {
  const present = summary.attendance.present ?? 0;
  const feesOwed = summary.outstanding_fees_minor / 100;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Days present" value={present} icon={CalendarCheck} />
        <StatCard label="Upcoming assignments" value={summary.upcoming_assignments} icon={ClipboardList} />
        <StatCard label="Published results" value={summary.published_results_count} icon={Trophy} />
        <StatCard label="Outstanding fees" value={feesOwed} icon={CreditCard} />
      </div>

      {Object.keys(summary.attendance).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Attendance breakdown</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {Object.entries(summary.attendance).map(([status, count]) => (
              <Badge key={status} variant="secondary">
                {ATTENDANCE_STATUS_LABELS[status] ?? status}: {count}
              </Badge>
            ))}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Your modules</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {QUICK_LINKS.map((link) => {
            const Icon = link.icon;
            const content = (
              <div className="flex items-start gap-3 rounded-lg border p-4">
                <Icon className="h-5 w-5 shrink-0 text-primary" />
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium">{link.label}</p>
                    {!link.href && (
                      <Badge variant="secondary" className="text-[10px]">
                        Soon
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">{link.description}</p>
                </div>
              </div>
            );
            return link.href ? (
              <Link key={link.label} href={link.href} className="transition-colors hover:bg-accent/50">
                {content}
              </Link>
            ) : (
              <div key={link.label} className="cursor-not-allowed opacity-60">
                {content}
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
