import type { SelectOption } from "@/components/schools/entity-form-dialog";
import type { ReportFormat, ReportStatus, ReportType } from "@/lib/reports";

export const reportTypeOptions: SelectOption[] = [
  { value: "student_list", label: "Student list" },
  { value: "attendance_summary", label: "Attendance summary" },
  { value: "fee_collection", label: "Fee collection" },
  { value: "results_summary", label: "Results summary" },
];

export function reportTypeLabel(type: string): string {
  return reportTypeOptions.find((option) => option.value === type)?.label ?? type;
}

export const reportFormatOptions: SelectOption[] = [
  { value: "csv", label: "CSV" },
  { value: "xlsx", label: "Excel" },
  { value: "pdf", label: "PDF" },
];

export function reportFormatLabel(format: string): string {
  return reportFormatOptions.find((option) => option.value === format)?.label ?? format;
}

export const reportStatusLabels: Record<ReportStatus, string> = {
  pending: "Pending",
  generating: "Generating",
  ready: "Ready",
  failed: "Failed",
};

// Which optional `parameters` inputs apply to each report_type — see
// apps.reports.services.generators.py, one function per type, each
// reading a different subset of the parameters bag.
export const REPORT_TYPE_PARAMETER_FIELDS: Record<ReportType, ("class_arm" | "term" | "date_range")[]> = {
  student_list: ["class_arm"],
  attendance_summary: ["term", "date_range"],
  fee_collection: ["term"],
  results_summary: ["term"],
};

export type ReportRequestDraft = {
  school: string;
  report_type: ReportType | "";
  format: ReportFormat | "";
  class_arm: string;
  term: string;
  date_from: string;
  date_to: string;
};

export const reportRequestDefaults: ReportRequestDraft = {
  school: "",
  report_type: "",
  format: "csv",
  class_arm: "",
  term: "",
  date_from: "",
  date_to: "",
};
