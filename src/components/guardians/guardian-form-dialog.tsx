"use client";

import type { ReactNode } from "react";
import { EntityFormDialog } from "@/components/schools/entity-form-dialog";
import { guardianSchema, guardianFields, type GuardianFormValues } from "@/lib/guardian-forms";
import type { ActionResult } from "@/lib/action-result";

export function GuardianFormDialog({
  trigger,
  title,
  defaultValues,
  action,
}: {
  trigger: ReactNode;
  title: string;
  defaultValues: GuardianFormValues;
  action: (values: GuardianFormValues) => Promise<ActionResult<unknown>>;
}) {
  return (
    <EntityFormDialog
      trigger={trigger}
      title={title}
      schema={guardianSchema}
      defaultValues={defaultValues}
      fields={guardianFields}
      action={action}
    />
  );
}
