import type { Metadata } from "next";
import Link from "next/link";
import { ClipboardList } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getCurrentUser } from "@/lib/session";
import { getEnrollmentsForStudent, getClassSubjects } from "@/lib/academics";
import { getAssignments, getSubmissionsForStudent, type Assignment } from "@/lib/assignments";
import { SUBMISSION_STATUS_LABELS } from "@/lib/assignments-types";

export const metadata: Metadata = { title: "My Assignments" };

async function getMyAssignments(studentId: string): Promise<Assignment[] | null> {
  const enrollments = await getEnrollmentsForStudent(studentId);
  if (!enrollments) return null;

  const activeClassArms = [...new Set(enrollments.filter((e) => e.status === "active").map((e) => e.class_arm))];
  const classSubjectLists = await Promise.all(activeClassArms.map((id) => getClassSubjects(id)));
  const classSubjectIds = [...new Set(classSubjectLists.flatMap((list) => list ?? []).map((cs) => cs.public_id))];

  const assignmentLists = await Promise.all(classSubjectIds.map((id) => getAssignments(id)));
  const byId = new Map<string, Assignment>();
  for (const assignment of assignmentLists.flatMap((list) => list ?? [])) {
    byId.set(assignment.public_id, assignment);
  }
  return [...byId.values()].sort((a, b) => a.due_date.localeCompare(b.due_date));
}

export default async function MyAssignmentsPage() {
  const user = await getCurrentUser();
  const studentId = user?.student_public_id;

  if (!studentId) {
    return (
      <div className="mx-auto max-w-5xl space-y-6 p-6">
        <h1 className="text-xl font-semibold">My Assignments</h1>
        <p className="text-sm text-muted-foreground">
          This page is for students — your account isn&apos;t linked to a student profile.
        </p>
      </div>
    );
  }

  const [assignments, submissions] = await Promise.all([
    getMyAssignments(studentId),
    getSubmissionsForStudent(studentId),
  ]);
  const submissionByAssignment = new Map((submissions ?? []).map((s) => [s.assignment, s]));

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-6">
      <div>
        <h1 className="text-xl font-semibold">My Assignments</h1>
        <p className="text-sm text-muted-foreground">Homework and projects for your enrolled classes.</p>
      </div>

      {assignments === null ? (
        <p className="text-sm text-muted-foreground">You don&apos;t have access to view your assignments.</p>
      ) : assignments.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed py-16 text-center">
          <ClipboardList className="h-8 w-8 text-muted-foreground" />
          <p className="font-medium">No assignments yet</p>
          <p className="text-sm text-muted-foreground">
            Nothing has been set for your classes yet — check back later.
          </p>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Due date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Score</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {assignments.map((assignment) => {
              const submission = submissionByAssignment.get(assignment.public_id);
              const overdue = !submission && assignment.due_date < new Date().toISOString().slice(0, 10);
              return (
                <TableRow key={assignment.public_id}>
                  <TableCell>
                    <Link
                      href={`/my-assignments/${assignment.public_id}`}
                      className="font-medium text-primary hover:underline"
                    >
                      {assignment.title}
                    </Link>
                  </TableCell>
                  <TableCell>{assignment.due_date}</TableCell>
                  <TableCell>
                    {submission ? (
                      <Badge variant={submission.status === "late" ? "secondary" : "default"}>
                        {SUBMISSION_STATUS_LABELS[submission.status]}
                      </Badge>
                    ) : (
                      <Badge variant={overdue ? "destructive" : "outline"}>
                        {overdue ? "Overdue" : "Not submitted"}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {submission?.score !== null && submission?.score !== undefined
                      ? `${submission.score} / ${assignment.max_score}`
                      : "—"}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
