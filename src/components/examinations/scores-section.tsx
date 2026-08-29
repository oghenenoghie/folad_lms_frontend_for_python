import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FinalizeScoreButton } from "@/components/examinations/finalize-score-button";
import { getResultsForAssessment, getStudentAnswers, type Question } from "@/lib/examinations";

export async function ScoresSection({
  assessmentId,
  questions,
}: {
  assessmentId: string;
  questions: Question[];
}) {
  const answersByQuestion = await Promise.all(
    questions.map((question) => getStudentAnswers(question.public_id))
  );
  const results = (await getResultsForAssessment(assessmentId)) ?? [];
  const resultByStudent = new Map(results.map((result) => [result.student, result]));

  const studentIds = new Map<string, boolean>(); // student -> has any ungraded answer
  for (const answers of answersByQuestion) {
    for (const answer of answers ?? []) {
      const hasUngraded = answer.marks_awarded === null;
      studentIds.set(answer.student, (studentIds.get(answer.student) ?? false) || hasUngraded);
    }
  }

  if (studentIds.size === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Scores</CardTitle>
        <CardDescription>
          Finalizing sums a student&apos;s graded answers into their result. Students with an ungraded
          answer still can&apos;t be finalized until grading is complete.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Student</TableHead>
              <TableHead>Result</TableHead>
              <TableHead className="w-1" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {[...studentIds.entries()].map(([studentId, hasUngraded]) => {
              const result = resultByStudent.get(studentId);
              return (
                <TableRow key={studentId}>
                  <TableCell className="font-mono text-xs">{studentId.slice(0, 8)}…</TableCell>
                  <TableCell>
                    {result ? (
                      <Badge variant="secondary">
                        {result.score} · {result.status}
                      </Badge>
                    ) : (
                      <span className="text-sm text-muted-foreground">Not finalized</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    {hasUngraded ? (
                      <span className="text-xs text-muted-foreground">Grading incomplete</span>
                    ) : (
                      <FinalizeScoreButton assessmentId={assessmentId} studentId={studentId} />
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
