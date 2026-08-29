"use client";

import type { ReactNode } from "react";
import { EntityFormDialog } from "@/components/schools/entity-form-dialog";
import {
  questionOptionSchema,
  questionOptionFields,
  type QuestionOptionFormValues,
} from "@/lib/examinations-forms";
import type { ActionResult } from "@/lib/action-result";

export function QuestionOptionFormDialog({
  trigger,
  title,
  defaultValues,
  action,
}: {
  trigger: ReactNode;
  title: string;
  defaultValues: QuestionOptionFormValues;
  action: (values: QuestionOptionFormValues) => Promise<ActionResult<unknown>>;
}) {
  return (
    <EntityFormDialog
      trigger={trigger}
      title={title}
      schema={questionOptionSchema}
      defaultValues={defaultValues}
      fields={questionOptionFields}
      action={action}
    />
  );
}
