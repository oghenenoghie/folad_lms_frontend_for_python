import type { Metadata } from "next";
import { Download, FileText, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { RequestReportCardDialog } from "@/components/report-cards/request-report-card-dialog";
import { getCurrentUser } from "@/lib/session";
import { getAcademicYears, getTerms } from "@/lib/schools";
import { getReportCardsForStudent, REPORT_CARD_STATUS_LABELS, type ReportCard } from "@/lib/report-cards";
import { requestReportCard } from "@/lib/actions/report-cards";

export const metadata: Metadata = { title: "My Report Cards" };

async function getTermOptions() {
  const [terms, academicYears] = await Promise.all([getTerms(), getAcademicYears()]);
  if (!terms || !academicYears) return { options: [], termLabelById: new Map<string, string>() };

  const yearNameById = new Map(academicYears.map((y) => [y.public_id, y.name]));
  const termLabelById = new Map<string, string>();
  const options = terms.map((term) => {
    const label = `${yearNameById.get(term.academic_year) ?? "Unknown year"} — ${term.name}`;
    termLabelById.set(term.public_id, label);
    return { value: term.public_id, label };
  });
  return { options, termLabelById };
}

function statusVariant(status: ReportCard["status"]): "default" | "secondary" | "destructive" | "outline" {
  if (status === "ready") return "default";
  if (status === "failed") return "destructive";
  return "secondary";
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

  const [reportCards, { options: termOptions, termLabelById }] = await Promise.all([
    getReportCardsForStudent(studentId),
    getTermOptions(),
  ]);

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">My Report Cards</h1>
          <p className="text-sm text-muted-foreground">Request and download your term report cards.</p>
        </div>
        {reportCards !== null && termOptions.length > 0 && (
          <RequestReportCardDialog
            trigger={
              <Button>
                <Plus className="h-4 w-4" />
                Request report card
              </Button>
            }
            title="Request report card"
            termOptions={termOptions}
            action={requestReportCard.bind(null, studentId)}
          />
        )}
      </div>

      {reportCards === null ? (
        <p className="text-sm text-muted-foreground">You don&apos;t have access to view report cards.</p>
      ) : reportCards.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed py-16 text-center">
          <FileText className="h-8 w-8 text-muted-foreground" />
          <p className="font-medium">No report cards yet</p>
          <p className="text-sm text-muted-foreground">Request one for a term to get started.</p>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Term</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Generated</TableHead>
              <TableHead className="w-1" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {reportCards.map((reportCard) => (
              <TableRow key={reportCard.public_id}>
                <TableCell>{termLabelById.get(reportCard.term) ?? reportCard.term}</TableCell>
                <TableCell>
                  <Badge variant={statusVariant(reportCard.status)}>
                    {REPORT_CARD_STATUS_LABELS[reportCard.status]}
                  </Badge>
                  {reportCard.status === "failed" && reportCard.error_message && (
                    <p className="mt-1 text-xs text-muted-foreground">{reportCard.error_message}</p>
                  )}
                </TableCell>
                <TableCell>
                  {reportCard.generated_at ? new Date(reportCard.generated_at).toLocaleString() : "—"}
                </TableCell>
                <TableCell className="text-right">
                  {reportCard.status === "ready" && reportCard.file_url ? (
                    <Button asChild variant="ghost" size="icon-sm">
                      <a href={reportCard.file_url} target="_blank" rel="noreferrer">
                        <Download className="h-4 w-4" />
                      </a>
                    </Button>
                  ) : null}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
