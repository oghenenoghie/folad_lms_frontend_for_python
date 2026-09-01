import { CreditCard, HeartHandshake } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { GuardianDashboardSummary } from "@/lib/dashboard";

const ATTENDANCE_STATUS_LABELS: Record<string, string> = {
  present: "Present",
  absent: "Absent",
  late: "Late",
  excused: "Excused",
  leave: "Leave",
  half_day: "Half day",
};

export function GuardianDashboard({ summary }: { summary: GuardianDashboardSummary }) {
  if (summary.children.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-2 py-16 text-center">
          <HeartHandshake className="h-8 w-8 text-muted-foreground" />
          <p className="font-medium">No children linked to your account yet</p>
          <p className="text-sm text-muted-foreground">
            Contact the school office to have your children linked to your account.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      {summary.children.map((child) => {
        const totalAttendance = Object.values(child.attendance).reduce((sum, n) => sum + n, 0);
        const feesOwed = child.outstanding_fees_minor / 100;

        return (
          <Card key={child.student}>
            <CardHeader>
              <CardTitle className="text-base">{child.name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3 rounded-md border p-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                  <CreditCard className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-medium">
                    {feesOwed > 0 ? `₦${feesOwed.toLocaleString()} owed` : "No outstanding fees"}
                  </p>
                  <p className="text-xs text-muted-foreground">Fees & invoices</p>
                </div>
              </div>

              <div>
                <p className="mb-2 text-sm font-medium">Attendance</p>
                {totalAttendance === 0 ? (
                  <p className="text-sm text-muted-foreground">No attendance recorded yet.</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(child.attendance).map(([status, count]) => (
                      <Badge key={status} variant="secondary">
                        {ATTENDANCE_STATUS_LABELS[status] ?? status}: {count}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
