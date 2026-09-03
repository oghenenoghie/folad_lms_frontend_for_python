"use client";

import type { ReactNode } from "react";
import { EntityFormDialog, type SelectOption } from "@/components/schools/entity-form-dialog";
import {
  reportCardGenerateSchema,
  reportCardGenerateFields,
  type ReportCardGenerateFormValues,
  reportCardGenerateBulkSchema,
  reportCardGenerateBulkFields,
  type ReportCardGenerateBulkFormValues,
  reportCardCommentsSchema,
  reportCardCommentsFields,
  type ReportCardCommentsFormValues,
  reportCardWeightingSchema,
  reportCardWeightingFields,
  type ReportCardWeightingFormValues,
} from "@/lib/report-cards-forms";
import type { ActionResult } from "@/lib/action-result";

export function ReportCardGenerateDialog({
  trigger,
  title,
  studentOptions,
  termOptions,
  action,
}: {
  trigger: ReactNode;
  title: string;
  studentOptions: SelectOption[];
  termOptions: SelectOption[];
  action: (values: ReportCardGenerateFormValues) => Promise<ActionResult<unknown>>;
}) {
  return (
    <EntityFormDialog
      trigger={trigger}
      title={title}
      schema={reportCardGenerateSchema}
      defaultValues={{ student: "", term: "" }}
      fields={reportCardGenerateFields(studentOptions, termOptions)}
      action={action}
    />
  );
}

export function ReportCardGenerateBulkDialog({
  trigger,
  title,
  termOptions,
  action,
}: {
  trigger: ReactNode;
  title: string;
  termOptions: SelectOption[];
  action: (values: ReportCardGenerateBulkFormValues) => Promise<ActionResult<unknown>>;
}) {
  return (
    <EntityFormDialog
      trigger={trigger}
      title={title}
      description="Generates (or refreshes) a report card for every student enrolled this academic year in the selected term."
      schema={reportCardGenerateBulkSchema}
      defaultValues={{ term: "" }}
      fields={reportCardGenerateBulkFields(termOptions)}
      action={action}
    />
  );
}

export function ReportCardCommentsDialog({
  trigger,
  title,
  defaultValues,
  action,
}: {
  trigger: ReactNode;
  title: string;
  defaultValues: ReportCardCommentsFormValues;
  action: (values: ReportCardCommentsFormValues) => Promise<ActionResult<unknown>>;
}) {
  return (
    <EntityFormDialog
      trigger={trigger}
      title={title}
      schema={reportCardCommentsSchema}
      defaultValues={defaultValues}
      fields={reportCardCommentsFields}
      action={action}
    />
  );
}

export function ReportCardWeightingDialog({
  trigger,
  title,
  defaultValues,
  action,
}: {
  trigger: ReactNode;
  title: string;
  defaultValues: ReportCardWeightingFormValues;
  action: (values: ReportCardWeightingFormValues) => Promise<ActionResult<unknown>>;
}) {
  return (
    <EntityFormDialog
      trigger={trigger}
      title={title}
      description="How much each score category counts toward a subject's total. Must add up to 100."
      schema={reportCardWeightingSchema}
      defaultValues={defaultValues}
      fields={reportCardWeightingFields}
      action={action}
    />
  );
}
