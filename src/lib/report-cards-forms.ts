import { z } from "zod";
import type { FieldConfig, SelectOption } from "@/components/schools/entity-form-dialog";

export const requestReportCardSchema = z.object({
  term: z.string().min(1, "Term is required"),
});
export type RequestReportCardFormValues = z.infer<typeof requestReportCardSchema>;

export function requestReportCardFields(
  termOptions: SelectOption[]
): FieldConfig<RequestReportCardFormValues>[] {
  return [{ name: "term", label: "Term", type: "select", options: termOptions, placeholder: "Select a term" }];
}

export const requestReportCardDefaults: RequestReportCardFormValues = { term: "" };
