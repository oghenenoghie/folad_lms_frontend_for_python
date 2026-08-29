import { z } from "zod";
import type { FieldConfig, SelectOption } from "@/components/schools/entity-form-dialog";
import type { QuestionType } from "@/lib/examinations";

// Decimal strings, mirroring the backend's DecimalField(max_digits=5,
// decimal_places=2) — e.g. "10.00". A plain number type would round-trip
// through JS floating point before hitting the API; the API already
// accepts numeric strings, so validate the shape and pass it through.
const decimalString = z
  .string()
  .min(1, "Required")
  .regex(/^\d{1,3}(\.\d{1,2})?$/, "Enter a number like 10 or 10.00");

export const questionTypeOptions: SelectOption[] = [
  { value: "multiple_choice", label: "Multiple choice" },
  { value: "true_false", label: "True / False" },
  { value: "short_answer", label: "Short answer" },
  { value: "essay", label: "Essay" },
];

export function questionTypeLabel(type: QuestionType | string): string {
  return questionTypeOptions.find((option) => option.value === type)?.label ?? type;
}

export const questionSchema = z.object({
  question_type: z.enum(["multiple_choice", "true_false", "short_answer", "essay"]),
  text: z.string().min(1, "Question text is required"),
  marks: decimalString,
  sequence: z.coerce.number().int().min(1, "Sequence must be at least 1"),
});
export type QuestionFormValues = z.infer<typeof questionSchema>;

export const questionFields: FieldConfig<QuestionFormValues>[] = [
  { name: "question_type", label: "Question type", type: "select", options: questionTypeOptions },
  { name: "text", label: "Question text", type: "textarea" },
  { name: "marks", label: "Marks", type: "text" },
  { name: "sequence", label: "Sequence", type: "number" },
];

export const questionDefaults: QuestionFormValues = {
  question_type: "multiple_choice",
  text: "",
  marks: "",
  sequence: 1,
};

export const questionOptionSchema = z.object({
  text: z.string().min(1, "Option text is required"),
  is_correct: z.boolean(),
  sequence: z.coerce.number().int().min(1, "Sequence must be at least 1"),
});
export type QuestionOptionFormValues = z.infer<typeof questionOptionSchema>;

export const questionOptionFields: FieldConfig<QuestionOptionFormValues>[] = [
  { name: "text", label: "Option text", type: "text" },
  { name: "is_correct", label: "This is the correct option", type: "checkbox" },
  { name: "sequence", label: "Sequence", type: "number" },
];

export const questionOptionDefaults: QuestionOptionFormValues = {
  text: "",
  is_correct: false,
  sequence: 1,
};

export const gradeAnswerSchema = z.object({
  marks_awarded: decimalString,
  is_correct: z.boolean(),
});
export type GradeAnswerFormValues = z.infer<typeof gradeAnswerSchema>;

export const gradeAnswerFields: FieldConfig<GradeAnswerFormValues>[] = [
  { name: "marks_awarded", label: "Marks awarded", type: "text" },
  { name: "is_correct", label: "Mark as correct", type: "checkbox" },
];

export const gradeAnswerDefaults: GradeAnswerFormValues = { marks_awarded: "", is_correct: false };
