import { z } from "zod";
import type { FieldConfig, SelectOption } from "@/components/schools/entity-form-dialog";

export const classLevelSchema = z.object({
  name: z.string().min(1, "Name is required"),
  sequence: z.coerce.number().int().min(1, "Sequence must be at least 1"),
  is_active: z.boolean(),
});
export type ClassLevelFormValues = z.infer<typeof classLevelSchema>;
export const classLevelFields: FieldConfig<ClassLevelFormValues>[] = [
  { name: "name", label: "Name", type: "text" },
  { name: "sequence", label: "Sequence (order in the school ladder)", type: "number" },
  { name: "is_active", label: "Active", type: "checkbox" },
];
export const classLevelDefaults: ClassLevelFormValues = { name: "", sequence: 1, is_active: true };

export const classArmSchema = z.object({
  name: z.string().min(1, "Name is required"),
  is_active: z.boolean(),
});
export type ClassArmFormValues = z.infer<typeof classArmSchema>;
export const classArmFields: FieldConfig<ClassArmFormValues>[] = [
  { name: "name", label: "Name (e.g. A, Blue, Diamond)", type: "text" },
  { name: "is_active", label: "Active", type: "checkbox" },
];
export const classArmDefaults: ClassArmFormValues = { name: "", is_active: true };

export const subjectSchema = z.object({
  name: z.string().min(1, "Name is required"),
  code: z.string().optional(),
  is_active: z.boolean(),
});
export type SubjectFormValues = z.infer<typeof subjectSchema>;
export const subjectFields: FieldConfig<SubjectFormValues>[] = [
  { name: "name", label: "Name", type: "text" },
  { name: "code", label: "Code (leave blank to auto-generate)", type: "text" },
  { name: "is_active", label: "Active", type: "checkbox" },
];
export const subjectDefaults: SubjectFormValues = { name: "", code: "", is_active: true };

export const enrollmentStatusOptions: SelectOption[] = [
  { value: "active", label: "Active" },
  { value: "transferred", label: "Transferred" },
  { value: "withdrawn", label: "Withdrawn" },
  { value: "completed", label: "Completed" },
];

export function enrollmentStatusLabel(status: string): string {
  return enrollmentStatusOptions.find((option) => option.value === status)?.label ?? status;
}

export const enrollmentSchema = z.object({
  class_arm: z.string().min(1, "Class arm is required"),
  academic_year: z.string().min(1, "Academic year is required"),
  status: z.enum(["active", "transferred", "withdrawn", "completed"]),
  effective_from: z.string().min(1, "Effective-from date is required"),
  effective_to: z.string().optional(),
});
export type EnrollmentFormValues = z.infer<typeof enrollmentSchema>;

export function enrollmentFields(
  classArmOptions: SelectOption[],
  academicYearOptions: SelectOption[]
): FieldConfig<EnrollmentFormValues>[] {
  return [
    { name: "academic_year", label: "Academic year", type: "select", options: academicYearOptions, placeholder: "Select an academic year" },
    { name: "class_arm", label: "Class arm", type: "select", options: classArmOptions, placeholder: "Select a class arm" },
    { name: "status", label: "Status", type: "select", options: enrollmentStatusOptions },
    { name: "effective_from", label: "Effective from", type: "date" },
    { name: "effective_to", label: "Effective to (leave blank if ongoing)", type: "date" },
  ];
}

export const enrollmentDefaults: EnrollmentFormValues = {
  class_arm: "",
  academic_year: "",
  status: "active",
  effective_from: "",
  effective_to: "",
};
