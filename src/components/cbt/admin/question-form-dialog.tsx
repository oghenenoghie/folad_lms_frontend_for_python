"use client";

import type { ReactNode } from "react";
import { EntityFormDialog, type SelectOption } from "@/components/schools/entity-form-dialog";
import { cbtQuestionSchema, cbtQuestionFields, type CBTQuestionFormValues } from "@/lib/cbt-forms";
import type { ActionResult } from "@/lib/action-result";

export function QuestionFormDialog({
  trigger,
  title,
  defaultValues,
  subjectOptions,
  classLevelOptions,
  topicOptions,
  action,
}: {
  trigger: ReactNode;
  title: string;
  defaultValues: CBTQuestionFormValues;
  subjectOptions: SelectOption[];
  classLevelOptions: SelectOption[];
  topicOptions: SelectOption[];
  action: (values: CBTQuestionFormValues) => Promise<ActionResult<unknown>>;
}) {
  return (
    <EntityFormDialog
      trigger={trigger}
      title={title}
      description="A question's content (text, options) is added separately below, once the shell is saved."
      schema={cbtQuestionSchema}
      defaultValues={defaultValues}
      fields={cbtQuestionFields(subjectOptions, classLevelOptions, topicOptions)}
      action={action}
    />
  );
}
