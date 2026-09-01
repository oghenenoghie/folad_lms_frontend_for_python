import { z } from "zod";
import type { FieldConfig, SelectOption } from "@/components/schools/entity-form-dialog";

export const genderOptions: SelectOption[] = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "other", label: "Other" },
];

export const enrollmentStatusOptions: SelectOption[] = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
  { value: "graduated", label: "Graduated" },
  { value: "withdrawn", label: "Withdrawn" },
  { value: "suspended", label: "Suspended" },
];

export function enrollmentStatusLabel(status: string): string {
  return enrollmentStatusOptions.find((option) => option.value === status)?.label ?? status;
}

export function genderLabel(gender: string): string {
  return genderOptions.find((option) => option.value === gender)?.label ?? "Not specified";
}

// Gender is optional server-side (blank=True, default="") — Radix
// Select.Item rejects an empty-string value, so "not specified" needs a
// real sentinel translated back to "" in lib/actions/students.ts, same
// pattern as staff-forms.ts's NO_DEPARTMENT.
export const NO_GENDER = "__unspecified__";

// `school` is set once at creation and is immutable afterwards (the
// backend drops it on update), so create and edit use distinct
// schemas/field sets — same split as staff-forms.ts.
export const studentCreateSchema = z.object({
  school: z.string().min(1, "School is required"),
  admission_number: z.string().optional(),
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  email: z.string().optional(),
  date_of_birth: z.string().min(1, "Date of birth is required"),
  gender: z.string(),
  enrollment_status: z.enum(["active", "inactive", "graduated", "withdrawn", "suspended"]),
});
export type StudentCreateFormValues = z.infer<typeof studentCreateSchema>;

export function studentCreateFields(schoolOptions: SelectOption[]): FieldConfig<StudentCreateFormValues>[] {
  return [
    { name: "school", label: "School", type: "select", options: schoolOptions, placeholder: "Select a school" },
    { name: "first_name", label: "First name", type: "text" },
    { name: "last_name", label: "Last name", type: "text" },
    {
      name: "admission_number",
      label: "Admission number (leave blank to auto-generate)",
      type: "text",
    },
    { name: "email", label: "Email (leave blank to auto-provision a login)", type: "email" },
    { name: "date_of_birth", label: "Date of birth", type: "date" },
    { name: "gender", label: "Gender", type: "select", options: [{ value: NO_GENDER, label: "Not specified" }, ...genderOptions] },
    { name: "enrollment_status", label: "Enrollment status", type: "select", options: enrollmentStatusOptions },
  ];
}

export const studentCreateDefaults: StudentCreateFormValues = {
  school: "",
  admission_number: "",
  first_name: "",
  last_name: "",
  email: "",
  date_of_birth: "",
  gender: NO_GENDER,
  enrollment_status: "active",
};

export const studentEditSchema = z.object({
  admission_number: z.string().min(1, "Admission number is required"),
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  email: z.string().optional(),
  date_of_birth: z.string().min(1, "Date of birth is required"),
  gender: z.string(),
  enrollment_status: z.enum(["active", "inactive", "graduated", "withdrawn", "suspended"]),
});
export type StudentEditFormValues = z.infer<typeof studentEditSchema>;

export const studentEditFields: FieldConfig<StudentEditFormValues>[] = [
  { name: "first_name", label: "First name", type: "text" },
  { name: "last_name", label: "Last name", type: "text" },
  { name: "admission_number", label: "Admission number", type: "text" },
  { name: "email", label: "Email", type: "email" },
  { name: "date_of_birth", label: "Date of birth", type: "date" },
  { name: "gender", label: "Gender", type: "select", options: [{ value: NO_GENDER, label: "Not specified" }, ...genderOptions] },
  { name: "enrollment_status", label: "Enrollment status", type: "select", options: enrollmentStatusOptions },
];
