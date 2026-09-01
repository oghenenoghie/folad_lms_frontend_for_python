import Link from "next/link";
import {
  BookOpen,
  CalendarCheck,
  ClipboardCheck,
  ClipboardList,
  Clock,
  Users,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/dashboard/stat-card";
import type { TeacherDashboardSummary } from "@/lib/dashboard";

type QuickLink = {
  label: string;
  description: string;
  icon: typeof CalendarCheck;
  href: string;
};

const QUICK_LINKS: QuickLink[] = [
  {
    label: "Take Attendance",
    description: "Mark today's classes present, absent, or late",
    icon: CalendarCheck,
    href: "/attendance",
  },
  {
    label: "Assessments",
    description: "Create assessments and enter results",
    icon: ClipboardList,
    href: "/assessments",
  },
  {
    label: "My Attendance",
    description: "Your own attendance record",
    icon: ClipboardCheck,
    href: "/my-attendance",
  },
];

export function TeacherDashboard({ summary }: { summary: TeacherDashboardSummary }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Classes taught" value={summary.class_subjects_count} icon={BookOpen} />
        <StatCard label="Students taught" value={summary.students_taught_count} icon={Users} />
        <StatCard label="Pending grading" value={summary.pending_grading_count} icon={ClipboardList} />
        <StatCard label="Today's periods" value={summary.todays_periods_count} icon={Clock} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Today&apos;s schedule</CardTitle>
          </CardHeader>
          <CardContent>
            {summary.todays_periods.length === 0 ? (
              <p className="text-sm text-muted-foreground">No periods scheduled for you today.</p>
            ) : (
              <ul className="space-y-2">
                {summary.todays_periods.map((slot, index) => (
                  <li
                    key={index}
                    className="flex items-center justify-between rounded-md border px-3 py-2 text-sm"
                  >
                    <div>
                      <p className="font-medium">{slot.subject}</p>
                      <p className="text-xs text-muted-foreground">{slot.class_arm}</p>
                    </div>
                    <Badge variant="outline">
                      {slot.start_time}–{slot.end_time}
                    </Badge>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Pending grading</CardTitle>
          </CardHeader>
          <CardContent>
            {summary.pending_submissions.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nothing waiting to be graded.</p>
            ) : (
              <ul className="space-y-2">
                {summary.pending_submissions.map((submission, index) => (
                  <li
                    key={index}
                    className="flex items-center justify-between rounded-md border px-3 py-2 text-sm"
                  >
                    <div>
                      <p className="font-medium">{submission.assignment}</p>
                      <p className="text-xs text-muted-foreground">{submission.student}</p>
                    </div>
                    <Badge variant={submission.status === "late" ? "destructive" : "secondary"}>
                      {submission.status}
                    </Badge>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Your modules</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {QUICK_LINKS.map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.label}
                href={link.href}
                className="flex items-start gap-3 rounded-lg border p-4 transition-colors hover:bg-accent/50"
              >
                <Icon className="h-5 w-5 shrink-0 text-primary" />
                <div>
                  <p className="text-sm font-medium">{link.label}</p>
                  <p className="text-xs text-muted-foreground">{link.description}</p>
                </div>
              </Link>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
