"use client";

import type { ReactNode } from "react";
import { EntityFormDialog, type SelectOption } from "@/components/schools/entity-form-dialog";
import {
  cbtExamQuestionSchema,
  cbtExamQuestionFields,
  type CBTExamQuestionFormValues,
} from "@/lib/cbt-forms";
import type { ActionResult } from "@/lib/action-result";

export function ExamQuestionFormDialog({
  trigger,
  title,
  defaultValues,
  questionOptions,
  sectionOptions,
  action,
}: {
  trigger: ReactNode;
  title: string;
  defaultValues: CBTExamQuestionFormValues;
  questionOptions: SelectOption[];
  sectionOptions: SelectOption[];
  action: (values: CBTExamQuestionFormValues) => Promise<ActionResult<unknown>>;
}) {
  return (
    <EntityFormDialog
      trigger={trigger}
      title={title}
      description="Only approved (or published) bank questions can be attached to an exam."
      schema={cbtExamQuestionSchema}
      defaultValues={defaultValues}
      fields={cbtExamQuestionFields(questionOptions, sectionOptions)}
      action={action}
    />
  );
}
