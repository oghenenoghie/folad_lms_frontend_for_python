import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Badge } from "@/components/ui/badge";
import { QuestionAnswerCard } from "@/components/examinations/question-answer-card";
import { getCurrentUser } from "@/lib/session";
import { getAssessmentResult, getQuestions, getResultsForStudent } from "@/lib/examinations";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ publicId: string }>;
}): Promise<Metadata> {
  const { publicId } = await params;
  const result = await getAssessmentResult(publicId);
  return { title: result.status === "ok" ? result.data.name : "Exam" };
}

export default async function MyExamDetailPage({
  params,
}: {
  params: Promise<{ publicId: string }>;
}) {
  const { publicId } = await params;
  const user = await getCurrentUser();
  const studentId = user?.student_public_id;

  if (!studentId) {
    return (
      <div className="mx-auto max-w-5xl space-y-6 p-6">
        <p className="text-sm text-muted-foreground">
          This page is for students — your account isn&apos;t linked to a student profile.
        </p>
      </div>
    );
  }

  const assessmentResult = await getAssessmentResult(publicId);
  if (assessmentResult.status === "forbidden") {
    return (
      <div className="mx-auto max-w-5xl space-y-6 p-6">
        <p className="text-sm text-muted-foreground">You don&apos;t have access to this exam.</p>
      </div>
    );
  }
  if (assessmentResult.status === "not_found") notFound();
  const assessment = assessmentResult.data;

  const [questions, results] = await Promise.all([
    getQuestions(publicId),
    getResultsForStudent(studentId),
  ]);
  const result = (results ?? []).find((r) => r.assessment === publicId);

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-6">
      <div className="space-y-1">
        <h1 className="text-xl font-semibold">{assessment.name}</h1>
        <p className="text-sm text-muted-foreground">
          {assessment.max_score} marks · weight {assessment.weight}
        </p>
        {result && (
          <Badge variant="secondary">
            Your result: {result.score} · {result.status}
          </Badge>
        )}
      </div>

      {!questions || questions.length === 0 ? (
        <p className="text-sm text-muted-foreground">No questions have been added to this exam yet.</p>
      ) : (
        <div className="space-y-3">
          {questions.map((question) => (
            <QuestionAnswerCard
              key={question.public_id}
              assessmentId={publicId}
              question={question}
              studentId={studentId}
            />
          ))}
        </div>
      )}
    </div>
  );
}
