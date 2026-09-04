"use client";

import type { ReactNode } from "react";
import { EntityFormDialog } from "@/components/schools/entity-form-dialog";
import { feeItemSchema, feeItemFields, type FeeItemFormValues } from "@/lib/finance-forms";
import type { ActionResult } from "@/lib/action-result";

export function FeeItemFormDialog({
  trigger,
  title,
  defaultValues,
  action,
}: {
  trigger: ReactNode;
  title: string;
  defaultValues: FeeItemFormValues;
  action: (values: FeeItemFormValues) => Promise<ActionResult<unknown>>;
}) {
  return (
    <EntityFormDialog
      trigger={trigger}
      title={title}
      schema={feeItemSchema}
      defaultValues={defaultValues}
      fields={feeItemFields}
      action={action}
    />
  );
}
