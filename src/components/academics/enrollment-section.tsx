import { CalendarRange, Pencil, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { EnrollmentFormDialog } from "@/components/academics/enrollment-form-dialog";
import { DeleteConfirmButton } from "@/components/schools/delete-confirm-button";
import type { SelectOption } from "@/components/schools/entity-form-dialog";
import { getCampuses, getAcademicYears } from "@/lib/schools";
import { getClassLevels, getClassArms, getEnrollmentsForStudent, type ClassLevel } from "@/lib/academics";
import { createEnrollment, updateEnrollment, deleteEnrollment } from "@/lib/actions/academics";
import { enrollmentDefaults, enrollmentStatusLabel } from "@/lib/academics-forms";

const STATUS_VARIANT: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  active: "default",
  transferred: "outline",
  withdrawn: "destructive",
  completed: "secondary",
};

// Class arms aren't filterable by school server-side (only by class_level_id)
// — a school's own picker has to walk campus -> class level -> class arm
// itself, same composition pattern as the assessment-creation picker's
// getClassSubjectOptions() (src/app/(app)/assessments/page.tsx).
async function getClassArmOptionsForSchool(schoolId: string): Promise<SelectOption[]> {
  const campuses = await getCampuses(schoolId);
  if (!campuses) return [];

  const levelsByCampus = await Promise.all(campuses.map((campus) => getClassLevels(campus.public_id)));
  const levels = levelsByCampus.filter((ls): ls is ClassLevel[] => ls !== null).flat();

  const armsByLevel = await Promise.all(levels.map((level) => getClassArms(level.public_id)));
  const options: SelectOption[] = [];
  levels.forEach((level, index) => {
    for (const arm of armsByLevel[index] ?? []) {
      options.push({ value: arm.public_id, label: `${level.name} ${arm.name}` });
    }
  });
  return options;
}

export async function EnrollmentSection({ studentId, schoolId }: { studentId: string; schoolId: string }) {
  const enrollments = await getEnrollmentsForStudent(studentId);
  if (enrollments === null) return null;

  const [classArmOptions, academicYears] = await Promise.all([
    getClassArmOptionsForSchool(schoolId),
    getAcademicYears(schoolId),
  ]);
  const academicYearOptions: SelectOption[] = (academicYears ?? []).map((year) => ({
    value: year.public_id,
    label: year.name,
  }));
  const classArmNameById = new Map(classArmOptions.map((option) => [option.value, option.label]));
  const academicYearNameById = new Map(academicYearOptions.map((option) => [option.value, option.label]));

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Enrollment</CardTitle>
        {classArmOptions.length > 0 && academicYearOptions.length > 0 && (
          <EnrollmentFormDialog
            trigger={
              <Button size="sm" variant="secondary">
                <Plus className="h-4 w-4" />
                Enroll
              </Button>
            }
            title="Enroll in a class arm"
            defaultValues={enrollmentDefaults}
            classArmOptions={classArmOptions}
            academicYearOptions={academicYearOptions}
            action={createEnrollment.bind(null, studentId)}
          />
        )}
      </CardHeader>
      <CardContent>
        {enrollments.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-8 text-center">
            <CalendarRange className="h-6 w-6 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              {classArmOptions.length === 0
                ? "Set up class levels and arms for this school first, then enroll this student."
                : "Not enrolled in any class arm yet."}
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Academic year</TableHead>
                <TableHead>Class arm</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Effective</TableHead>
                <TableHead className="w-1" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {enrollments.map((enrollment) => (
                <TableRow key={enrollment.public_id}>
                  <TableCell>{academicYearNameById.get(enrollment.academic_year) ?? "—"}</TableCell>
                  <TableCell>{classArmNameById.get(enrollment.class_arm) ?? "—"}</TableCell>
                  <TableCell>
                    <Badge variant={STATUS_VARIANT[enrollment.status] ?? "secondary"}>
                      {enrollmentStatusLabel(enrollment.status)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {enrollment.effective_from} – {enrollment.effective_to ?? "ongoing"}
                  </TableCell>
                  <TableCell className="flex justify-end gap-1">
                    <EnrollmentFormDialog
                      trigger={
                        <Button variant="ghost" size="icon-sm">
                          <Pencil className="h-4 w-4" />
                        </Button>
                      }
                      title="Edit enrollment"
                      defaultValues={{
                        class_arm: enrollment.class_arm,
                        academic_year: enrollment.academic_year,
                        status: enrollment.status as "active" | "transferred" | "withdrawn" | "completed",
                        effective_from: enrollment.effective_from,
                        effective_to: enrollment.effective_to ?? "",
                      }}
                      classArmOptions={classArmOptions}
                      academicYearOptions={academicYearOptions}
                      action={updateEnrollment.bind(null, studentId, enrollment.public_id)}
                    />
                    <DeleteConfirmButton
                      description="Delete this enrollment record? This cannot be undone."
                      action={deleteEnrollment.bind(null, studentId, enrollment.public_id)}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
