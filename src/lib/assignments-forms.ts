import { z } from "zod";
import type { FieldConfig, SelectOption } from "@/components/schools/entity-form-dialog";

// Decimal strings, mirroring the backend's DecimalField(max_digits=5,
// decimal_places=2) — same reasoning as examinations-forms.ts's
// decimalString: the API already accepts numeric strings, so validate the
// shape and pass it through rather than round-tripping through JS floats.
const decimalString = z
  .string()
  .min(1, "Required")
  .regex(/^\d{1,3}(\.\d{1,2})?$/, "Enter a number like 10 or 10.00");

export const assignmentCreateSchema = z.object({
  class_subject: z.string().min(1, "Class subject is required"),
  term: z.string().min(1, "Term is required"),
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  due_date: z.string().min(1, "Due date is required"),
  max_score: decimalString,
});
export type AssignmentCreateFormValues = z.infer<typeof assignmentCreateSchema>;

export function assignmentCreateFields(
  classSubjectOptions: SelectOption[],
  termOptions: SelectOption[]
): FieldConfig<AssignmentCreateFormValues>[] {
  return [
    {
      name: "class_subject",
      label: "Class subject",
      type: "select",
      options: classSubjectOptions,
      placeholder: "Select a class subject",
    },
    { name: "term", label: "Term", type: "select", options: termOptions, placeholder: "Select a term" },
    { name: "title", label: "Title", type: "text" },
    { name: "description", label: "Description", type: "textarea" },
    { name: "due_date", label: "Due date", type: "date" },
    { name: "max_score", label: "Max score", type: "text" },
  ];
}

export const assignmentCreateDefaults: AssignmentCreateFormValues = {
  class_subject: "",
  term: "",
  title: "",
  description: "",
  due_date: "",
  max_score: "",
};

// class_subject/term aren't editable server-side (perform_update drops
// them) — reassigning an assignment to a different subject or term means
// deleting and re-creating it.
export const assignmentEditSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  due_date: z.string().min(1, "Due date is required"),
  max_score: decimalString,
});
export type AssignmentEditFormValues = z.infer<typeof assignmentEditSchema>;

export const assignmentEditFields: FieldConfig<AssignmentEditFormValues>[] = [
  { name: "title", label: "Title", type: "text" },
  { name: "description", label: "Description", type: "textarea" },
  { name: "due_date", label: "Due date", type: "date" },
  { name: "max_score", label: "Max score", type: "text" },
];

export const gradeSubmissionSchema = z.object({
  score: decimalString,
  feedback: z.string().optional(),
});
export type GradeSubmissionFormValues = z.infer<typeof gradeSubmissionSchema>;

export const gradeSubmissionFields: FieldConfig<GradeSubmissionFormValues>[] = [
  { name: "score", label: "Score", type: "text" },
  { name: "feedback", label: "Feedback", type: "textarea" },
];

export const gradeSubmissionDefaults: GradeSubmissionFormValues = { score: "", feedback: "" };
