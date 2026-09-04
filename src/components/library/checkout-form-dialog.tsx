"use client";

import type { ReactNode } from "react";
import { EntityFormDialog, type SelectOption } from "@/components/schools/entity-form-dialog";
import { checkoutSchema, checkoutFields, type CheckoutFormValues } from "@/lib/library-forms";
import type { ActionResult } from "@/lib/action-result";

export function CheckoutFormDialog({
  trigger,
  title,
  defaultValues,
  copyOptions,
  memberOptions,
  action,
}: {
  trigger: ReactNode;
  title: string;
  defaultValues: CheckoutFormValues;
  copyOptions: SelectOption[];
  memberOptions: SelectOption[];
  action: (values: CheckoutFormValues) => Promise<ActionResult<unknown>>;
}) {
  return (
    <EntityFormDialog
      trigger={trigger}
      title={title}
      schema={checkoutSchema}
      defaultValues={defaultValues}
      fields={checkoutFields(copyOptions, memberOptions)}
      action={action}
    />
  );
}
