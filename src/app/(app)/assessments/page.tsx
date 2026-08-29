import type { Metadata } from "next";
import Link from "next/link";
import { ClipboardList, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AssessmentCreateFormDialog } from "@/components/examinations/assessment-form-dialog";
import { getAssessments } from "@/lib/examinations";
import { getClassArms, getClassLevels, getClassSubjects, getSubjects } from "@/lib/academics";
import { getAcademicYears, getTerms } from "@/lib/schools";
import { createAssessment } from "@/lib/actions/examinations";
import { assessmentCreateDefaults, assessmentTypeLabel } from "@/lib/examinations-forms";

export const metadata: Metadata = { title: "Assessments" };

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

export default async function AssessmentsPage() {
  const [assessments, classSubjectOptions, termOptions] = await Promise.all([
    getAssessments(),
    getClassSubjectOptions(),
    getTermOptions(),
  ]);

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Assessments</h1>
          <p className="text-sm text-muted-foreground">
            Manage each assessment&apos;s question bank and grade student answers.
          </p>
        </div>
        {assessments !== null && classSubjectOptions.length > 0 && termOptions.length > 0 && (
          <AssessmentCreateFormDialog
            trigger={
              <Button>
                <Plus className="h-4 w-4" />
                New assessment
              </Button>
            }
            title="New assessment"
            defaultValues={assessmentCreateDefaults}
            classSubjectOptions={classSubjectOptions}
            termOptions={termOptions}
            action={createAssessment}
          />
        )}
      </div>

      {assessments === null ? (
        <p className="text-sm text-muted-foreground">You don&apos;t have access to assessments.</p>
      ) : assessments.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed py-16 text-center">
          <ClipboardList className="h-8 w-8 text-muted-foreground" />
          <p className="font-medium">No assessments yet</p>
          <p className="text-sm text-muted-foreground">
            {classSubjectOptions.length === 0 || termOptions.length === 0
              ? "Create a class subject and a term first, then add an assessment."
              : "Add your first assessment to get started."}
          </p>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Weight</TableHead>
              <TableHead>Max score</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {assessments.map((assessment) => (
              <TableRow key={assessment.public_id}>
                <TableCell>
                  <Link
                    href={`/assessments/${assessment.public_id}`}
                    className="font-medium text-primary hover:underline"
                  >
                    {assessment.name}
                  </Link>
                </TableCell>
                <TableCell>
                  <Badge variant="secondary">{assessmentTypeLabel(assessment.assessment_type)}</Badge>
                </TableCell>
                <TableCell>{assessment.weight}</TableCell>
                <TableCell>{assessment.max_score}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
