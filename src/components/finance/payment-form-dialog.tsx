"use client";

import type { ReactNode } from "react";
import { EntityFormDialog } from "@/components/schools/entity-form-dialog";
import { paymentSchema, paymentFields, type PaymentFormValues } from "@/lib/finance-forms";
import type { ActionResult } from "@/lib/action-result";

export function PaymentFormDialog({
  trigger,
  title,
  defaultValues,
  action,
}: {
  trigger: ReactNode;
  title: string;
  defaultValues: PaymentFormValues;
  action: (values: PaymentFormValues) => Promise<ActionResult<unknown>>;
}) {
  return (
    <EntityFormDialog
      trigger={trigger}
      title={title}
      schema={paymentSchema}
      defaultValues={defaultValues}
      fields={paymentFields}
      action={action}
    />
  );
}
