"use client";

import type { ReactNode } from "react";
import { EntityFormDialog } from "@/components/schools/entity-form-dialog";
import {
  percentageDiscountSchema,
  percentageDiscountFields,
  type PercentageDiscountFormValues,
  fixedDiscountSchema,
  fixedDiscountFields,
  type FixedDiscountFormValues,
} from "@/lib/finance-forms";
import type { ActionResult } from "@/lib/action-result";

export function PercentageDiscountFormDialog({
  trigger,
  title,
  defaultValues,
  action,
}: {
  trigger: ReactNode;
  title: string;
  defaultValues: PercentageDiscountFormValues;
  action: (values: PercentageDiscountFormValues) => Promise<ActionResult<unknown>>;
}) {
  return (
    <EntityFormDialog
      trigger={trigger}
      title={title}
      schema={percentageDiscountSchema}
      defaultValues={defaultValues}
      fields={percentageDiscountFields}
      action={action}
    />
  );
}

export function FixedDiscountFormDialog({
  trigger,
  title,
  defaultValues,
  action,
}: {
  trigger: ReactNode;
  title: string;
  defaultValues: FixedDiscountFormValues;
  action: (values: FixedDiscountFormValues) => Promise<ActionResult<unknown>>;
}) {
  return (
    <EntityFormDialog
      trigger={trigger}
      title={title}
      schema={fixedDiscountSchema}
      defaultValues={defaultValues}
      fields={fixedDiscountFields}
      action={action}
    />
  );
}
