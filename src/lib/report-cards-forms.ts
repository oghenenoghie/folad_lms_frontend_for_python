import { z } from "zod";
import type { FieldConfig, SelectOption } from "@/components/schools/entity-form-dialog";

// Decimal strings, mirroring the backend's DecimalField(max_digits=5,
// decimal_places=2) — same convention as lib/examinations-forms.ts's
// decimalString, for the same reason (no float round-tripping).
const decimalString = z
  .string()
  .min(1, "Required")
  .regex(/^\d{1,3}(\.\d{1,2})?$/, "Enter a number like 30 or 30.00");

export const reportCardGenerateSchema = z.object({
  student: z.string().min(1, "Student is required"),
  term: z.string().min(1, "Term is required"),
});
export type ReportCardGenerateFormValues = z.infer<typeof reportCardGenerateSchema>;

export function reportCardGenerateFields(
  studentOptions: SelectOption[],
  termOptions: SelectOption[]
): FieldConfig<ReportCardGenerateFormValues>[] {
  return [
    { name: "student", label: "Student", type: "select", options: studentOptions, placeholder: "Select a student" },
    { name: "term", label: "Term", type: "select", options: termOptions, placeholder: "Select a term" },
  ];
}

export const reportCardGenerateDefaults: ReportCardGenerateFormValues = { student: "", term: "" };

// Bulk generation has no student picker — omitting `students` on the
// backend's generate-bulk endpoint means "every student enrolled this
// academic year" (see apps.report_cards.services.report_card_service.
// generate_report_cards_bulk), which is exactly what a "generate for the
// whole term" action should do.
export const reportCardGenerateBulkSchema = z.object({
  term: z.string().min(1, "Term is required"),
});
export type ReportCardGenerateBulkFormValues = z.infer<typeof reportCardGenerateBulkSchema>;

export function reportCardGenerateBulkFields(
  termOptions: SelectOption[]
): FieldConfig<ReportCardGenerateBulkFormValues>[] {
  return [{ name: "term", label: "Term", type: "select", options: termOptions, placeholder: "Select a term" }];
}

export const reportCardGenerateBulkDefaults: ReportCardGenerateBulkFormValues = { term: "" };

export const reportCardCommentsSchema = z.object({
  teacher_comment: z.string(),
  principal_comment: z.string(),
  next_term_begins: z.string(),
});
export type ReportCardCommentsFormValues = z.infer<typeof reportCardCommentsSchema>;

export const reportCardCommentsFields: FieldConfig<ReportCardCommentsFormValues>[] = [
  { name: "teacher_comment", label: "Teacher's comment", type: "textarea" },
  { name: "principal_comment", label: "Principal's comment", type: "textarea" },
  { name: "next_term_begins", label: "Next term begins", type: "date" },
];

export const reportCardWeightingSchema = z
  .object({
    ca_weight: decimalString,
    cbt_weight: decimalString,
    exam_weight: decimalString,
  })
  .refine((values) => Number(values.ca_weight) + Number(values.cbt_weight) + Number(values.exam_weight) === 100, {
    message: "CA + CBT + Exam weights must add up to 100",
    path: ["exam_weight"],
  });
export type ReportCardWeightingFormValues = z.infer<typeof reportCardWeightingSchema>;

export const reportCardWeightingFields: FieldConfig<ReportCardWeightingFormValues>[] = [
  { name: "ca_weight", label: "Continuous Assessment weight", type: "text" },
  { name: "cbt_weight", label: "CBT weight", type: "text" },
  { name: "exam_weight", label: "Examination weight", type: "text" },
];

export const reportCardWeightingDefaults: ReportCardWeightingFormValues = {
  ca_weight: "30.00",
  cbt_weight: "30.00",
  exam_weight: "40.00",
};
