import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Pencil } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DeleteConfirmButton } from "@/components/schools/delete-confirm-button";
import { AssignmentEditFormDialog } from "@/components/assignments/assignment-form-dialog";
import { GradeSubmissionFormDialog } from "@/components/assignments/grade-submission-form-dialog";
import {
  getAssignmentResult,
  getSubmissionsForAssignment,
  SUBMISSION_STATUS_LABELS,
} from "@/lib/assignments";
import { getStudents } from "@/lib/students";
import { updateAssignment, deleteAssignment, gradeSubmission } from "@/lib/actions/assignments";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ publicId: string }>;
}): Promise<Metadata> {
  const { publicId } = await params;
  const result = await getAssignmentResult(publicId);
  return { title: result.status === "ok" ? result.data.title : "Assignment" };
}

const STATUS_VARIANT: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  submitted: "secondary",
  late: "outline",
  graded: "default",
};

export default async function AssignmentDetailPage({
  params,
}: {
  params: Promise<{ publicId: string }>;
}) {
  const { publicId } = await params;
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

  const [submissions, students] = await Promise.all([
    getSubmissionsForAssignment(publicId),
    getStudents(),
  ]);
  const studentNameById = new Map(
    (students ?? []).map((student) => [student.public_id, `${student.first_name} ${student.last_name}`])
  );

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-6">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <h1 className="text-xl font-semibold">{assignment.title}</h1>
          <p className="text-sm text-muted-foreground">
            Due {assignment.due_date} · {assignment.max_score} marks
          </p>
          {assignment.description && <p className="text-sm">{assignment.description}</p>}
        </div>
        <div className="flex items-center gap-2">
          <AssignmentEditFormDialog
            trigger={
              <Button variant="secondary">
                <Pencil className="h-4 w-4" />
                Edit
              </Button>
            }
            title="Edit assignment"
            defaultValues={{
              title: assignment.title,
              description: assignment.description,
              due_date: assignment.due_date,
              max_score: assignment.max_score,
            }}
            action={updateAssignment.bind(null, assignment.public_id)}
          />
          <DeleteConfirmButton
            description={`Delete ${assignment.title}? Any student submissions on it go with it.`}
            action={deleteAssignment.bind(null, assignment.public_id)}
          />
        </div>
      </div>

      <div className="space-y-3 rounded-lg border p-4">
        <h2 className="font-medium">Submissions</h2>
        {submissions === null || submissions.length === 0 ? (
          <p className="text-sm text-muted-foreground">No submissions yet.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Submitted</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Score</TableHead>
                <TableHead className="w-1" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {submissions.map((submission) => (
                <TableRow key={submission.public_id}>
                  <TableCell>
                    {studentNameById.get(submission.student) ?? "Unknown student"}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {submission.submitted_at}
                  </TableCell>
                  <TableCell>
                    <Badge variant={STATUS_VARIANT[submission.status] ?? "secondary"}>
                      {SUBMISSION_STATUS_LABELS[submission.status]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {submission.score !== null ? `${submission.score} / ${assignment.max_score}` : "—"}
                  </TableCell>
                  <TableCell className="text-right">
                    <GradeSubmissionFormDialog
                      trigger={
                        <Button variant="ghost" size="sm">
                          {submission.status === "graded" ? "Re-grade" : "Grade"}
                        </Button>
                      }
                      title={`Grade ${studentNameById.get(submission.student) ?? "submission"}`}
                      defaultValues={{
                        score: submission.score ?? "",
                        feedback: submission.feedback,
                      }}
                      action={gradeSubmission.bind(null, assignment.public_id, submission.public_id)}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}
