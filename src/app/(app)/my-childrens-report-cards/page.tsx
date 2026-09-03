import type { Metadata } from "next";
import { FileText, HeartHandshake } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { ReportCardSummaryCard } from "@/components/report-cards/report-card-summary-card";
import { getMySummary } from "@/lib/dashboard";
import { getPublishedReportCardsForStudent, getTermLabelMap } from "@/lib/report-cards";

export const metadata: Metadata = { title: "My Children's Report Cards" };

export default async function MyChildrensReportCardsPage() {
  const summary = await getMySummary();

  if (summary?.role !== "guardian") {
    return (
      <div className="mx-auto max-w-5xl space-y-6 p-6">
        <h1 className="text-xl font-semibold">My Children&apos;s Report Cards</h1>
        <p className="text-sm text-muted-foreground">
          This page is for guardians — your account isn&apos;t linked to a guardian profile.
        </p>
      </div>
    );
  }

  if (summary.children.length === 0) {
    return (
      <div className="mx-auto max-w-5xl space-y-6 p-6">
        <h1 className="text-xl font-semibold">My Children&apos;s Report Cards</h1>
        <Card>
          <CardContent className="flex flex-col items-center gap-2 py-16 text-center">
            <HeartHandshake className="h-8 w-8 text-muted-foreground" />
            <p className="font-medium">No children linked to your account yet</p>
            <p className="text-sm text-muted-foreground">
              Contact the school office to have your children linked to your account.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const termLabelById = await getTermLabelMap();
  const childrenReportCards = await Promise.all(
    summary.children.map(async (child) => ({
      child,
      reportCards: await getPublishedReportCardsForStudent(child.student),
    }))
  );

  return (
    <div className="mx-auto max-w-5xl space-y-8 p-6">
      <div>
        <h1 className="text-xl font-semibold">My Children&apos;s Report Cards</h1>
        <p className="text-sm text-muted-foreground">Published term report cards for each of your children.</p>
      </div>

      {childrenReportCards.map(({ child, reportCards }) => (
        <div key={child.student} className="space-y-4">
          <h2 className="text-lg font-medium">{child.name}</h2>

          {reportCards === null ? (
            <p className="text-sm text-muted-foreground">You don&apos;t have access to view this child&apos;s report cards.</p>
          ) : reportCards.length === 0 ? (
            <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed py-12 text-center">
              <FileText className="h-8 w-8 text-muted-foreground" />
              <p className="font-medium">No report cards yet</p>
              <p className="text-sm text-muted-foreground">
                The school hasn&apos;t published a report card for {child.name} yet.
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
      ))}
    </div>
  );
}
