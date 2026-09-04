"use client";

import type { ReactNode } from "react";
import { EntityFormDialog, type SelectOption } from "@/components/schools/entity-form-dialog";
import { invoiceCreateSchema, invoiceCreateFields, type InvoiceCreateFormValues } from "@/lib/finance-forms";
import type { ActionResult } from "@/lib/action-result";

export function InvoiceCreateFormDialog({
  trigger,
  title,
  defaultValues,
  studentOptions,
  termOptions,
  action,
}: {
  trigger: ReactNode;
  title: string;
  defaultValues: InvoiceCreateFormValues;
  studentOptions: SelectOption[];
  termOptions: SelectOption[];
  action: (values: InvoiceCreateFormValues) => Promise<ActionResult<unknown>>;
}) {
  return (
    <EntityFormDialog
      trigger={trigger}
      title={title}
      schema={invoiceCreateSchema}
      defaultValues={defaultValues}
      fields={invoiceCreateFields(studentOptions, termOptions)}
      action={action}
    />
  );
}
