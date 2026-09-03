import type { Metadata } from "next";
import { ShieldCheck, ShieldX } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { verifyReportCard } from "@/lib/report-card-verification";

export const metadata: Metadata = { title: "Verify a Report Card" };

export default async function VerifyReportCardPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const reportCard = await verifyReportCard(code);

  return (
    <div className="flex min-h-screen justify-center bg-muted/30 p-4 py-10">
      <div className="w-full max-w-2xl space-y-4">
        <div className="flex flex-col items-center gap-2 text-center">
          {reportCard ? (
            <ShieldCheck className="h-10 w-10 text-green-600" />
          ) : (
            <ShieldX className="h-10 w-10 text-destructive" />
          )}
          <h1 className="text-xl font-semibold">Report Card Verification</h1>
          <p className="text-sm text-muted-foreground">
            Confirming a report card issued by FOLAD KIDDIES SCHOOL.
          </p>
        </div>

        {reportCard ? (
          <Card>
            <CardHeader className="flex flex-row items-start justify-between space-y-0">
              <div>
                <CardTitle className="text-base">{reportCard.student_name}</CardTitle>
                <CardDescription>
                  {reportCard.school_name} · {reportCard.class_name}
                </CardDescription>
              </div>
              <Badge className="bg-green-600 text-white hover:bg-green-600">Genuine</Badge>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
                <div>
                  <p className="text-muted-foreground">Session / Term</p>
                  <p className="font-medium">
                    {reportCard.academic_year} — {reportCard.term}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Average</p>
                  <p className="font-medium">{reportCard.average_percentage}%</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Position</p>
                  <p className="font-medium">
                    {reportCard.class_position ? `${reportCard.class_position} / ${reportCard.class_size}` : "—"}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Attendance</p>
                  <p className="font-medium">{reportCard.attendance_percentage}%</p>
                </div>
              </div>

              {reportCard.subjects.length > 0 && (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Subject</TableHead>
                      <TableHead>CA</TableHead>
                      <TableHead>CBT</TableHead>
                      <TableHead>Exam</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Grade</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reportCard.subjects.map((subject) => (
                      <TableRow key={subject.subject}>
                        <TableCell>{subject.subject}</TableCell>
                        <TableCell>{subject.ca_score}</TableCell>
                        <TableCell>{subject.cbt_score}</TableCell>
                        <TableCell>{subject.exam_score}</TableCell>
                        <TableCell>{subject.percentage}%</TableCell>
                        <TableCell>{subject.grade || "—"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}

              <Separator />

              <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
                <span>Report Card No: {reportCard.report_card_number}</span>
                <span>Status: {reportCard.status === "published" ? "Published" : "Archived"}</span>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Not verified</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                We couldn&apos;t find a genuine, issued report card for this code. Double-check the code
                or QR image, or contact the issuing school directly.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
