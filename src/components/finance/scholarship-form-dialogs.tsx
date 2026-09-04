"use client";

import type { ReactNode } from "react";
import { EntityFormDialog, type SelectOption } from "@/components/schools/entity-form-dialog";
import {
  scholarshipSchema,
  scholarshipFields,
  type ScholarshipFormValues,
  scholarshipActiveSchema,
  scholarshipActiveFields,
  type ScholarshipActiveFormValues,
} from "@/lib/finance-forms";
import type { ActionResult } from "@/lib/action-result";

export function ScholarshipFormDialog({
  trigger,
  title,
  defaultValues,
  discountOptions,
  academicYearOptions,
  action,
}: {
  trigger: ReactNode;
  title: string;
  defaultValues: ScholarshipFormValues;
  discountOptions: SelectOption[];
  academicYearOptions: SelectOption[];
  action: (values: ScholarshipFormValues) => Promise<ActionResult<unknown>>;
}) {
  return (
    <EntityFormDialog
      trigger={trigger}
      title={title}
      schema={scholarshipSchema}
      defaultValues={defaultValues}
      fields={scholarshipFields(discountOptions, academicYearOptions)}
      action={action}
    />
  );
}

export function ScholarshipActiveFormDialog({
  trigger,
  title,
  defaultValues,
  action,
}: {
  trigger: ReactNode;
  title: string;
  defaultValues: ScholarshipActiveFormValues;
  action: (values: ScholarshipActiveFormValues) => Promise<ActionResult<unknown>>;
}) {
  return (
    <EntityFormDialog
      trigger={trigger}
      title={title}
      schema={scholarshipActiveSchema}
      defaultValues={defaultValues}
      fields={scholarshipActiveFields}
      action={action}
    />
  );
}
