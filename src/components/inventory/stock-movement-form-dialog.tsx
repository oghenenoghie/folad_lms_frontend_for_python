"use client";

import type { ReactNode } from "react";
import { EntityFormDialog } from "@/components/schools/entity-form-dialog";
import {
  stockMovementSchema,
  stockMovementFields,
  type StockMovementFormValues,
} from "@/lib/inventory-forms";
import type { ActionResult } from "@/lib/action-result";

export function StockMovementFormDialog({
  trigger,
  title,
  defaultValues,
  action,
}: {
  trigger: ReactNode;
  title: string;
  defaultValues: StockMovementFormValues;
  action: (values: StockMovementFormValues) => Promise<ActionResult<unknown>>;
}) {
  return (
    <EntityFormDialog
      trigger={trigger}
      title={title}
      schema={stockMovementSchema}
      defaultValues={defaultValues}
      fields={stockMovementFields}
      action={action}
    />
  );
}
