"use client";

import type { ReactNode } from "react";
import { EntityFormDialog } from "@/components/schools/entity-form-dialog";
import { classLevelSchema, classLevelFields, type ClassLevelFormValues } from "@/lib/academics-forms";
import type { ActionResult } from "@/lib/action-result";

export function ClassLevelFormDialog({
  trigger,
  title,
  defaultValues,
  action,
}: {
  trigger: ReactNode;
  title: string;
  defaultValues: ClassLevelFormValues;
  action: (values: ClassLevelFormValues) => Promise<ActionResult<unknown>>;
}) {
  return (
    <EntityFormDialog
      trigger={trigger}
      title={title}
      schema={classLevelSchema}
      defaultValues={defaultValues}
      fields={classLevelFields}
      action={action}
    />
  );
}
