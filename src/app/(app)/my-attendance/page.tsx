import type { Metadata } from "next";
import { CalendarCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getCurrentUser } from "@/lib/session";
import { getEnrollmentsForStudent } from "@/lib/academics";
import { getAttendanceForEnrollment, ATTENDANCE_STATUS_LABELS, type Attendance } from "@/lib/attendance";

export const metadata: Metadata = { title: "My Attendance" };

async function getMyAttendance(studentId: string): Promise<Attendance[] | null> {
  const enrollments = await getEnrollmentsForStudent(studentId);
  if (!enrollments) return null;

  const attendanceLists = await Promise.all(
    enrollments.map((enrollment) => getAttendanceForEnrollment(enrollment.public_id))
  );
  return attendanceLists
    .flatMap((list) => list ?? [])
    .sort((a, b) => b.date.localeCompare(a.date));
}

function statusBadgeVariant(status: Attendance["status"]): "default" | "secondary" | "destructive" | "outline" {
  if (status === "present") return "default";
  if (status === "absent") return "destructive";
  return "secondary";
}

export default async function MyAttendancePage() {
  const user = await getCurrentUser();
  const studentId = user?.student_public_id;

  if (!studentId) {
    return (
      <div className="mx-auto max-w-5xl space-y-6 p-6">
        <h1 className="text-xl font-semibold">My Attendance</h1>
        <p className="text-sm text-muted-foreground">
          This page is for students — your account isn&apos;t linked to a student profile.
        </p>
      </div>
    );
  }

  const records = await getMyAttendance(studentId);
  const summary = new Map<string, number>();
  for (const record of records ?? []) {
    summary.set(record.status, (summary.get(record.status) ?? 0) + 1);
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-6">
      <div>
        <h1 className="text-xl font-semibold">My Attendance</h1>
        <p className="text-sm text-muted-foreground">Your attendance record across all your classes.</p>
      </div>

      {records === null ? (
        <p className="text-sm text-muted-foreground">You don&apos;t have access to view your attendance.</p>
      ) : records.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed py-16 text-center">
          <CalendarCheck className="h-8 w-8 text-muted-foreground" />
          <p className="font-medium">No attendance recorded yet</p>
          <p className="text-sm text-muted-foreground">
            Once your teacher starts marking attendance, it will show up here.
          </p>
        </div>
      ) : (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Summary</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              {[...summary.entries()].map(([status, count]) => (
                <Badge key={status} variant={statusBadgeVariant(status as Attendance["status"])}>
                  {ATTENDANCE_STATUS_LABELS[status as Attendance["status"]] ?? status}: {count}
                </Badge>
              ))}
            </CardContent>
          </Card>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Remarks</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {records.map((record) => (
                <TableRow key={record.public_id}>
                  <TableCell>{record.date}</TableCell>
                  <TableCell>
                    <Badge variant={statusBadgeVariant(record.status)}>
                      {ATTENDANCE_STATUS_LABELS[record.status]}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{record.remarks || "—"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </>
      )}
    </div>
  );
}
