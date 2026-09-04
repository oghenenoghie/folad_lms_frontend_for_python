"use client";

import type { ReactNode } from "react";
import { EntityFormDialog } from "@/components/schools/entity-form-dialog";
import { classArmSchema, classArmFields, type ClassArmFormValues } from "@/lib/academics-forms";
import type { ActionResult } from "@/lib/action-result";

export function ClassArmFormDialog({
  trigger,
  title,
  defaultValues,
  action,
}: {
  trigger: ReactNode;
  title: string;
  defaultValues: ClassArmFormValues;
  action: (values: ClassArmFormValues) => Promise<ActionResult<unknown>>;
}) {
  return (
    <EntityFormDialog
      trigger={trigger}
      title={title}
      schema={classArmSchema}
      defaultValues={defaultValues}
      fields={classArmFields}
      action={action}
    />
  );
}
