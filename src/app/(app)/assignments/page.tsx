import type { Metadata } from "next";
import Link from "next/link";
import { ClipboardCheck, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AssignmentCreateFormDialog } from "@/components/assignments/assignment-form-dialog";
import { getAssignments } from "@/lib/assignments";
import { getClassArms, getClassLevels, getClassSubjects, getSubjects } from "@/lib/academics";
import { getAcademicYears, getTerms } from "@/lib/schools";
import { createAssignment } from "@/lib/actions/assignments";
import { assignmentCreateDefaults } from "@/lib/assignments-forms";

export const metadata: Metadata = { title: "Assignments" };

async function getClassSubjectOptions() {
  const [classSubjects, subjects, classArms, classLevels] = await Promise.all([
    getClassSubjects(),
    getSubjects(),
    getClassArms(),
    getClassLevels(),
  ]);
  if (!classSubjects || !subjects || !classArms || !classLevels) return [];

  const subjectNameById = new Map(subjects.map((s) => [s.public_id, s.name]));
  const classLevelNameById = new Map(classLevels.map((l) => [l.public_id, l.name]));
  const classArmById = new Map(classArms.map((a) => [a.public_id, a]));

  return classSubjects.map((cs) => {
    const classArm = classArmById.get(cs.class_arm);
    const classLevelName = classArm ? (classLevelNameById.get(classArm.class_level) ?? "") : "";
    const label = `${subjectNameById.get(cs.subject) ?? "Unknown subject"} — ${classLevelName}${classArm?.name ?? ""}`;
    return { value: cs.public_id, label };
  });
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

export default async function AssignmentsPage() {
  const [assignments, classSubjectOptions, termOptions] = await Promise.all([
    getAssignments(),
    getClassSubjectOptions(),
    getTermOptions(),
  ]);

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Assignments</h1>
          <p className="text-sm text-muted-foreground">
            Set homework for a class subject and grade what students submit.
          </p>
        </div>
        {assignments !== null && classSubjectOptions.length > 0 && termOptions.length > 0 && (
          <AssignmentCreateFormDialog
            trigger={
              <Button>
                <Plus className="h-4 w-4" />
                New assignment
              </Button>
            }
            title="New assignment"
            defaultValues={assignmentCreateDefaults}
            classSubjectOptions={classSubjectOptions}
            termOptions={termOptions}
            action={createAssignment}
          />
        )}
      </div>

      {assignments === null ? (
        <p className="text-sm text-muted-foreground">You don&apos;t have access to assignments.</p>
      ) : assignments.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed py-16 text-center">
          <ClipboardCheck className="h-8 w-8 text-muted-foreground" />
          <p className="font-medium">No assignments yet</p>
          <p className="text-sm text-muted-foreground">
            {classSubjectOptions.length === 0 || termOptions.length === 0
              ? "Create a class subject and a term first, then add an assignment."
              : "Add your first assignment to get started."}
          </p>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Due date</TableHead>
              <TableHead>Max score</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {assignments.map((assignment) => (
              <TableRow key={assignment.public_id}>
                <TableCell>
                  <Link
                    href={`/assignments/${assignment.public_id}`}
                    className="font-medium text-primary hover:underline"
                  >
                    {assignment.title}
                  </Link>
                </TableCell>
                <TableCell>{assignment.due_date}</TableCell>
                <TableCell>{assignment.max_score}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
