"use client";

import type { ReactNode } from "react";
import { EntityFormDialog, type SelectOption } from "@/components/schools/entity-form-dialog";
import { cbtTopicSchema, cbtTopicFields, type CBTTopicFormValues } from "@/lib/cbt-forms";
import type { ActionResult } from "@/lib/action-result";

export function TopicFormDialog({
  trigger,
  title,
  defaultValues,
  subjectOptions,
  action,
}: {
  trigger: ReactNode;
  title: string;
  defaultValues: CBTTopicFormValues;
  subjectOptions: SelectOption[];
  action: (values: CBTTopicFormValues) => Promise<ActionResult<unknown>>;
}) {
  return (
    <EntityFormDialog
      trigger={trigger}
      title={title}
      schema={cbtTopicSchema}
      defaultValues={defaultValues}
      fields={cbtTopicFields(subjectOptions)}
      action={action}
    />
  );
}
