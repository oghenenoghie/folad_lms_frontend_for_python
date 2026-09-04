"use client";

import type { ReactNode } from "react";
import { EntityFormDialog } from "@/components/schools/entity-form-dialog";
import { refundSchema, refundFields, type RefundFormValues } from "@/lib/finance-forms";
import type { ActionResult } from "@/lib/action-result";

export function RefundFormDialog({
  trigger,
  title,
  defaultValues,
  action,
}: {
  trigger: ReactNode;
  title: string;
  defaultValues: RefundFormValues;
  action: (values: RefundFormValues) => Promise<ActionResult<unknown>>;
}) {
  return (
    <EntityFormDialog
      trigger={trigger}
      title={title}
      schema={refundSchema}
      defaultValues={defaultValues}
      fields={refundFields}
      action={action}
    />
  );
}
