import { Award, Pencil, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GradingSchemeFormDialog } from "@/components/examinations/grading-scheme-form-dialog";
import { GradeBandFormDialog } from "@/components/examinations/grade-band-form-dialog";
import { DeleteConfirmButton } from "@/components/schools/delete-confirm-button";
import { getGradingSchemes, getGradeBands, type GradingScheme, type GradeBand } from "@/lib/examinations";
import {
  createGradingScheme,
  updateGradingScheme,
  deleteGradingScheme,
  createGradeBand,
  updateGradeBand,
  deleteGradeBand,
} from "@/lib/actions/examinations";
import { gradingSchemeDefaults, gradeBandDefaults } from "@/lib/examinations-forms";

function BandRow({ schoolId, band }: { schoolId: string; band: GradeBand }) {
  return (
    <div className="flex items-center justify-between rounded-md bg-muted/50 px-3 py-1.5 text-sm">
      <span>
        <span className="font-medium">{band.grade}</span> · {band.min_score}–{band.max_score}
        {band.remark && <span className="text-muted-foreground"> · {band.remark}</span>}
      </span>
      <div className="flex items-center gap-1">
        <GradeBandFormDialog
          trigger={
            <Button variant="ghost" size="icon-sm">
              <Pencil className="h-3.5 w-3.5" />
            </Button>
          }
          title="Edit grade band"
          defaultValues={{
            grade: band.grade,
            min_score: band.min_score,
            max_score: band.max_score,
            remark: band.remark,
          }}
          action={updateGradeBand.bind(null, schoolId, band.public_id)}
        />
        <DeleteConfirmButton
          description={`Delete grade band ${band.grade}?`}
          action={deleteGradeBand.bind(null, schoolId, band.public_id)}
        />
      </div>
    </div>
  );
}

async function SchemeCard({ schoolId, scheme }: { schoolId: string; scheme: GradingScheme }) {
  const bands = await getGradeBands(scheme.public_id);

  return (
    <div className="rounded-lg border">
      <div className="flex items-center justify-between gap-3 border-b px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="font-medium">{scheme.name}</span>
          {scheme.is_default && <Badge>Default</Badge>}
        </div>
        <div className="flex items-center gap-1">
          <GradingSchemeFormDialog
            trigger={
              <Button variant="ghost" size="icon-sm">
                <Pencil className="h-4 w-4" />
              </Button>
            }
            title="Edit grading scheme"
            defaultValues={{ name: scheme.name, is_default: scheme.is_default }}
            action={updateGradingScheme.bind(null, schoolId, scheme.public_id)}
          />
          <DeleteConfirmButton
            description={`Delete grading scheme ${scheme.name}? This cannot be undone.`}
            action={deleteGradingScheme.bind(null, schoolId, scheme.public_id)}
          />
        </div>
      </div>

      {bands !== null && (
        <div className="px-4 py-3">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Grade bands
            </p>
            <GradeBandFormDialog
              trigger={
                <button type="button" className="text-xs font-medium text-primary hover:underline">
                  + Add grade band
                </button>
              }
              title="New grade band"
              defaultValues={gradeBandDefaults}
              action={createGradeBand.bind(null, schoolId, scheme.public_id)}
            />
          </div>
          {bands.length === 0 ? (
            <p className="text-sm text-muted-foreground">No grade bands yet.</p>
          ) : (
            <div className="space-y-1.5">
              {bands.map((band) => (
                <BandRow key={band.public_id} schoolId={schoolId} band={band} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// GradingScheme/GradeBand convert a raw score into a letter grade for
// report cards (apps.report_cards) — independent of the CA/CBT/Exam
// weighting split configured in ReportCardWeightingSection.
export async function GradingSchemesSection({ schoolId }: { schoolId: string }) {
  const schemes = await getGradingSchemes(schoolId);
  if (schemes === null) return null;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Grading schemes</CardTitle>
        <GradingSchemeFormDialog
          trigger={
            <Button size="sm" variant="secondary">
              <Plus className="h-4 w-4" />
              New grading scheme
            </Button>
          }
          title="New grading scheme"
          defaultValues={gradingSchemeDefaults}
          action={createGradingScheme.bind(null, schoolId)}
        />
      </CardHeader>
      <CardContent className="space-y-4">
        {schemes.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-8 text-center">
            <Award className="h-6 w-6 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              No grading schemes yet — results won&apos;t get a letter grade until a default scheme with
              grade bands is set up.
            </p>
          </div>
        ) : (
          schemes.map((scheme) => <SchemeCard key={scheme.public_id} schoolId={schoolId} scheme={scheme} />)
        )}
      </CardContent>
    </Card>
  );
}
