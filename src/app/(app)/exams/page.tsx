import type { Metadata } from "next";
import Link from "next/link";
import { NotebookPen, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ExamCreateFormDialog } from "@/components/examinations/exam-form-dialog";
import { getExams } from "@/lib/examinations";
import { getAcademicYears, getTerms } from "@/lib/schools";
import { createExam } from "@/lib/actions/examinations";
import { examCreateDefaults } from "@/lib/examinations-forms";

export const metadata: Metadata = { title: "Exams" };

async function getTermOptions() {
  const [terms, academicYears] = await Promise.all([getTerms(), getAcademicYears()]);
  if (!terms || !academicYears) return [];

  const yearNameById = new Map(academicYears.map((y) => [y.public_id, y.name]));
  return terms.map((term) => ({
    value: term.public_id,
    label: `${yearNameById.get(term.academic_year) ?? "Unknown year"} — ${term.name}`,
  }));
}

export default async function ExamsPage() {
  const [exams, termOptions] = await Promise.all([getExams(), getTermOptions()]);

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Exams</h1>
          <p className="text-sm text-muted-foreground">
            Manage exam logistics: schedules per class subject and invigilator assignments.
          </p>
        </div>
        {exams !== null && termOptions.length > 0 && (
          <ExamCreateFormDialog
            trigger={
              <Button>
                <Plus className="h-4 w-4" />
                New exam
              </Button>
            }
            title="New exam"
            defaultValues={examCreateDefaults}
            termOptions={termOptions}
            action={createExam}
          />
        )}
      </div>

      {exams === null ? (
        <p className="text-sm text-muted-foreground">You don&apos;t have access to exams.</p>
      ) : exams.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed py-16 text-center">
          <NotebookPen className="h-8 w-8 text-muted-foreground" />
          <p className="font-medium">No exams yet</p>
          <p className="text-sm text-muted-foreground">
            {termOptions.length === 0
              ? "Create an academic year and term first, then add an exam."
              : "Add your first exam to get started."}
          </p>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Start date</TableHead>
              <TableHead>End date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {exams.map((exam) => (
              <TableRow key={exam.public_id}>
                <TableCell>
                  <Link href={`/exams/${exam.public_id}`} className="font-medium text-primary hover:underline">
                    {exam.name}
                  </Link>
                </TableCell>
                <TableCell>{exam.start_date}</TableCell>
                <TableCell>{exam.end_date}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
