import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SubmissionForm } from "@/components/assignments/submission-form";
import { SubmissionView } from "@/components/assignments/submission-view";
import { getCurrentUser } from "@/lib/session";
import { getAssignmentResult, getSubmissionForAssignment } from "@/lib/assignments";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ publicId: string }>;
}): Promise<Metadata> {
  const { publicId } = await params;
  const result = await getAssignmentResult(publicId);
  return { title: result.status === "ok" ? result.data.title : "Assignment" };
}

export default async function MyAssignmentDetailPage({
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

  const result = await getAssignmentResult(publicId);
  if (result.status === "forbidden") {
    return (
      <div className="mx-auto max-w-5xl space-y-6 p-6">
        <p className="text-sm text-muted-foreground">You don&apos;t have access to this assignment.</p>
      </div>
    );
  }
  if (result.status === "not_found") notFound();
  const assignment = result.data;

  const submission = await getSubmissionForAssignment(publicId, studentId);

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-6">
      <div className="space-y-1">
        <h1 className="text-xl font-semibold">{assignment.title}</h1>
        <p className="text-sm text-muted-foreground">
          Due {assignment.due_date} · {assignment.max_score} marks
        </p>
      </div>

      {assignment.description && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Instructions</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm whitespace-pre-wrap">{assignment.description}</p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Your submission</CardTitle>
        </CardHeader>
        <CardContent>
          {submission ? (
            <SubmissionView submission={submission} maxScore={assignment.max_score} />
          ) : (
            <SubmissionForm assignmentId={publicId} studentId={studentId} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
