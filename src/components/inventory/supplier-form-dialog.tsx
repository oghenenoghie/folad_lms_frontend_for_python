"use client";

import type { ReactNode } from "react";
import { EntityFormDialog } from "@/components/schools/entity-form-dialog";
import { supplierSchema, supplierFields, type SupplierFormValues } from "@/lib/inventory-forms";
import type { ActionResult } from "@/lib/action-result";

export function SupplierFormDialog({
  trigger,
  title,
  defaultValues,
  action,
}: {
  trigger: ReactNode;
  title: string;
  defaultValues: SupplierFormValues;
  action: (values: SupplierFormValues) => Promise<ActionResult<unknown>>;
}) {
  return (
    <EntityFormDialog
      trigger={trigger}
      title={title}
      schema={supplierSchema}
      defaultValues={defaultValues}
      fields={supplierFields}
      action={action}
    />
  );
}
