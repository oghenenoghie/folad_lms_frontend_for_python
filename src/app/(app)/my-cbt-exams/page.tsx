import type { Metadata } from "next";
import Link from "next/link";
import { ClipboardList } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getCurrentUser } from "@/lib/session";
import { getMyCandidates } from "@/lib/cbt";

export const metadata: Metadata = { title: "My CBT Exams" };

function statusBadge(candidate: NonNullable<Awaited<ReturnType<typeof getMyCandidates>>>[number]) {
  const attempt = candidate.attempt;
  if (attempt?.status === "submitted" || attempt?.status === "expired") {
    return <Badge>{attempt.passed ? "Passed" : "Completed"}</Badge>;
  }
  if (attempt?.status === "in_progress") return <Badge variant="secondary">In progress</Badge>;
  if (candidate.exam.status !== "published") return <Badge variant="outline">Not open yet</Badge>;
  if (!candidate.is_eligible) return <Badge variant="outline">Not eligible</Badge>;
  return <Badge variant="outline">Not started</Badge>;
}

export default async function MyCBTExamsPage() {
  const user = await getCurrentUser();
  const studentId = user?.student_public_id;

  if (!studentId) {
    return (
      <div className="mx-auto max-w-5xl space-y-6 p-6">
        <h1 className="text-xl font-semibold">My CBT Exams</h1>
        <p className="text-sm text-muted-foreground">
          This page is for students — your account isn&apos;t linked to a student profile.
        </p>
      </div>
    );
  }

  const candidates = await getMyCandidates();

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-6">
      <div>
        <h1 className="text-xl font-semibold">My CBT Exams</h1>
        <p className="text-sm text-muted-foreground">Computer-based exams you&apos;ve been registered for.</p>
      </div>

      {candidates === null ? (
        <p className="text-sm text-muted-foreground">You don&apos;t have access to view your CBT exams.</p>
      ) : candidates.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed py-16 text-center">
          <ClipboardList className="h-8 w-8 text-muted-foreground" />
          <p className="font-medium">No CBT exams yet</p>
          <p className="text-sm text-muted-foreground">
            You haven&apos;t been registered for any computer-based exams yet — check back later.
          </p>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Exam</TableHead>
              <TableHead>Subject</TableHead>
              <TableHead>Window</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {candidates.map((candidate) => (
              <TableRow key={candidate.public_id}>
                <TableCell>
                  <Link
                    href={`/my-cbt-exams/${candidate.public_id}`}
                    className="font-medium text-primary hover:underline"
                  >
                    {candidate.exam.name}
                  </Link>
                </TableCell>
                <TableCell>{candidate.exam.subject}</TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {new Date(candidate.exam.start_at).toLocaleString()} –{" "}
                  {new Date(candidate.exam.end_at).toLocaleString()}
                </TableCell>
                <TableCell>{candidate.exam.duration_minutes} min</TableCell>
                <TableCell>{statusBadge(candidate)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
