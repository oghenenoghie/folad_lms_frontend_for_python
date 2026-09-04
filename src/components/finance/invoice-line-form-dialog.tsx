"use client";

import type { ReactNode } from "react";
import { EntityFormDialog, type SelectOption } from "@/components/schools/entity-form-dialog";
import { invoiceLineSchema, invoiceLineFields, type InvoiceLineFormValues } from "@/lib/finance-forms";
import type { ActionResult } from "@/lib/action-result";

export function InvoiceLineFormDialog({
  trigger,
  title,
  defaultValues,
  feeItemOptions,
  action,
}: {
  trigger: ReactNode;
  title: string;
  defaultValues: InvoiceLineFormValues;
  feeItemOptions: SelectOption[];
  action: (values: InvoiceLineFormValues) => Promise<ActionResult<unknown>>;
}) {
  return (
    <EntityFormDialog
      trigger={trigger}
      title={title}
      schema={invoiceLineSchema}
      defaultValues={defaultValues}
      fields={invoiceLineFields(feeItemOptions)}
      action={action}
    />
  );
}
