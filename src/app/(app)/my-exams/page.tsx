import type { Metadata } from "next";
import Link from "next/link";
import { ClipboardList } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getCurrentUser } from "@/lib/session";
import { getEnrollmentsForStudent, getClassSubjects } from "@/lib/academics";
import {
  getAssessments,
  getAnswersForStudent,
  getQuestions,
  getResultsForStudent,
  type Assessment,
} from "@/lib/examinations";
import { assessmentTypeLabel } from "@/lib/examinations-forms";

export const metadata: Metadata = { title: "My Exams" };

async function getMyAssessments(studentId: string): Promise<Assessment[] | null> {
  const enrollments = await getEnrollmentsForStudent(studentId);
  if (!enrollments) return null;

  const activeClassArms = [...new Set(enrollments.filter((e) => e.status === "active").map((e) => e.class_arm))];
  const classSubjectLists = await Promise.all(activeClassArms.map((id) => getClassSubjects(id)));
  const classSubjectIds = [...new Set(classSubjectLists.flatMap((list) => list ?? []).map((cs) => cs.public_id))];

  const assessmentLists = await Promise.all(classSubjectIds.map((id) => getAssessments(id)));
  const byId = new Map<string, Assessment>();
  for (const assessment of assessmentLists.flatMap((list) => list ?? [])) {
    byId.set(assessment.public_id, assessment);
  }
  return [...byId.values()];
}

export default async function MyExamsPage() {
  const user = await getCurrentUser();
  const studentId = user?.student_public_id;

  if (!studentId) {
    return (
      <div className="mx-auto max-w-5xl space-y-6 p-6">
        <h1 className="text-xl font-semibold">My Exams</h1>
        <p className="text-sm text-muted-foreground">
          This page is for students — your account isn&apos;t linked to a student profile.
        </p>
      </div>
    );
  }

  const [assessments, answers, results] = await Promise.all([
    getMyAssessments(studentId),
    getAnswersForStudent(studentId),
    getResultsForStudent(studentId),
  ]);

  const resultByAssessment = new Map((results ?? []).map((r) => [r.assessment, r]));
  const answeredCountByQuestion = new Set((answers ?? []).map((a) => a.question));

  const rows = await Promise.all(
    (assessments ?? []).map(async (assessment) => {
      const questions = (await getQuestions(assessment.public_id)) ?? [];
      const answeredCount = questions.filter((q) => answeredCountByQuestion.has(q.public_id)).length;
      return { assessment, totalQuestions: questions.length, answeredCount };
    })
  );

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-6">
      <div>
        <h1 className="text-xl font-semibold">My Exams</h1>
        <p className="text-sm text-muted-foreground">Exams and tests for your enrolled classes.</p>
      </div>

      {assessments === null ? (
        <p className="text-sm text-muted-foreground">You don&apos;t have access to view your exams.</p>
      ) : rows.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed py-16 text-center">
          <ClipboardList className="h-8 w-8 text-muted-foreground" />
          <p className="font-medium">No exams yet</p>
          <p className="text-sm text-muted-foreground">
            Nothing has been set for your classes yet — check back later.
          </p>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Progress</TableHead>
              <TableHead>Result</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map(({ assessment, totalQuestions, answeredCount }) => {
              const result = resultByAssessment.get(assessment.public_id);
              const complete = totalQuestions > 0 && answeredCount === totalQuestions;
              return (
                <TableRow key={assessment.public_id}>
                  <TableCell>
                    <Link
                      href={`/my-exams/${assessment.public_id}`}
                      className="font-medium text-primary hover:underline"
                    >
                      {assessment.name}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{assessmentTypeLabel(assessment.assessment_type)}</Badge>
                  </TableCell>
                  <TableCell>
                    {totalQuestions === 0 ? (
                      <span className="text-sm text-muted-foreground">No questions yet</span>
                    ) : (
                      <Badge variant={complete ? "default" : "outline"}>
                        {answeredCount} / {totalQuestions} answered
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {result ? (
                      <Badge variant="secondary">
                        {result.score} · {result.status}
                      </Badge>
                    ) : (
                      <span className="text-sm text-muted-foreground">Not yet finalized</span>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
