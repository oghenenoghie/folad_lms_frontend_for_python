"use client";

import type { ReactNode } from "react";
import { EntityFormDialog } from "@/components/schools/entity-form-dialog";
import { questionSchema, questionFields, type QuestionFormValues } from "@/lib/examinations-forms";
import type { ActionResult } from "@/lib/action-result";

export function QuestionFormDialog({
  trigger,
  title,
  defaultValues,
  action,
}: {
  trigger: ReactNode;
  title: string;
  defaultValues: QuestionFormValues;
  action: (values: QuestionFormValues) => Promise<ActionResult<unknown>>;
}) {
  return (
    <EntityFormDialog
      trigger={trigger}
      title={title}
      schema={questionSchema}
      defaultValues={defaultValues}
      fields={questionFields}
      action={action}
    />
  );
}
