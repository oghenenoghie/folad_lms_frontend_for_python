import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ActivateButton } from "@/components/schools/activate-button";
import { ReportCardSummaryCard } from "@/components/report-cards/report-card-summary-card";
import { ReportCardCommentsDialog } from "@/components/report-cards/report-card-form-dialogs";
import { getReportCardResult, getTermLabelMap } from "@/lib/report-cards";
import { getStudents } from "@/lib/students";
import { getClassArms, getClassLevels } from "@/lib/academics";
import {
  regenerateReportCard,
  publishReportCard,
  unpublishReportCard,
  updateReportCardComments,
} from "@/lib/actions/report-cards";

async function getStudentName(studentId: string): Promise<string | null> {
  const students = await getStudents();
  const student = students?.find((s) => s.public_id === studentId);
  return student ? `${student.first_name} ${student.last_name}` : null;
}

async function getClassLabel(classArmId: string): Promise<string | null> {
  const [classArms, classLevels] = await Promise.all([getClassArms(), getClassLevels()]);
  const arm = classArms?.find((a) => a.public_id === classArmId);
  if (!arm) return null;
  const level = classLevels?.find((l) => l.public_id === arm.class_level);
  return `${level?.name ?? ""} ${arm.name}`.trim();
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ publicId: string }>;
}): Promise<Metadata> {
  const { publicId } = await params;
  const result = await getReportCardResult(publicId);
  return { title: result.status === "ok" ? `Report Card ${result.data.report_card_number}` : "Report Card" };
}

export default async function ReportCardDetailPage({
  params,
}: {
  params: Promise<{ publicId: string }>;
}) {
  const { publicId } = await params;
  const result = await getReportCardResult(publicId);
  if (result.status === "forbidden") {
    return (
      <div className="mx-auto max-w-4xl space-y-6 p-6">
        <p className="text-sm text-muted-foreground">You don&apos;t have access to this report card.</p>
      </div>
    );
  }
  if (result.status === "not_found") notFound();
  const reportCard = result.data;

  const [studentName, classLabel, termLabelById] = await Promise.all([
    getStudentName(reportCard.student),
    getClassLabel(reportCard.class_arm),
    getTermLabelMap(),
  ]);
  const termLabel = termLabelById.get(reportCard.term) ?? reportCard.term;

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">{studentName ?? reportCard.student}</h1>
          <p className="text-sm text-muted-foreground">
            {classLabel ?? "—"} · {termLabel}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <ActivateButton label="Regenerate" action={regenerateReportCard.bind(null, reportCard.public_id)} />
          {reportCard.status === "generated" && (
            <ActivateButton label="Publish" action={publishReportCard.bind(null, reportCard.public_id)} />
          )}
          {reportCard.status === "published" && (
            <ActivateButton label="Unpublish" action={unpublishReportCard.bind(null, reportCard.public_id)} />
          )}
          <ReportCardCommentsDialog
            trigger={
              <Button variant="secondary">
                <Pencil className="h-4 w-4" />
                Edit comments
              </Button>
            }
            title="Edit comments"
            defaultValues={{
              teacher_comment: reportCard.teacher_comment,
              principal_comment: reportCard.principal_comment,
              next_term_begins: reportCard.next_term_begins ?? "",
            }}
            action={updateReportCardComments.bind(null, reportCard.public_id)}
          />
        </div>
      </div>

      <ReportCardSummaryCard reportCard={reportCard} termLabel={termLabel} />
    </div>
  );
}
