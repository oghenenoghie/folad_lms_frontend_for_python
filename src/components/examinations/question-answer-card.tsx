import { CheckCircle2, CircleDot } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AnswerQuestionForm } from "@/components/examinations/answer-question-form";
import {
  getAnswerForQuestion,
  getQuestionOptions,
  OBJECTIVE_QUESTION_TYPES,
  type Question,
} from "@/lib/examinations";
import { questionTypeLabel } from "@/lib/examinations-forms";

export async function QuestionAnswerCard({
  assessmentId,
  question,
  studentId,
}: {
  assessmentId: string;
  question: Question;
  studentId: string;
}) {
  const isObjective = OBJECTIVE_QUESTION_TYPES.includes(question.question_type);
  const [options, answer] = await Promise.all([
    isObjective ? getQuestionOptions(question.public_id) : Promise.resolve(null),
    getAnswerForQuestion(question.public_id, studentId),
  ]);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Badge variant="secondary">Q{question.sequence}</Badge>
          <Badge>{questionTypeLabel(question.question_type)}</Badge>
          <span className="text-xs text-muted-foreground">{question.marks} marks</span>
        </div>
        <CardTitle className="text-base font-medium">{question.text}</CardTitle>
      </CardHeader>
      <CardContent>
        {answer ? (
          <div className="space-y-2 text-sm">
            {isObjective ? (
              <div className="space-y-1">
                {(options ?? []).map((option) => (
                  <div key={option.public_id} className="flex items-center gap-2">
                    {option.public_id === answer.selected_option ? (
                      <CircleDot className="h-4 w-4 text-primary" />
                    ) : (
                      <div className="h-4 w-4 shrink-0" />
                    )}
                    <span className={option.public_id === answer.selected_option ? "font-medium" : ""}>
                      {option.text}
                    </span>
                  </div>
                ))}
                <Badge variant={answer.is_correct ? "default" : "secondary"} className="mt-1">
                  {answer.is_correct ? "Correct" : "Incorrect"} · {answer.marks_awarded} / {question.marks}
                </Badge>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="rounded-md border bg-muted/30 p-3">{answer.text_answer}</p>
                {answer.marks_awarded !== null ? (
                  <Badge variant={answer.is_correct ? "default" : "secondary"}>
                    <CheckCircle2 className="h-3 w-3" />
                    {answer.marks_awarded} / {question.marks}
                  </Badge>
                ) : (
                  <Badge variant="outline">Submitted — awaiting grading</Badge>
                )}
              </div>
            )}
          </div>
        ) : (
          <AnswerQuestionForm
            assessmentId={assessmentId}
            question={question}
            options={options ?? []}
            studentId={studentId}
          />
        )}
      </CardContent>
    </Card>
  );
}
