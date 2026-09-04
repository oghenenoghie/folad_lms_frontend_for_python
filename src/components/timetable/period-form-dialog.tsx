"use client";

import type { ReactNode } from "react";
import { EntityFormDialog } from "@/components/schools/entity-form-dialog";
import { periodSchema, periodFields, type PeriodFormValues } from "@/lib/timetable-forms";
import type { ActionResult } from "@/lib/action-result";

export function PeriodFormDialog({
  trigger,
  title,
  defaultValues,
  action,
}: {
  trigger: ReactNode;
  title: string;
  defaultValues: PeriodFormValues;
  action: (values: PeriodFormValues) => Promise<ActionResult<unknown>>;
}) {
  return (
    <EntityFormDialog
      trigger={trigger}
      title={title}
      schema={periodSchema}
      defaultValues={defaultValues}
      fields={periodFields}
      action={action}
    />
  );
}
