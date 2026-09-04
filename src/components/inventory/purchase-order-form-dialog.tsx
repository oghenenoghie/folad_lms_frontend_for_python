"use client";

import type { ReactNode } from "react";
import { EntityFormDialog, type SelectOption } from "@/components/schools/entity-form-dialog";
import {
  purchaseOrderSchema,
  purchaseOrderFields,
  type PurchaseOrderFormValues,
} from "@/lib/inventory-forms";
import type { ActionResult } from "@/lib/action-result";

export function PurchaseOrderFormDialog({
  trigger,
  title,
  defaultValues,
  supplierOptions,
  action,
}: {
  trigger: ReactNode;
  title: string;
  defaultValues: PurchaseOrderFormValues;
  supplierOptions: SelectOption[];
  action: (values: PurchaseOrderFormValues) => Promise<ActionResult<unknown>>;
}) {
  return (
    <EntityFormDialog
      trigger={trigger}
      title={title}
      schema={purchaseOrderSchema}
      defaultValues={defaultValues}
      fields={purchaseOrderFields(supplierOptions)}
      action={action}
    />
  );
}
