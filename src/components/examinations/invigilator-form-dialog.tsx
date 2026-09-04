"use client";

import type { ReactNode } from "react";
import { EntityFormDialog, type SelectOption } from "@/components/schools/entity-form-dialog";
import { invigilatorSchema, invigilatorFields, type InvigilatorFormValues } from "@/lib/examinations-forms";
import type { ActionResult } from "@/lib/action-result";

export function InvigilatorFormDialog({
  trigger,
  title,
  defaultValues,
  teacherOptions,
  action,
}: {
  trigger: ReactNode;
  title: string;
  defaultValues: InvigilatorFormValues;
  teacherOptions: SelectOption[];
  action: (values: InvigilatorFormValues) => Promise<ActionResult<unknown>>;
}) {
  return (
    <EntityFormDialog
      trigger={trigger}
      title={title}
      schema={invigilatorSchema}
      defaultValues={defaultValues}
      fields={invigilatorFields(teacherOptions)}
      action={action}
    />
  );
}
