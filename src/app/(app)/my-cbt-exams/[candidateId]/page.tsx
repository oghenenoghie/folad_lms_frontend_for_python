import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getCurrentUser } from "@/lib/session";
import { getMyCandidate } from "@/lib/cbt";
import { StartExamButton } from "@/components/cbt/start-exam-button";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ candidateId: string }>;
}): Promise<Metadata> {
  const { candidateId } = await params;
  const candidate = await getMyCandidate(candidateId);
  return { title: candidate ? candidate.exam.name : "CBT Exam" };
}

export default async function MyCBTExamDetailPage({
  params,
}: {
  params: Promise<{ candidateId: string }>;
}) {
  const { candidateId } = await params;
  const user = await getCurrentUser();

  if (!user?.student_public_id) {
    return (
      <div className="mx-auto max-w-3xl space-y-6 p-6">
        <p className="text-sm text-muted-foreground">
          This page is for students — your account isn&apos;t linked to a student profile.
        </p>
      </div>
    );
  }

  const candidate = await getMyCandidate(candidateId);
  if (!candidate) notFound();

  const { exam, attempt } = candidate;
  const now = new Date();
  const windowOpen = now >= new Date(exam.start_at) && now <= new Date(exam.end_at);
  const alreadyFinished = attempt?.status === "submitted" || attempt?.status === "expired";
  const inProgress = attempt?.status === "in_progress";

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-6">
      <div className="space-y-1">
        <h1 className="text-xl font-semibold">{exam.name}</h1>
        <p className="text-sm text-muted-foreground">
          {exam.subject} · {exam.duration_minutes} minutes · {exam.total_marks} marks
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Exam window</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>
            Opens {new Date(exam.start_at).toLocaleString()} · Closes {new Date(exam.end_at).toLocaleString()}
          </p>
          {!candidate.is_eligible && (
            <Badge variant="outline">You are not currently marked eligible for this exam</Badge>
          )}
        </CardContent>
      </Card>

      {alreadyFinished ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Your result</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-2xl font-semibold">
              {attempt!.score} / {exam.total_marks}
              <span className="ml-2 text-base font-normal text-muted-foreground">
                ({attempt!.percentage}%)
              </span>
            </p>
            <Badge variant={attempt!.passed ? "default" : "destructive"}>
              {attempt!.passed ? "Passed" : "Not passed"}
              {attempt!.grade ? ` · Grade ${attempt!.grade}` : ""}
            </Badge>
            {attempt!.status === "expired" && (
              <p className="text-sm text-muted-foreground">
                Your time ran out and this attempt was submitted automatically.
              </p>
            )}
          </CardContent>
        </Card>
      ) : !candidate.is_eligible ? null : !windowOpen ? (
        <p className="text-sm text-muted-foreground">
          {now < new Date(exam.start_at) ? "This exam hasn't opened yet." : "This exam's window has closed."}
        </p>
      ) : (
        <StartExamButton candidateId={candidate.public_id} label={inProgress ? "Resume exam" : "Start exam"} />
      )}
    </div>
  );
}
