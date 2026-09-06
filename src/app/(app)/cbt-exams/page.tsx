import type { Metadata } from "next";
import Link from "next/link";
import { Monitor, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CBTExamCreateFormDialog } from "@/components/cbt/admin/exam-form-dialog";
import { getCBTExams } from "@/lib/cbt";
import { getSchools, getAcademicYears, getTerms } from "@/lib/schools";
import { getSubjects, getClassLevels } from "@/lib/academics";
import { createCBTExam } from "@/lib/actions/cbt";
import { cbtExamCreateDefaults } from "@/lib/cbt-forms";

export const metadata: Metadata = { title: "CBT Exams" };

function statusVariant(status: string): "default" | "secondary" | "outline" | "destructive" {
  if (status === "published" || status === "open") return "default";
  if (status === "archived" || status === "closed") return "outline";
  if (status === "draft") return "secondary";
  return "outline";
}

export default async function CBTExamsPage() {
  const [exams, schools, academicYears, terms, subjects, classLevels] = await Promise.all([
    getCBTExams(),
    getSchools(),
    getAcademicYears(),
    getTerms(),
    getSubjects(),
    getClassLevels(),
  ]);

  const subjectNameById = new Map((subjects ?? []).map((s) => [s.public_id, s.name]));
  const classLevelNameById = new Map((classLevels ?? []).map((l) => [l.public_id, l.name]));
  const academicYearNameById = new Map((academicYears ?? []).map((y) => [y.public_id, y.name]));

  const schoolOptions = (schools ?? []).map((s) => ({ value: s.public_id, label: s.name }));
  const academicYearOptions = (academicYears ?? []).map((y) => ({ value: y.public_id, label: y.name }));
  const termOptions = (terms ?? []).map((t) => ({
    value: t.public_id,
    label: `${academicYearNameById.get(t.academic_year) ?? "Unknown year"} — ${t.name}`,
  }));
  const subjectOptions = (subjects ?? []).map((s) => ({ value: s.public_id, label: s.name }));
  const classLevelOptions = (classLevels ?? []).map((l) => ({ value: l.public_id, label: l.name }));

  const canCreate =
    schoolOptions.length > 0 &&
    academicYearOptions.length > 0 &&
    termOptions.length > 0 &&
    subjectOptions.length > 0 &&
    classLevelOptions.length > 0;

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">CBT Exams</h1>
          <p className="text-sm text-muted-foreground">
            Build, publish, and monitor computer-based exams.
          </p>
        </div>
        {exams !== null && canCreate && (
          <CBTExamCreateFormDialog
            trigger={
              <Button>
                <Plus className="h-4 w-4" />
                New exam
              </Button>
            }
            title="New CBT exam"
            defaultValues={cbtExamCreateDefaults}
            schoolOptions={schoolOptions}
            academicYearOptions={academicYearOptions}
            termOptions={termOptions}
            subjectOptions={subjectOptions}
            classLevelOptions={classLevelOptions}
            action={createCBTExam}
          />
        )}
      </div>

      {exams === null ? (
        <p className="text-sm text-muted-foreground">You don&apos;t have access to CBT exams.</p>
      ) : exams.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed py-16 text-center">
          <Monitor className="h-8 w-8 text-muted-foreground" />
          <p className="font-medium">No CBT exams yet</p>
          <p className="text-sm text-muted-foreground">
            {canCreate
              ? "Create your first CBT exam, then attach questions and candidates."
              : "Create a school, academic year, term, subject, and class level first."}
          </p>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Code</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Subject</TableHead>
              <TableHead>Class level</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {exams.map((exam) => (
              <TableRow key={exam.public_id}>
                <TableCell>
                  <Link
                    href={`/cbt-exams/${exam.public_id}`}
                    className="font-medium text-primary hover:underline"
                  >
                    {exam.code}
                  </Link>
                </TableCell>
                <TableCell>{exam.name}</TableCell>
                <TableCell>{subjectNameById.get(exam.subject) ?? "Unknown"}</TableCell>
                <TableCell>{classLevelNameById.get(exam.class_level) ?? "Unknown"}</TableCell>
                <TableCell>{exam.duration_minutes} min</TableCell>
                <TableCell>
                  <Badge variant={statusVariant(exam.status)} className="capitalize">
                    {exam.status}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
