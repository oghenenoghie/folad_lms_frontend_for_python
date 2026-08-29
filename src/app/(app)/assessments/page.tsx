import type { Metadata } from "next";
import Link from "next/link";
import { ClipboardList } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getAssessments } from "@/lib/examinations";

export const metadata: Metadata = { title: "Assessments" };

const ASSESSMENT_TYPE_LABELS: Record<string, string> = {
  test: "Test",
  quiz: "Quiz",
  assignment: "Assignment",
  project: "Project",
  practical: "Practical",
  exam: "Exam",
};

export default async function AssessmentsPage() {
  const assessments = await getAssessments();

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-6">
      <div>
        <h1 className="text-xl font-semibold">Assessments</h1>
        <p className="text-sm text-muted-foreground">
          Manage each assessment&apos;s question bank and grade student answers.
        </p>
      </div>

      {assessments === null ? (
        <p className="text-sm text-muted-foreground">You don&apos;t have access to assessments.</p>
      ) : assessments.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed py-16 text-center">
          <ClipboardList className="h-8 w-8 text-muted-foreground" />
          <p className="font-medium">No assessments yet</p>
          <p className="text-sm text-muted-foreground">
            Assessments are created elsewhere (e.g. the API or admin) — once one exists, it shows up here.
          </p>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Weight</TableHead>
              <TableHead>Max score</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {assessments.map((assessment) => (
              <TableRow key={assessment.public_id}>
                <TableCell>
                  <Link
                    href={`/assessments/${assessment.public_id}`}
                    className="font-medium text-primary hover:underline"
                  >
                    {assessment.name}
                  </Link>
                </TableCell>
                <TableCell>
                  <Badge variant="secondary">
                    {ASSESSMENT_TYPE_LABELS[assessment.assessment_type] ?? assessment.assessment_type}
                  </Badge>
                </TableCell>
                <TableCell>{assessment.weight}</TableCell>
                <TableCell>{assessment.max_score}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
