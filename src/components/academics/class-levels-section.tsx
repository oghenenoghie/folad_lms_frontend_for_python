import { GraduationCap, Pencil, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ClassLevelFormDialog } from "@/components/academics/class-level-form-dialog";
import { ClassArmFormDialog } from "@/components/academics/class-arm-form-dialog";
import {
  ClassSubjectFormDialog,
  ClassSubjectAssignmentFormDialog,
} from "@/components/academics/class-subject-form-dialogs";
import { DeleteConfirmButton } from "@/components/schools/delete-confirm-button";
import type { SelectOption } from "@/components/schools/entity-form-dialog";
import { getCampuses } from "@/lib/schools";
import {
  getClassLevels,
  getClassArms,
  getSubjects,
  getClassSubjects,
  type ClassLevel,
  type ClassArm,
} from "@/lib/academics";
import { getStaffList, getTeachers } from "@/lib/staff";
import {
  createClassLevel,
  updateClassLevel,
  deleteClassLevel,
  createClassArm,
  updateClassArm,
  deleteClassArm,
  createClassSubject,
  updateClassSubjectAssignment,
  deleteClassSubject,
} from "@/lib/actions/academics";
import { classLevelDefaults, classArmDefaults, classSubjectDefaults } from "@/lib/academics-forms";

async function ArmRow({
  schoolId,
  arm,
  subjectOptions,
  teacherOptions,
}: {
  schoolId: string;
  arm: ClassArm;
  subjectOptions: SelectOption[];
  teacherOptions: SelectOption[];
}) {
  const classSubjects = await getClassSubjects(arm.public_id);
  const subjectNameById = new Map(subjectOptions.map((o) => [o.value, o.label]));
  const teacherNameById = new Map(teacherOptions.map((o) => [o.value, o.label]));

  return (
    <div className="rounded-md bg-muted/50 px-3 py-1.5 text-sm">
      <div className="flex items-center justify-between">
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

      {classSubjects !== null && (
        <div className="mt-1.5 space-y-1 border-t border-border/60 pt-1.5">
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">Subjects taught</p>
            {subjectOptions.length > 0 && teacherOptions.length > 0 && (
              <ClassSubjectFormDialog
                trigger={
                  <button type="button" className="text-xs font-medium text-primary hover:underline">
                    + Assign subject
                  </button>
                }
                title={`Assign a subject (${arm.name})`}
                defaultValues={classSubjectDefaults}
                subjectOptions={subjectOptions}
                teacherOptions={teacherOptions}
                action={createClassSubject.bind(null, schoolId, arm.public_id)}
              />
            )}
          </div>
          {classSubjects.length === 0 ? (
            <p className="text-xs text-muted-foreground">
              {subjectOptions.length === 0
                ? "Add a subject to this school first."
                : "No subjects assigned yet."}
            </p>
          ) : (
            classSubjects.map((classSubject) => (
              <div key={classSubject.public_id} className="flex items-center justify-between pl-2 text-xs">
                <span>
                  {subjectNameById.get(classSubject.subject) ?? "Unknown subject"}
                  {" — "}
                  {teacherNameById.get(classSubject.teacher) ?? "Unknown teacher"}
                  {!classSubject.is_active && <span className="text-muted-foreground"> · Inactive</span>}
                </span>
                <div className="flex items-center gap-1">
                  <ClassSubjectAssignmentFormDialog
                    trigger={
                      <Button variant="ghost" size="icon-sm">
                        <Pencil className="h-3 w-3" />
                      </Button>
                    }
                    title="Edit assignment"
                    defaultValues={{ teacher: classSubject.teacher, is_active: classSubject.is_active }}
                    teacherOptions={teacherOptions}
                    action={updateClassSubjectAssignment.bind(null, schoolId, classSubject.public_id)}
                  />
                  <DeleteConfirmButton
                    description="Remove this subject assignment?"
                    action={deleteClassSubject.bind(null, schoolId, classSubject.public_id)}
                  />
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

async function LevelCard({
  schoolId,
  level,
  subjectOptions,
  teacherOptions,
}: {
  schoolId: string;
  level: ClassLevel;
  subjectOptions: SelectOption[];
  teacherOptions: SelectOption[];
}) {
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
                <ArmRow
                  key={arm.public_id}
                  schoolId={schoolId}
                  arm={arm}
                  subjectOptions={subjectOptions}
                  teacherOptions={teacherOptions}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export async function ClassLevelsSection({ schoolId }: { schoolId: string }) {
  const [campuses, subjects, teachers, staff] = await Promise.all([
    getCampuses(schoolId),
    getSubjects(schoolId),
    getTeachers(schoolId),
    getStaffList(schoolId),
  ]);
  if (campuses === null) return null;

  const subjectOptions: SelectOption[] = (subjects ?? []).map((s) => ({ value: s.public_id, label: s.name }));
  // Teacher has no name of its own — it's a profile on Staff (see
  // lib/staff.ts) — so the picker label comes from the linked staff record.
  const staffNameById = new Map((staff ?? []).map((s) => [s.public_id, `${s.first_name} ${s.last_name}`]));
  const teacherOptions: SelectOption[] = (teachers ?? []).map((t) => ({
    value: t.public_id,
    label: staffNameById.get(t.staff) ?? "Unknown teacher",
  }));

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
                    <LevelCard
                      key={level.public_id}
                      schoolId={schoolId}
                      level={level}
                      subjectOptions={subjectOptions}
                      teacherOptions={teacherOptions}
                    />
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
