import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Pencil, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DeleteConfirmButton } from "@/components/schools/delete-confirm-button";
import { AssessmentEditFormDialog } from "@/components/examinations/assessment-form-dialog";
import { QuestionFormDialog } from "@/components/examinations/question-form-dialog";
import { QuestionCard } from "@/components/examinations/question-card";
import { GradingSection } from "@/components/examinations/grading-section";
import { ScoresSection } from "@/components/examinations/scores-section";
import { getAssessment, getQuestions } from "@/lib/examinations";
import { createQuestion, deleteAssessment, updateAssessment } from "@/lib/actions/examinations";
import { assessmentTypeLabel, questionDefaults } from "@/lib/examinations-forms";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ publicId: string }>;
}): Promise<Metadata> {
  const { publicId } = await params;
  const assessment = await getAssessment(publicId);
  return { title: assessment ? assessment.name : "Assessment" };
}

export default async function AssessmentDetailPage({
  params,
}: {
  params: Promise<{ publicId: string }>;
}) {
  const { publicId } = await params;
  const assessment = await getAssessment(publicId);
  if (!assessment) notFound();

  const questions = (await getQuestions(publicId)) ?? [];

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-6">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-semibold">{assessment.name}</h1>
            <Badge variant="secondary">{assessmentTypeLabel(assessment.assessment_type)}</Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            {assessment.max_score} marks · weight {assessment.weight}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <AssessmentEditFormDialog
            trigger={
              <Button variant="secondary">
                <Pencil className="h-4 w-4" />
                Edit
              </Button>
            }
            title="Edit assessment"
            defaultValues={{
              name: assessment.name,
              assessment_type: assessment.assessment_type,
              weight: assessment.weight,
              max_score: assessment.max_score,
            }}
            action={updateAssessment.bind(null, assessment.public_id)}
          />
          <DeleteConfirmButton
            description={`Delete ${assessment.name}? Its questions and any student answers reference it, so this cannot be undone.`}
            action={deleteAssessment.bind(null, assessment.public_id)}
          />
        </div>
      </div>

      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium">Questions</h2>
        <QuestionFormDialog
          trigger={
            <Button size="sm">
              <Plus className="h-4 w-4" />
              Add question
            </Button>
          }
          title="Add question"
          defaultValues={{ ...questionDefaults, sequence: questions.length + 1 }}
          action={createQuestion.bind(null, publicId)}
        />
      </div>

      {questions.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No questions yet. Add one to start building this assessment&apos;s question bank.
        </p>
      ) : (
        <div className="space-y-3">
          {questions.map((question) => (
            <QuestionCard key={question.public_id} assessmentId={publicId} question={question} />
          ))}
        </div>
      )}

      <GradingSection assessmentId={publicId} questions={questions} />
      <ScoresSection assessmentId={publicId} questions={questions} />
    </div>
  );
}
