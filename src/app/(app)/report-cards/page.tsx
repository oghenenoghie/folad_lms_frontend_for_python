import type { Metadata } from "next";
import Link from "next/link";
import { FileText, Plus, Wand2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  ReportCardGenerateDialog,
  ReportCardGenerateBulkDialog,
} from "@/components/report-cards/report-card-form-dialogs";
import { ReportCardBulkExportsSection } from "@/components/report-cards/report-card-bulk-exports-section";
import {
  getReportCards,
  getTermLabelMap,
  REPORT_CARD_PDF_STATUS_LABELS,
  REPORT_CARD_STATUS_LABELS,
  type ReportCardStatus,
} from "@/lib/report-cards";
import { getStudents } from "@/lib/students";
import { getClassArms, getClassLevels } from "@/lib/academics";
import { getAcademicYears, getTerms } from "@/lib/schools";
import { generateReportCard, generateReportCardsBulk } from "@/lib/actions/report-cards";

export const metadata: Metadata = { title: "Report Cards" };

async function getStudentOptions() {
  const students = await getStudents();
  if (!students) return [];
  return students.map((s) => ({
    value: s.public_id,
    label: `${s.first_name} ${s.last_name} (${s.admission_number})`,
  }));
}

async function getTermOptions() {
  const [terms, academicYears] = await Promise.all([getTerms(), getAcademicYears()]);
  if (!terms || !academicYears) return [];
  const yearNameById = new Map(academicYears.map((y) => [y.public_id, y.name]));
  return terms.map((term) => ({
    value: term.public_id,
    label: `${yearNameById.get(term.academic_year) ?? "Unknown year"} — ${term.name}`,
  }));
}

async function getClassLabels() {
  const [classArms, classLevels] = await Promise.all([getClassArms(), getClassLevels()]);
  if (!classArms || !classLevels) return new Map<string, string>();
  const classLevelNameById = new Map(classLevels.map((l) => [l.public_id, l.name]));
  return new Map(classArms.map((arm) => [arm.public_id, `${classLevelNameById.get(arm.class_level) ?? ""} ${arm.name}`]));
}

async function getClassArmOptions() {
  const [classArms, classLevels] = await Promise.all([getClassArms(), getClassLevels()]);
  if (!classArms || !classLevels) return [];
  const classLevelNameById = new Map(classLevels.map((l) => [l.public_id, l.name]));
  return classArms.map((arm) => ({
    value: arm.public_id,
    label: `${classLevelNameById.get(arm.class_level) ?? ""} ${arm.name}`.trim(),
  }));
}

function statusVariant(status: ReportCardStatus): "default" | "secondary" | "destructive" | "outline" {
  if (status === "published") return "default";
  if (status === "archived") return "outline";
  return "secondary";
}

export default async function ReportCardsPage() {
  const [reportCards, studentOptions, termOptions, termLabelById, classLabelById, classArmOptions] =
    await Promise.all([
      getReportCards(),
      getStudentOptions(),
      getTermOptions(),
      getTermLabelMap(),
      getClassLabels(),
      getClassArmOptions(),
    ]);

  const studentNameById = new Map(studentOptions.map((s) => [s.value, s.label]));

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Report Cards</h1>
          <p className="text-sm text-muted-foreground">
            Generate, review, and publish each student&apos;s consolidated term report.
          </p>
        </div>
        {reportCards !== null && studentOptions.length > 0 && termOptions.length > 0 && (
          <div className="flex items-center gap-2">
            <ReportCardGenerateBulkDialog
              trigger={
                <Button variant="secondary">
                  <Wand2 className="h-4 w-4" />
                  Generate for a term
                </Button>
              }
              title="Generate report cards for a term"
              termOptions={termOptions}
              action={generateReportCardsBulk}
            />
            <ReportCardGenerateDialog
              trigger={
                <Button>
                  <Plus className="h-4 w-4" />
                  Generate one
                </Button>
              }
              title="Generate a report card"
              studentOptions={studentOptions}
              termOptions={termOptions}
              action={generateReportCard}
            />
          </div>
        )}
      </div>

      {reportCards === null ? (
        <p className="text-sm text-muted-foreground">You don&apos;t have access to report cards.</p>
      ) : reportCards.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed py-16 text-center">
          <FileText className="h-8 w-8 text-muted-foreground" />
          <p className="font-medium">No report cards yet</p>
          <p className="text-sm text-muted-foreground">
            {studentOptions.length === 0 || termOptions.length === 0
              ? "Add a student and a term first, then generate a report card."
              : "Generate one for a single student, or a whole term at once."}
          </p>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Student</TableHead>
              <TableHead>Class</TableHead>
              <TableHead>Term</TableHead>
              <TableHead>Average</TableHead>
              <TableHead>Position</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>PDF</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {reportCards.map((reportCard) => (
              <TableRow key={reportCard.public_id}>
                <TableCell>
                  <Link
                    href={`/report-cards/${reportCard.public_id}`}
                    className="font-medium text-primary hover:underline"
                  >
                    {studentNameById.get(reportCard.student) ?? reportCard.student}
                  </Link>
                </TableCell>
                <TableCell>{classLabelById.get(reportCard.class_arm) ?? "—"}</TableCell>
                <TableCell>{termLabelById.get(reportCard.term) ?? reportCard.term}</TableCell>
                <TableCell>{reportCard.average_percentage}%</TableCell>
                <TableCell>
                  {reportCard.class_position ? `${reportCard.class_position} / ${reportCard.class_size}` : "—"}
                </TableCell>
                <TableCell>
                  <Badge variant={statusVariant(reportCard.status)}>
                    {REPORT_CARD_STATUS_LABELS[reportCard.status]}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{REPORT_CARD_PDF_STATUS_LABELS[reportCard.pdf_status]}</Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <ReportCardBulkExportsSection
        termOptions={termOptions}
        classArmOptions={classArmOptions}
        termLabelById={termLabelById}
        classLabelById={classLabelById}
      />
    </div>
  );
}
