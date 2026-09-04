"use client";

import type { ReactNode } from "react";
import { EntityFormDialog } from "@/components/schools/entity-form-dialog";
import {
  inventoryItemSchema,
  inventoryItemFields,
  type InventoryItemFormValues,
} from "@/lib/inventory-forms";
import type { ActionResult } from "@/lib/action-result";

export function InventoryItemFormDialog({
  trigger,
  title,
  defaultValues,
  action,
}: {
  trigger: ReactNode;
  title: string;
  defaultValues: InventoryItemFormValues;
  action: (values: InventoryItemFormValues) => Promise<ActionResult<unknown>>;
}) {
  return (
    <EntityFormDialog
      trigger={trigger}
      title={title}
      schema={inventoryItemSchema}
      defaultValues={defaultValues}
      fields={inventoryItemFields}
      action={action}
    />
  );
}
