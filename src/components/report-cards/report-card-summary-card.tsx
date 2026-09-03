import { Download } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { ReportCard } from "@/lib/report-cards";

// Shared by every screen that shows a student's own published report
// card verbatim — my-report-cards (student) and the guardian equivalent
// today, the admin/teacher detail page's read-only summary tomorrow —
// so the layout only has to be gotten right once.
export function ReportCardSummaryCard({ reportCard, termLabel }: { reportCard: ReportCard; termLabel: string }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between space-y-0">
        <div>
          <CardTitle className="text-base">{termLabel}</CardTitle>
          <p className="text-xs text-muted-foreground">{reportCard.report_card_number}</p>
        </div>
        <div className="flex items-center gap-2">
          {reportCard.pdf_status === "ready" && (
            <Button asChild variant="ghost" size="icon-sm" title="Download PDF">
              <a href={`/api/report-cards/${reportCard.public_id}/pdf`}>
                <Download className="h-4 w-4" />
              </a>
            </Button>
          )}
          <Badge variant={reportCard.status === "published" ? "default" : "secondary"}>
            {reportCard.status === "published" ? "Published" : reportCard.status}
          </Badge>
        </div>
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
  );
}
