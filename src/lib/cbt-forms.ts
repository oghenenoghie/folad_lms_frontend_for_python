import { z } from "zod";
import type { FieldConfig, SelectOption } from "@/components/schools/entity-form-dialog";
import { ALL_QUESTION_TYPES, CBT_EXAM_TYPES, HTML_BLOCK_TYPES } from "@/lib/cbt-types";

// Decimal strings, mirroring the backend's DecimalField(decimal_places=2)
// fields — see examinations-forms.ts's identical decimalString for why a
// plain number type isn't used here.
const decimalString = z
  .string()
  .min(1, "Required")
  .regex(/^\d{1,6}(\.\d{1,2})?$/, "Enter a number like 5 or 5.00");

// --- Topics ---

export const cbtTopicSchema = z.object({
  subject: z.string().min(1, "Subject is required"),
  name: z.string().min(1, "Name is required"),
  is_active: z.boolean(),
});
export type CBTTopicFormValues = z.infer<typeof cbtTopicSchema>;

export function cbtTopicFields(subjectOptions: SelectOption[]): FieldConfig<CBTTopicFormValues>[] {
  return [
    { name: "subject", label: "Subject", type: "select", options: subjectOptions, placeholder: "Select a subject" },
    { name: "name", label: "Name", type: "text" },
    { name: "is_active", label: "Active", type: "checkbox" },
  ];
}

export const cbtTopicDefaults: CBTTopicFormValues = { subject: "", name: "", is_active: true };

// --- Question bank ---

export const cbtQuestionTypeOptions: SelectOption[] = ALL_QUESTION_TYPES.map((value) => ({
  value,
  label: value
    .split("_")
    .map((w) => w[0].toUpperCase() + w.slice(1))
    .join(" "),
}));

export function cbtQuestionTypeLabel(type: string): string {
  return cbtQuestionTypeOptions.find((o) => o.value === type)?.label ?? type;
}

export const cbtDifficultyOptions: SelectOption[] = [
  { value: "easy", label: "Easy" },
  { value: "medium", label: "Medium" },
  { value: "hard", label: "Hard" },
];

export const cbtQuestionSchema = z.object({
  subject: z.string().min(1, "Subject is required"),
  class_level: z.string().min(1, "Class level is required"),
  topic: z.string().optional(),
  question_type: z.enum(ALL_QUESTION_TYPES as [string, ...string[]]),
  difficulty: z.enum(["easy", "medium", "hard"]),
  marks: decimalString,
  negative_marks: decimalString,
});
export type CBTQuestionFormValues = z.infer<typeof cbtQuestionSchema>;

export function cbtQuestionFields(
  subjectOptions: SelectOption[],
  classLevelOptions: SelectOption[],
  topicOptions: SelectOption[]
): FieldConfig<CBTQuestionFormValues>[] {
  return [
    { name: "subject", label: "Subject", type: "select", options: subjectOptions, placeholder: "Select a subject" },
    {
      name: "class_level",
      label: "Class level",
      type: "select",
      options: classLevelOptions,
      placeholder: "Select a class level",
    },
    {
      name: "topic",
      label: "Topic (optional)",
      type: "select",
      options: topicOptions,
      placeholder: "No topic",
    },
    { name: "question_type", label: "Question type", type: "select", options: cbtQuestionTypeOptions },
    { name: "difficulty", label: "Difficulty", type: "select", options: cbtDifficultyOptions },
    { name: "marks", label: "Marks", type: "text" },
    { name: "negative_marks", label: "Negative marks", type: "text" },
  ];
}

export const cbtQuestionDefaults: CBTQuestionFormValues = {
  subject: "",
  class_level: "",
  topic: "",
  question_type: "single_choice",
  difficulty: "medium",
  marks: "1.00",
  negative_marks: "0.00",
};

// Only html-content block types (paragraph/heading/callout) are authored
// here — see HTML_BLOCK_TYPES's docstring on why the richer block types
// (image, equation, table, graph, ...) aren't editable in this UI yet.
export const cbtBlockTypeOptions: SelectOption[] = HTML_BLOCK_TYPES.map((value) => ({
  value,
  label: value[0].toUpperCase() + value.slice(1),
}));

export const cbtBlockSchema = z.object({
  block_type: z.enum(HTML_BLOCK_TYPES as unknown as [string, ...string[]]),
  html: z.string().min(1, "Content is required"),
  order: z.coerce.number().int().min(1, "Order must be at least 1"),
});
export type CBTBlockFormValues = z.infer<typeof cbtBlockSchema>;

export const cbtBlockFields: FieldConfig<CBTBlockFormValues>[] = [
  { name: "block_type", label: "Block type", type: "select", options: cbtBlockTypeOptions },
  { name: "html", label: "Content (HTML)", type: "textarea" },
  { name: "order", label: "Order", type: "number" },
];

export const cbtBlockDefaults: CBTBlockFormValues = { block_type: "paragraph", html: "", order: 1 };

export const cbtOptionSchema = z.object({
  label: z.string().min(1, "Label is required (e.g. A, B, C)"),
  text: z.string().min(1, "Option text is required"),
  is_correct: z.boolean(),
  order: z.coerce.number().int().min(1, "Order must be at least 1"),
  explanation: z.string().optional(),
});
export type CBTOptionFormValues = z.infer<typeof cbtOptionSchema>;

export const cbtOptionFields: FieldConfig<CBTOptionFormValues>[] = [
  { name: "label", label: "Label", type: "text" },
  { name: "text", label: "Option text", type: "text" },
  { name: "is_correct", label: "This is a correct option", type: "checkbox" },
  { name: "order", label: "Order", type: "number" },
  { name: "explanation", label: "Explanation (optional)", type: "textarea" },
];

export const cbtOptionDefaults: CBTOptionFormValues = {
  label: "",
  text: "",
  is_correct: false,
  order: 1,
  explanation: "",
};

export const cbtBulkImportSchema = z.object({
  subject: z.string().min(1, "Subject is required"),
  class_level: z.string().min(1, "Class level is required"),
});
export type CBTBulkImportFormValues = z.infer<typeof cbtBulkImportSchema>;

// --- Exam builder ---

export const cbtExamTypeOptions: SelectOption[] = CBT_EXAM_TYPES.map((value) => ({
  value,
  label: value[0].toUpperCase() + value.slice(1),
}));

export const cbtExamCreateSchema = z.object({
  school: z.string().min(1, "School is required"),
  academic_year: z.string().min(1, "Academic year is required"),
  term: z.string().min(1, "Term is required"),
  subject: z.string().min(1, "Subject is required"),
  class_level: z.string().min(1, "Class level is required"),
  name: z.string().min(1, "Name is required"),
  exam_type: z.enum(CBT_EXAM_TYPES),
  duration_minutes: z.coerce.number().int().min(1, "Duration must be at least 1 minute"),
  pass_mark: decimalString,
  start_at: z.string().min(1, "Start date/time is required"),
  end_at: z.string().min(1, "End date/time is required"),
});
export type CBTExamCreateFormValues = z.infer<typeof cbtExamCreateSchema>;

export function cbtExamCreateFields(
  schoolOptions: SelectOption[],
  academicYearOptions: SelectOption[],
  termOptions: SelectOption[],
  subjectOptions: SelectOption[],
  classLevelOptions: SelectOption[]
): FieldConfig<CBTExamCreateFormValues>[] {
  return [
    { name: "school", label: "School", type: "select", options: schoolOptions, placeholder: "Select a school" },
    {
      name: "academic_year",
      label: "Academic year",
      type: "select",
      options: academicYearOptions,
      placeholder: "Select an academic year",
    },
    { name: "term", label: "Term", type: "select", options: termOptions, placeholder: "Select a term" },
    { name: "subject", label: "Subject", type: "select", options: subjectOptions, placeholder: "Select a subject" },
    {
      name: "class_level",
      label: "Class level",
      type: "select",
      options: classLevelOptions,
      placeholder: "Select a class level",
    },
    { name: "name", label: "Name", type: "text" },
    { name: "exam_type", label: "Type", type: "select", options: cbtExamTypeOptions },
    { name: "duration_minutes", label: "Duration (minutes)", type: "number" },
    { name: "pass_mark", label: "Pass mark", type: "text" },
    { name: "start_at", label: "Opens at", type: "datetime-local" },
    { name: "end_at", label: "Closes at", type: "datetime-local" },
  ];
}

export const cbtExamCreateDefaults: CBTExamCreateFormValues = {
  school: "",
  academic_year: "",
  term: "",
  subject: "",
  class_level: "",
  name: "",
  exam_type: "test",
  duration_minutes: 60,
  pass_mark: "40.00",
  start_at: "",
  end_at: "",
};

export const cbtExamEditSchema = z.object({
  name: z.string().min(1, "Name is required"),
  exam_type: z.enum(CBT_EXAM_TYPES),
  duration_minutes: z.coerce.number().int().min(1, "Duration must be at least 1 minute"),
  pass_mark: decimalString,
  start_at: z.string().min(1, "Start date/time is required"),
  end_at: z.string().min(1, "End date/time is required"),
  randomize_questions: z.boolean(),
  randomize_options: z.boolean(),
  allow_resume: z.boolean(),
  negative_marking: z.boolean(),
});
export type CBTExamEditFormValues = z.infer<typeof cbtExamEditSchema>;

export const cbtExamEditFields: FieldConfig<CBTExamEditFormValues>[] = [
  { name: "name", label: "Name", type: "text" },
  { name: "exam_type", label: "Type", type: "select", options: cbtExamTypeOptions },
  { name: "duration_minutes", label: "Duration (minutes)", type: "number" },
  { name: "pass_mark", label: "Pass mark", type: "text" },
  { name: "start_at", label: "Opens at", type: "datetime-local" },
  { name: "end_at", label: "Closes at", type: "datetime-local" },
  { name: "randomize_questions", label: "Randomize question order", type: "checkbox" },
  { name: "randomize_options", label: "Randomize option order", type: "checkbox" },
  { name: "allow_resume", label: "Allow resuming an in-progress attempt", type: "checkbox" },
  { name: "negative_marking", label: "Apply negative marking", type: "checkbox" },
];

export const cbtExamSectionSchema = z.object({
  name: z.string().min(1, "Name is required"),
  instructions: z.string().optional(),
  order: z.coerce.number().int().min(1, "Order must be at least 1"),
});
export type CBTExamSectionFormValues = z.infer<typeof cbtExamSectionSchema>;

export const cbtExamSectionFields: FieldConfig<CBTExamSectionFormValues>[] = [
  { name: "name", label: "Name", type: "text" },
  { name: "instructions", label: "Instructions (optional)", type: "textarea" },
  { name: "order", label: "Order", type: "number" },
];

export const cbtExamSectionDefaults: CBTExamSectionFormValues = { name: "", instructions: "", order: 1 };

export const cbtExamQuestionSchema = z.object({
  question: z.string().min(1, "Question is required"),
  section: z.string().optional(),
  order: z.coerce.number().int().min(1, "Order must be at least 1"),
  marks_override: z.string().optional(),
});
export type CBTExamQuestionFormValues = z.infer<typeof cbtExamQuestionSchema>;

export function cbtExamQuestionFields(
  questionOptions: SelectOption[],
  sectionOptions: SelectOption[]
): FieldConfig<CBTExamQuestionFormValues>[] {
  return [
    {
      name: "question",
      label: "Question",
      type: "select",
      options: questionOptions,
      placeholder: "Select an approved question",
    },
    {
      name: "section",
      label: "Section (optional)",
      type: "select",
      options: sectionOptions,
      placeholder: "No section",
    },
    { name: "order", label: "Order", type: "number" },
    { name: "marks_override", label: "Marks override (optional)", type: "text" },
  ];
}

export const cbtExamQuestionDefaults: CBTExamQuestionFormValues = {
  question: "",
  section: "",
  order: 1,
  marks_override: "",
};

export const cbtExamCandidateSchema = z.object({
  student: z.string().min(1, "Student is required"),
});
export type CBTExamCandidateFormValues = z.infer<typeof cbtExamCandidateSchema>;

export function cbtExamCandidateFields(
  studentOptions: SelectOption[]
): FieldConfig<CBTExamCandidateFormValues>[] {
  return [
    {
      name: "student",
      label: "Student",
      type: "select",
      options: studentOptions,
      placeholder: "Select a student",
    },
  ];
}

export const cbtExamCandidateDefaults: CBTExamCandidateFormValues = { student: "" };

export const cbtExamCandidatesFromClassArmSchema = z.object({
  class_arm: z.string().min(1, "Class arm is required"),
  academic_year: z.string().min(1, "Academic year is required"),
});
export type CBTExamCandidatesFromClassArmFormValues = z.infer<typeof cbtExamCandidatesFromClassArmSchema>;

export function cbtExamCandidatesFromClassArmFields(
  classArmOptions: SelectOption[],
  academicYearOptions: SelectOption[]
): FieldConfig<CBTExamCandidatesFromClassArmFormValues>[] {
  return [
    {
      name: "class_arm",
      label: "Class arm",
      type: "select",
      options: classArmOptions,
      placeholder: "Select a class arm",
    },
    {
      name: "academic_year",
      label: "Academic year",
      type: "select",
      options: academicYearOptions,
      placeholder: "Select an academic year",
    },
  ];
}

export const cbtExamCandidatesFromClassArmDefaults: CBTExamCandidatesFromClassArmFormValues = {
  class_arm: "",
  academic_year: "",
};
