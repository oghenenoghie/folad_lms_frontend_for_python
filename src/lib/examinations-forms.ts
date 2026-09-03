import { z } from "zod";
import type { FieldConfig, SelectOption } from "@/components/schools/entity-form-dialog";
import type { AssessmentType, QuestionType } from "@/lib/examinations";

// Decimal strings, mirroring the backend's DecimalField(max_digits=5,
// decimal_places=2) — e.g. "10.00". A plain number type would round-trip
// through JS floating point before hitting the API; the API already
// accepts numeric strings, so validate the shape and pass it through.
const decimalString = z
  .string()
  .min(1, "Required")
  .regex(/^\d{1,3}(\.\d{1,2})?$/, "Enter a number like 10 or 10.00");

export const assessmentTypeOptions: SelectOption[] = [
  { value: "test", label: "Test" },
  { value: "quiz", label: "Quiz" },
  { value: "assignment", label: "Assignment" },
  { value: "project", label: "Project" },
  { value: "practical", label: "Practical" },
  { value: "exam", label: "Exam" },
];

export function assessmentTypeLabel(type: AssessmentType | string): string {
  return assessmentTypeOptions.find((option) => option.value === type)?.label ?? type;
}

// Which report-card bucket (see apps.report_cards) this assessment's score
// counts toward — independent of assessment_type above: a "test" can be
// delivered as a CBT, an "exam" can be entirely offline.
export const scoreCategoryOptions: SelectOption[] = [
  { value: "ca", label: "Continuous Assessment" },
  { value: "cbt", label: "CBT" },
  { value: "exam", label: "Examination" },
];

export function scoreCategoryLabel(category: string): string {
  return scoreCategoryOptions.find((option) => option.value === category)?.label ?? category;
}

export const assessmentCreateSchema = z.object({
  class_subject: z.string().min(1, "Class subject is required"),
  term: z.string().min(1, "Term is required"),
  name: z.string().min(1, "Name is required"),
  assessment_type: z.enum(["test", "quiz", "assignment", "project", "practical", "exam"]),
  score_category: z.enum(["ca", "cbt", "exam"]),
  weight: decimalString,
  max_score: decimalString,
});
export type AssessmentCreateFormValues = z.infer<typeof assessmentCreateSchema>;

export function assessmentCreateFields(
  classSubjectOptions: SelectOption[],
  termOptions: SelectOption[]
): FieldConfig<AssessmentCreateFormValues>[] {
  return [
    {
      name: "class_subject",
      label: "Class subject",
      type: "select",
      options: classSubjectOptions,
      placeholder: "Select a class subject",
    },
    { name: "term", label: "Term", type: "select", options: termOptions, placeholder: "Select a term" },
    { name: "name", label: "Name", type: "text" },
    { name: "assessment_type", label: "Type", type: "select", options: assessmentTypeOptions },
    {
      name: "score_category",
      label: "Report card category",
      type: "select",
      options: scoreCategoryOptions,
    },
    { name: "weight", label: "Weight", type: "text" },
    { name: "max_score", label: "Max score", type: "text" },
  ];
}

export const assessmentCreateDefaults: AssessmentCreateFormValues = {
  class_subject: "",
  term: "",
  name: "",
  assessment_type: "test",
  score_category: "ca",
  weight: "",
  max_score: "",
};

export const assessmentEditSchema = z.object({
  name: z.string().min(1, "Name is required"),
  assessment_type: z.enum(["test", "quiz", "assignment", "project", "practical", "exam"]),
  score_category: z.enum(["ca", "cbt", "exam"]),
  weight: decimalString,
  max_score: decimalString,
});
export type AssessmentEditFormValues = z.infer<typeof assessmentEditSchema>;

export const assessmentEditFields: FieldConfig<AssessmentEditFormValues>[] = [
  { name: "name", label: "Name", type: "text" },
  { name: "assessment_type", label: "Type", type: "select", options: assessmentTypeOptions },
  {
    name: "score_category",
    label: "Report card category",
    type: "select",
    options: scoreCategoryOptions,
  },
  { name: "weight", label: "Weight", type: "text" },
  { name: "max_score", label: "Max score", type: "text" },
];

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
