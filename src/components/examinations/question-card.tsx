import { CheckCircle2, Circle, Pencil, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DeleteConfirmButton } from "@/components/schools/delete-confirm-button";
import { QuestionFormDialog } from "@/components/examinations/question-form-dialog";
import { QuestionOptionFormDialog } from "@/components/examinations/question-option-form-dialog";
import { QuestionImageControl } from "@/components/examinations/question-image-control";
import {
  getQuestionOptions,
  OBJECTIVE_QUESTION_TYPES,
  type Question,
} from "@/lib/examinations";
import {
  createQuestionOption,
  deleteQuestion,
  deleteQuestionOption,
  updateQuestion,
  updateQuestionOption,
} from "@/lib/actions/examinations";
import { questionOptionDefaults, questionTypeLabel } from "@/lib/examinations-forms";

export async function QuestionCard({
  assessmentId,
  question,
}: {
  assessmentId: string;
  question: Question;
}) {
  const isObjective = OBJECTIVE_QUESTION_TYPES.includes(question.question_type);
  const options = isObjective ? await getQuestionOptions(question.public_id) : null;

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Badge variant="secondary">Q{question.sequence}</Badge>
            <Badge>{questionTypeLabel(question.question_type)}</Badge>
            <span className="text-xs text-muted-foreground">{question.marks} marks</span>
          </div>
          <CardTitle className="text-base font-medium">{question.text}</CardTitle>
        </div>
        <div className="flex shrink-0 gap-1">
          <QuestionFormDialog
            trigger={
              <Button variant="ghost" size="icon-sm">
                <Pencil className="h-4 w-4" />
              </Button>
            }
            title="Edit question"
            defaultValues={{
              question_type: question.question_type,
              text: question.text,
              marks: question.marks,
              sequence: question.sequence,
            }}
            action={updateQuestion.bind(null, assessmentId, question.public_id)}
          />
          <DeleteConfirmButton
            description="Delete this question? Its options and any student answers reference it, so this cannot be undone."
            action={deleteQuestion.bind(null, assessmentId, question.public_id)}
          />
        </div>
      </CardHeader>

      <CardContent className="space-y-3 pt-0">
        {question.image_url && (
          // eslint-disable-next-line @next/next/no-img-element -- a presigned storage URL, not an app asset next/image can optimize
          <img
            src={question.image_url}
            alt={`Diagram for question ${question.sequence}`}
            className="max-h-64 rounded-md border object-contain"
          />
        )}
        <QuestionImageControl
          assessmentId={assessmentId}
          questionId={question.public_id}
          hasImage={Boolean(question.image_url)}
        />
      </CardContent>

      {isObjective && (
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-muted-foreground">Options</p>
            <QuestionOptionFormDialog
              trigger={
                <Button variant="secondary" size="sm">
                  <Plus className="h-4 w-4" />
                  Add option
                </Button>
              }
              title="Add option"
              defaultValues={{
                ...questionOptionDefaults,
                sequence: (options?.length ?? 0) + 1,
              }}
              action={createQuestionOption.bind(null, assessmentId, question.public_id)}
            />
          </div>

          {!options || options.length === 0 ? (
            <p className="text-sm text-muted-foreground">No options yet.</p>
          ) : (
            <ul className="space-y-2">
              {options.map((option) => (
                <li
                  key={option.public_id}
                  className="flex items-center justify-between rounded-md border px-3 py-2 text-sm"
                >
                  <div className="flex items-center gap-2">
                    {option.is_correct ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    ) : (
                      <Circle className="h-4 w-4 text-muted-foreground" />
                    )}
                    {option.text}
                  </div>
                  <div className="flex gap-1">
                    <QuestionOptionFormDialog
                      trigger={
                        <Button variant="ghost" size="icon-sm">
                          <Pencil className="h-4 w-4" />
                        </Button>
                      }
                      title="Edit option"
                      defaultValues={{
                        text: option.text,
                        is_correct: option.is_correct,
                        sequence: option.sequence,
                      }}
                      action={updateQuestionOption.bind(null, assessmentId, option.public_id)}
                    />
                    <DeleteConfirmButton
                      description="Delete this option? This cannot be undone."
                      action={deleteQuestionOption.bind(null, assessmentId, option.public_id)}
                    />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      )}
    </Card>
  );
}
