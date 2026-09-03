import type { Metadata } from "next";
import { FileText } from "lucide-react";
import { ReportCardSummaryCard } from "@/components/report-cards/report-card-summary-card";
import { getCurrentUser } from "@/lib/session";
import { getPublishedReportCardsForStudent, getTermLabelMap } from "@/lib/report-cards";

export const metadata: Metadata = { title: "My Report Cards" };

export default async function MyReportCardsPage() {
  const user = await getCurrentUser();
  const studentId = user?.student_public_id;

  if (!studentId) {
    return (
      <div className="mx-auto max-w-5xl space-y-6 p-6">
        <h1 className="text-xl font-semibold">My Report Cards</h1>
        <p className="text-sm text-muted-foreground">
          This page is for students — your account isn&apos;t linked to a student profile.
        </p>
      </div>
    );
  }

  const [reportCards, termLabelById] = await Promise.all([
    getPublishedReportCardsForStudent(studentId),
    getTermLabelMap(),
  ]);

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-6">
      <div>
        <h1 className="text-xl font-semibold">My Report Cards</h1>
        <p className="text-sm text-muted-foreground">Your published term report cards.</p>
      </div>

      {reportCards === null ? (
        <p className="text-sm text-muted-foreground">You don&apos;t have access to view report cards.</p>
      ) : reportCards.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed py-16 text-center">
          <FileText className="h-8 w-8 text-muted-foreground" />
          <p className="font-medium">No report cards yet</p>
          <p className="text-sm text-muted-foreground">
            Your school hasn&apos;t published a report card for you yet.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {reportCards.map((reportCard) => (
            <ReportCardSummaryCard
              key={reportCard.public_id}
              reportCard={reportCard}
              termLabel={termLabelById.get(reportCard.term) ?? reportCard.term}
            />
          ))}
        </div>
      )}
    </div>
  );
}
