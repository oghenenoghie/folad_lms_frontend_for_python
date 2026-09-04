"use client";

import type { ReactNode } from "react";
import { EntityFormDialog } from "@/components/schools/entity-form-dialog";
import { gradeBandSchema, gradeBandFields, type GradeBandFormValues } from "@/lib/examinations-forms";
import type { ActionResult } from "@/lib/action-result";

export function GradeBandFormDialog({
  trigger,
  title,
  defaultValues,
  action,
}: {
  trigger: ReactNode;
  title: string;
  defaultValues: GradeBandFormValues;
  action: (values: GradeBandFormValues) => Promise<ActionResult<unknown>>;
}) {
  return (
    <EntityFormDialog
      trigger={trigger}
      title={title}
      schema={gradeBandSchema}
      defaultValues={defaultValues}
      fields={gradeBandFields}
      action={action}
    />
  );
}
