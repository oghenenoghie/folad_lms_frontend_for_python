import { GraduationCap, Pencil, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ClassLevelFormDialog } from "@/components/academics/class-level-form-dialog";
import { ClassArmFormDialog } from "@/components/academics/class-arm-form-dialog";
import { DeleteConfirmButton } from "@/components/schools/delete-confirm-button";
import { getCampuses } from "@/lib/schools";
import { getClassLevels, getClassArms, type ClassLevel, type ClassArm } from "@/lib/academics";
import {
  createClassLevel,
  updateClassLevel,
  deleteClassLevel,
  createClassArm,
  updateClassArm,
  deleteClassArm,
} from "@/lib/actions/academics";
import { classLevelDefaults, classArmDefaults } from "@/lib/academics-forms";

function ArmRow({ schoolId, arm }: { schoolId: string; arm: ClassArm }) {
  return (
    <div className="flex items-center justify-between rounded-md bg-muted/50 px-3 py-1.5 text-sm">
      <span>
        {arm.name}
        {!arm.is_active && <span className="text-muted-foreground"> · Inactive</span>}
      </span>
      <div className="flex items-center gap-1">
        <ClassArmFormDialog
          trigger={
            <Button variant="ghost" size="icon-sm">
              <Pencil className="h-3.5 w-3.5" />
            </Button>
          }
          title="Edit class arm"
          defaultValues={{ name: arm.name, is_active: arm.is_active }}
          action={updateClassArm.bind(null, schoolId, arm.public_id)}
        />
        <DeleteConfirmButton
          description={`Delete class arm ${arm.name}?`}
          action={deleteClassArm.bind(null, schoolId, arm.public_id)}
        />
      </div>
    </div>
  );
}

async function LevelCard({ schoolId, level }: { schoolId: string; level: ClassLevel }) {
  const arms = await getClassArms(level.public_id);

  return (
    <div className="rounded-lg border">
      <div className="flex items-center justify-between gap-3 border-b px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="font-medium">{level.name}</span>
          {!level.is_active && <Badge variant="secondary">Inactive</Badge>}
        </div>
        <div className="flex items-center gap-1">
          <ClassLevelFormDialog
            trigger={
              <Button variant="ghost" size="icon-sm">
                <Pencil className="h-4 w-4" />
              </Button>
            }
            title="Edit class level"
            defaultValues={{ name: level.name, sequence: level.sequence, is_active: level.is_active }}
            action={updateClassLevel.bind(null, schoolId, level.public_id)}
          />
          <DeleteConfirmButton
            description={`Delete class level ${level.name}? This cannot be undone.`}
            action={deleteClassLevel.bind(null, schoolId, level.public_id)}
          />
        </div>
      </div>

      {arms !== null && (
        <div className="px-4 py-3">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Class arms</p>
            <ClassArmFormDialog
              trigger={
                <button type="button" className="text-xs font-medium text-primary hover:underline">
                  + Add class arm
                </button>
              }
              title="New class arm"
              defaultValues={classArmDefaults}
              action={createClassArm.bind(null, schoolId, level.public_id)}
            />
          </div>
          {arms.length === 0 ? (
            <p className="text-sm text-muted-foreground">No class arms yet.</p>
          ) : (
            <div className="space-y-1.5">
              {arms.map((arm) => (
                <ArmRow key={arm.public_id} schoolId={schoolId} arm={arm} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export async function ClassLevelsSection({ schoolId }: { schoolId: string }) {
  const campuses = await getCampuses(schoolId);
  if (campuses === null) return null;

  // One campus is the overwhelming common case, but a school can have
  // several — class levels are scoped per campus (a class ladder is a
  // campus concern, e.g. a primary campus vs. a secondary campus), so
  // each gets its own "New class level" action rather than one flat list.
  const levelsByCampus = await Promise.all(
    campuses.map(async (campus) => ({ campus, levels: await getClassLevels(campus.public_id) }))
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Class levels &amp; arms</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {campuses.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-8 text-center">
            <GraduationCap className="h-6 w-6 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Add a campus first, then set up its class levels.</p>
          </div>
        ) : (
          levelsByCampus.map(({ campus, levels }) => (
            <div key={campus.public_id} className="space-y-3">
              <div className="flex items-center justify-between">
                {campuses.length > 1 ? (
                  <p className="text-sm font-semibold text-muted-foreground">{campus.name}</p>
                ) : (
                  <span />
                )}
                <ClassLevelFormDialog
                  trigger={
                    <Button size="sm" variant="secondary">
                      <Plus className="h-4 w-4" />
                      New class level
                    </Button>
                  }
                  title={`New class level (${campus.name})`}
                  defaultValues={classLevelDefaults}
                  action={createClassLevel.bind(null, schoolId, campus.public_id)}
                />
              </div>
              {levels === null || levels.length === 0 ? (
                <p className="text-sm text-muted-foreground">No class levels yet for this campus.</p>
              ) : (
                <div className="space-y-4">
                  {levels.map((level) => (
                    <LevelCard key={level.public_id} schoolId={schoolId} level={level} />
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
