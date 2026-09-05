import type { Metadata } from "next";
import { FileBarChart, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ReportRequestDialog } from "@/components/reports/report-request-dialog";
import { ReportDownloadButton } from "@/components/reports/report-download-button";
import { getReportRequests } from "@/lib/reports";
import { getSchools, getAcademicYears, getTerms } from "@/lib/schools";
import { getClassArms } from "@/lib/academics";
import { createReportRequest } from "@/lib/actions/reports";
import { reportTypeLabel, reportFormatLabel, reportStatusLabels } from "@/lib/reports-forms";
import type { ReportStatus } from "@/lib/reports";

export const metadata: Metadata = { title: "Reports" };

function statusVariant(status: ReportStatus): "default" | "secondary" | "destructive" | "outline" {
  if (status === "ready") return "default";
  if (status === "failed") return "destructive";
  return "secondary";
}

export default async function ReportsPage() {
  const [reportRequests, schools, classArms, terms, academicYears] = await Promise.all([
    getReportRequests(),
    getSchools(),
    getClassArms(),
    getTerms(),
    getAcademicYears(),
  ]);

  const schoolOptions = (schools ?? []).map((school) => ({ value: school.public_id, label: school.name }));
  const schoolNameById = new Map(schoolOptions.map((option) => [option.value, option.label]));
  const classArmOptions = (classArms ?? []).map((arm) => ({ value: arm.public_id, label: arm.name }));
  const academicYearNameById = new Map((academicYears ?? []).map((year) => [year.public_id, year.name]));
  const termOptions = (terms ?? []).map((term) => ({
    value: term.public_id,
    label: `${term.name} (${academicYearNameById.get(term.academic_year) ?? "Unknown year"})`,
  }));

  const canRequest =
    reportRequests !== null && schoolOptions.length > 0;

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-semibold">Reports</h1>
          <p className="text-sm text-muted-foreground">
            Request an export (CSV, Excel, or PDF) and download it once it&apos;s ready.
          </p>
        </div>
        {canRequest && (
          <ReportRequestDialog
            trigger={
              <Button size="sm">
                <Plus className="h-4 w-4" />
                Request a report
              </Button>
            }
            schoolOptions={schoolOptions}
            classArmOptions={classArmOptions}
            termOptions={termOptions}
            action={createReportRequest}
          />
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Report requests</CardTitle>
        </CardHeader>
        <CardContent>
          {reportRequests === null ? (
            <p className="text-sm text-muted-foreground">You don&apos;t have access to reports.</p>
          ) : reportRequests.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-8 text-center">
              <FileBarChart className="h-6 w-6 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">No reports requested yet.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>School</TableHead>
                  <TableHead>Format</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Requested</TableHead>
                  <TableHead className="w-1" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {reportRequests.map((reportRequest) => (
                  <TableRow key={reportRequest.public_id}>
                    <TableCell>{reportTypeLabel(reportRequest.report_type)}</TableCell>
                    <TableCell>{schoolNameById.get(reportRequest.school) ?? "Unknown school"}</TableCell>
                    <TableCell>{reportFormatLabel(reportRequest.format)}</TableCell>
                    <TableCell>
                      <Badge variant={statusVariant(reportRequest.status)}>
                        {reportStatusLabels[reportRequest.status]}
                      </Badge>
                      {reportRequest.status === "failed" && reportRequest.error_message && (
                        <p className="mt-1 text-xs text-destructive">{reportRequest.error_message}</p>
                      )}
                    </TableCell>
                    <TableCell>{reportRequest.created_at.slice(0, 10)}</TableCell>
                    <TableCell>
                      {reportRequest.status === "ready" && (
                        <ReportDownloadButton publicId={reportRequest.public_id} />
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
