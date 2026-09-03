import { Download, FolderArchive } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { SelectOption } from "@/components/schools/entity-form-dialog";
import { ReportCardBulkExportRequestDialog } from "@/components/report-cards/report-card-form-dialogs";
import {
  getReportCardBulkExports,
  REPORT_CARD_BULK_EXPORT_STATUS_LABELS,
  type ReportCardBulkExportStatus,
} from "@/lib/report-cards";
import { requestReportCardBulkExport } from "@/lib/actions/report-cards";

function statusVariant(status: ReportCardBulkExportStatus): "default" | "secondary" | "destructive" | "outline" {
  if (status === "ready") return "default";
  if (status === "failed") return "destructive";
  return "secondary";
}

// A whole-term/whole-school ZIP of every report card PDF — async (see
// apps.report_cards.services.report_card_bulk_export_service), so this
// section is a plain server-rendered list of past/in-flight jobs rather
// than anything that polls; reload the page to see a job move past
// "pending"/"processing".
export async function ReportCardBulkExportsSection({
  termOptions,
  classArmOptions,
  termLabelById,
  classLabelById,
}: {
  termOptions: SelectOption[];
  classArmOptions: SelectOption[];
  termLabelById: Map<string, string>;
  classLabelById: Map<string, string>;
}) {
  const exports = await getReportCardBulkExports();
  if (exports === null) return null;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Bulk exports</CardTitle>
        {termOptions.length > 0 && (
          <ReportCardBulkExportRequestDialog
            trigger={
              <Button size="sm" variant="secondary">
                <FolderArchive className="h-4 w-4" />
                Request a ZIP export
              </Button>
            }
            title="Request a bulk PDF export"
            termOptions={termOptions}
            classArmOptions={classArmOptions}
            action={requestReportCardBulkExport}
          />
        )}
      </CardHeader>
      <CardContent>
        {exports.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No bulk exports yet — request one to download every report card in a term as a single ZIP.
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Term</TableHead>
                <TableHead>Scope</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Report cards</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {exports.map((exportJob) => (
                <TableRow key={exportJob.public_id}>
                  <TableCell>{termLabelById.get(exportJob.term) ?? exportJob.term}</TableCell>
                  <TableCell>
                    {exportJob.class_arm ? (classLabelById.get(exportJob.class_arm) ?? exportJob.class_arm) : "Whole year"}
                  </TableCell>
                  <TableCell>
                    <Badge variant={statusVariant(exportJob.status)}>
                      {REPORT_CARD_BULK_EXPORT_STATUS_LABELS[exportJob.status]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {exportJob.status === "ready" || exportJob.status === "failed"
                      ? `${exportJob.report_card_count} generated${exportJob.failed_count > 0 ? `, ${exportJob.failed_count} failed` : ""}`
                      : "—"}
                  </TableCell>
                  <TableCell>
                    {exportJob.status === "ready" && (
                      <Button asChild variant="ghost" size="icon-sm" title="Download ZIP">
                        <a href={`/api/report-cards/bulk-exports/${exportJob.public_id}/download`}>
                          <Download className="h-4 w-4" />
                        </a>
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
