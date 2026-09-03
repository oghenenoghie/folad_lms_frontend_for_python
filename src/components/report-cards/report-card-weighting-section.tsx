import { Pencil, Scale } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ReportCardWeightingDialog } from "@/components/report-cards/report-card-form-dialogs";
import { getReportCardWeighting } from "@/lib/report-cards";
import { createReportCardWeighting, updateReportCardWeighting } from "@/lib/actions/report-cards";
import { reportCardWeightingDefaults } from "@/lib/report-cards-forms";

// Per-school config for apps.report_cards.services.report_card_service's
// CA/CBT/Exam consolidation — one record per school, created on first
// save rather than pre-seeded, so "not found" here means "not configured
// yet" (falls back to the same 30/30/40 default the backend itself uses
// via get_or_create_weighting), not "forbidden" — getReportCardWeighting
// can't distinguish the two, but a 403 on this list is rare enough
// (whoever can reach the school detail page can almost always see this
// too) that showing "not configured" instead of hiding the section
// entirely is an acceptable trade rather than plumbing a third state.
export async function ReportCardWeightingSection({ schoolId }: { schoolId: string }) {
  const weighting = await getReportCardWeighting(schoolId);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Report card weighting</CardTitle>
        {weighting ? (
          <ReportCardWeightingDialog
            trigger={
              <Button variant="ghost" size="icon-sm">
                <Pencil className="h-4 w-4" />
              </Button>
            }
            title="Edit report card weighting"
            defaultValues={{
              ca_weight: weighting.ca_weight,
              cbt_weight: weighting.cbt_weight,
              exam_weight: weighting.exam_weight,
            }}
            action={updateReportCardWeighting.bind(null, schoolId, weighting.public_id)}
          />
        ) : (
          <ReportCardWeightingDialog
            trigger={
              <Button size="sm" variant="secondary">
                Configure
              </Button>
            }
            title="Configure report card weighting"
            defaultValues={reportCardWeightingDefaults}
            action={createReportCardWeighting.bind(null, schoolId)}
          />
        )}
      </CardHeader>
      <CardContent>
        {!weighting ? (
          <div className="flex flex-col items-center gap-2 py-8 text-center">
            <Scale className="h-6 w-6 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Not configured yet — report cards use the default 30 / 30 / 40 split until set.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-3 text-sm">
            <div>
              <p className="text-muted-foreground">Continuous Assessment</p>
              <p className="font-medium">{weighting.ca_weight}%</p>
            </div>
            <div>
              <p className="text-muted-foreground">CBT</p>
              <p className="font-medium">{weighting.cbt_weight}%</p>
            </div>
            <div>
              <p className="text-muted-foreground">Examination</p>
              <p className="font-medium">{weighting.exam_weight}%</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
