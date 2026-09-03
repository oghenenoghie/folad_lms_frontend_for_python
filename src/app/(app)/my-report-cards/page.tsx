import type { Metadata } from "next";
import { FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getCurrentUser } from "@/lib/session";
import { getAcademicYears, getTerms } from "@/lib/schools";
import { getPublishedReportCardsForStudent, type ReportCard } from "@/lib/report-cards";

export const metadata: Metadata = { title: "My Report Cards" };

async function getTermLabels() {
  const [terms, academicYears] = await Promise.all([getTerms(), getAcademicYears()]);
  if (!terms || !academicYears) return new Map<string, string>();

  const yearNameById = new Map(academicYears.map((y) => [y.public_id, y.name]));
  return new Map(terms.map((term) => [term.public_id, `${yearNameById.get(term.academic_year) ?? "Unknown year"} — ${term.name}`]));
}

function statusVariant(status: ReportCard["status"]): "default" | "secondary" | "destructive" | "outline" {
  return status === "published" ? "default" : "secondary";
}

export default async function MyReportCardsPage() {
  const user = await getCurrentUser();
  const studentId = user?.student_public_id;

  if (!studentId) {
    return (
      <div className="mx-auto max-w-5xl space-y-6 p-6">
        <h1 className="text-xl font-semibold">My Report Cards</h1>
        <p className="text-sm text-muted-foreground">
          This page is for students — your account isn&apos;t linked to a student profile.
        </p>
      </div>
    );
  }

  const [reportCards, termLabelById] = await Promise.all([
    getPublishedReportCardsForStudent(studentId),
    getTermLabels(),
  ]);

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-6">
      <div>
        <h1 className="text-xl font-semibold">My Report Cards</h1>
        <p className="text-sm text-muted-foreground">Your published term report cards.</p>
      </div>

      {reportCards === null ? (
        <p className="text-sm text-muted-foreground">You don&apos;t have access to view report cards.</p>
      ) : reportCards.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed py-16 text-center">
          <FileText className="h-8 w-8 text-muted-foreground" />
          <p className="font-medium">No report cards yet</p>
          <p className="text-sm text-muted-foreground">
            Your school hasn&apos;t published a report card for you yet.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {reportCards.map((reportCard) => (
            <Card key={reportCard.public_id}>
              <CardHeader className="flex flex-row items-start justify-between space-y-0">
                <div>
                  <CardTitle className="text-base">
                    {termLabelById.get(reportCard.term) ?? reportCard.term}
                  </CardTitle>
                  <p className="text-xs text-muted-foreground">{reportCard.report_card_number}</p>
                </div>
                <Badge variant={statusVariant(reportCard.status)}>
                  {reportCard.status === "published" ? "Published" : reportCard.status}
                </Badge>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
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
                  <div>
                    <p className="text-muted-foreground">Next term begins</p>
                    <p className="font-medium">{reportCard.next_term_begins ?? "—"}</p>
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
                        <TableRow key={subject.public_id}>
                          <TableCell>{subject.subject}</TableCell>
                          <TableCell>
                            {subject.ca_score}/{subject.ca_max_score}
                          </TableCell>
                          <TableCell>
                            {subject.cbt_score}/{subject.cbt_max_score}
                          </TableCell>
                          <TableCell>
                            {subject.exam_score}/{subject.exam_max_score}
                          </TableCell>
                          <TableCell>{subject.percentage}%</TableCell>
                          <TableCell>{subject.grade || "—"}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}

                {reportCard.teacher_comment && (
                  <p className="text-sm">
                    <span className="font-medium">Teacher&apos;s comment: </span>
                    {reportCard.teacher_comment}
                  </p>
                )}
                {reportCard.principal_comment && (
                  <p className="text-sm">
                    <span className="font-medium">Principal&apos;s comment: </span>
                    {reportCard.principal_comment}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
