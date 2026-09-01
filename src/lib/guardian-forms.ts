import { z } from "zod";
import type { FieldConfig, SelectOption } from "@/components/schools/entity-form-dialog";

// Guardian has no field that's immutable after creation (unlike Staff's
// `school`/Student's `school`), so — same as the Schools module's own
// entities — create and edit share one schema/field-config pair.
export const guardianSchema = z.object({
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  phone: z.string().optional(),
  email: z.string().optional(),
  occupation: z.string().optional(),
});
export type GuardianFormValues = z.infer<typeof guardianSchema>;
export const guardianFields: FieldConfig<GuardianFormValues>[] = [
  { name: "first_name", label: "First name", type: "text" },
  { name: "last_name", label: "Last name", type: "text" },
  { name: "phone", label: "Phone", type: "text" },
  { name: "email", label: "Email", type: "email" },
  { name: "occupation", label: "Occupation", type: "text" },
];
export const guardianDefaults: GuardianFormValues = {
  first_name: "",
  last_name: "",
  phone: "",
  email: "",
  occupation: "",
};

export const relationshipTypeOptions: SelectOption[] = [
  { value: "father", label: "Father" },
  { value: "mother", label: "Mother" },
  { value: "guardian", label: "Guardian" },
  { value: "sibling", label: "Sibling" },
  { value: "other", label: "Other" },
];

export function relationshipTypeLabel(type: string): string {
  return relationshipTypeOptions.find((option) => option.value === type)?.label ?? type;
}

// `student` is set once at creation and is immutable afterwards (which
// child a link points to isn't something you "edit" — you'd unlink and
// relink instead), so create and edit use distinct schemas/field sets,
// same split as staff-forms.ts's `school`.
export const guardianStudentLinkCreateSchema = z.object({
  student: z.string().min(1, "Student is required"),
  relationship_type: z.enum(["father", "mother", "guardian", "sibling", "other"]),
  is_primary: z.boolean(),
});
export type GuardianStudentLinkCreateFormValues = z.infer<typeof guardianStudentLinkCreateSchema>;

export function guardianStudentLinkCreateFields(
  studentOptions: SelectOption[]
): FieldConfig<GuardianStudentLinkCreateFormValues>[] {
  return [
    { name: "student", label: "Student", type: "select", options: studentOptions, placeholder: "Select a student" },
    { name: "relationship_type", label: "Relationship", type: "select", options: relationshipTypeOptions },
    { name: "is_primary", label: "Primary guardian", type: "checkbox" },
  ];
}

export const guardianStudentLinkCreateDefaults: GuardianStudentLinkCreateFormValues = {
  student: "",
  relationship_type: "guardian",
  is_primary: false,
};

export const guardianStudentLinkEditSchema = z.object({
  relationship_type: z.enum(["father", "mother", "guardian", "sibling", "other"]),
  is_primary: z.boolean(),
});
export type GuardianStudentLinkEditFormValues = z.infer<typeof guardianStudentLinkEditSchema>;
export const guardianStudentLinkEditFields: FieldConfig<GuardianStudentLinkEditFormValues>[] = [
  { name: "relationship_type", label: "Relationship", type: "select", options: relationshipTypeOptions },
  { name: "is_primary", label: "Primary guardian", type: "checkbox" },
];
