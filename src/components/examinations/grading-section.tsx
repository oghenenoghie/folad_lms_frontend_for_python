import { Pencil } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { GradeAnswerDialog } from "@/components/examinations/grade-answer-dialog";
import {
  getStudentAnswers,
  OBJECTIVE_QUESTION_TYPES,
  type Question,
  type StudentAnswer,
} from "@/lib/examinations";
import { gradeStudentAnswer } from "@/lib/actions/examinations";
import { gradeAnswerDefaults } from "@/lib/examinations-forms";

// Objective (multiple_choice/true_false) answers auto-grade the instant a
// student submits them — see apps.examinations.services.student_answer_service
// on the backend — so this section only ever has work to do for subjective
// (short_answer/essay) questions, and only lists those.
export async function GradingSection({
  assessmentId,
  questions,
}: {
  assessmentId: string;
  questions: Question[];
}) {
  const subjectiveQuestions = questions.filter((q) => !OBJECTIVE_QUESTION_TYPES.includes(q.question_type));

  const answersByQuestion = await Promise.all(
    subjectiveQuestions.map(async (question) => ({
      question,
      answers: (await getStudentAnswers(question.public_id)) ?? [],
    }))
  );

  const rows = answersByQuestion.flatMap(({ question, answers }) =>
    answers.map((answer) => ({ question, answer }))
  );

  if (subjectiveQuestions.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Grading</CardTitle>
        <CardDescription>
          Short-answer and essay responses need a mark before they count toward a student&apos;s score.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {rows.length === 0 ? (
          <p className="text-sm text-muted-foreground">No answers submitted yet.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Question</TableHead>
                <TableHead>Student</TableHead>
                <TableHead>Answer</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-1" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map(({ question, answer }) => (
                <GradingRow key={answer.public_id} assessmentId={assessmentId} question={question} answer={answer} />
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}

function GradingRow({
  assessmentId,
  question,
  answer,
}: {
  assessmentId: string;
  question: Question;
  answer: StudentAnswer;
}) {
  const graded = answer.marks_awarded !== null;

  return (
    <TableRow>
      <TableCell className="max-w-48 truncate" title={question.text}>
        Q{question.sequence} — {question.text}
      </TableCell>
      <TableCell className="font-mono text-xs">{answer.student.slice(0, 8)}…</TableCell>
      <TableCell className="max-w-64 truncate" title={answer.text_answer}>
        {answer.text_answer}
      </TableCell>
      <TableCell>
        {graded ? (
          <Badge variant={answer.is_correct ? "default" : "secondary"}>
            {answer.marks_awarded} / {question.marks}
          </Badge>
        ) : (
          <Badge variant="outline">Ungraded</Badge>
        )}
      </TableCell>
      <TableCell className="text-right">
        <GradeAnswerDialog
          trigger={
            <Button variant={graded ? "ghost" : "secondary"} size={graded ? "icon-sm" : "sm"}>
              {graded ? <Pencil className="h-4 w-4" /> : "Grade"}
            </Button>
          }
          title={graded ? "Re-grade answer" : "Grade answer"}
          description={answer.text_answer}
          defaultValues={
            graded
              ? { marks_awarded: answer.marks_awarded ?? "", is_correct: answer.is_correct ?? false }
              : gradeAnswerDefaults
          }
          action={gradeStudentAnswer.bind(null, assessmentId, answer.public_id)}
        />
      </TableCell>
    </TableRow>
  );
}
