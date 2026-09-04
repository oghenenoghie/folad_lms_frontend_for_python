"use client";

import type { ReactNode } from "react";
import { EntityFormDialog, type SelectOption } from "@/components/schools/entity-form-dialog";
import {
  feeStructureCreateSchema,
  feeStructureCreateFields,
  type FeeStructureCreateFormValues,
  feeStructureEditSchema,
  feeStructureEditFields,
  type FeeStructureEditFormValues,
} from "@/lib/finance-forms";
import type { ActionResult } from "@/lib/action-result";

export function FeeStructureCreateFormDialog({
  trigger,
  title,
  defaultValues,
  termOptions,
  action,
}: {
  trigger: ReactNode;
  title: string;
  defaultValues: FeeStructureCreateFormValues;
  termOptions: SelectOption[];
  action: (values: FeeStructureCreateFormValues) => Promise<ActionResult<unknown>>;
}) {
  return (
    <EntityFormDialog
      trigger={trigger}
      title={title}
      schema={feeStructureCreateSchema}
      defaultValues={defaultValues}
      fields={feeStructureCreateFields(termOptions)}
      action={action}
    />
  );
}

export function FeeStructureEditFormDialog({
  trigger,
  title,
  defaultValues,
  action,
}: {
  trigger: ReactNode;
  title: string;
  defaultValues: FeeStructureEditFormValues;
  action: (values: FeeStructureEditFormValues) => Promise<ActionResult<unknown>>;
}) {
  return (
    <EntityFormDialog
      trigger={trigger}
      title={title}
      schema={feeStructureEditSchema}
      defaultValues={defaultValues}
      fields={feeStructureEditFields}
      action={action}
    />
  );
}
