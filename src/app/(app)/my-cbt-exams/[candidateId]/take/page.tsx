import type { Metadata } from "next";
import { getCurrentUser } from "@/lib/session";
import { ExamRunner } from "@/components/cbt/exam-runner";

export const metadata: Metadata = { title: "Taking exam" };

// A thin wrapper: starting/resuming the attempt is a mutation
// (authorizedDjangoFetch, which can refresh the access token and needs
// to write the refreshed cookie), so it has to happen from a Server
// Action, not this Server Component's render — ExamRunner triggers it
// client-side on mount instead.
export default async function TakeCBTExamPage({
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

  return <ExamRunner candidateId={candidateId} />;
}
