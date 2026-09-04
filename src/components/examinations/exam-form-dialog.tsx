"use client";

import type { ReactNode } from "react";
import { EntityFormDialog, type SelectOption } from "@/components/schools/entity-form-dialog";
import {
  examCreateSchema,
  examCreateFields,
  type ExamCreateFormValues,
  examEditSchema,
  examEditFields,
  type ExamEditFormValues,
} from "@/lib/examinations-forms";
import type { ActionResult } from "@/lib/action-result";

export function ExamCreateFormDialog({
  trigger,
  title,
  defaultValues,
  termOptions,
  action,
}: {
  trigger: ReactNode;
  title: string;
  defaultValues: ExamCreateFormValues;
  termOptions: SelectOption[];
  action: (values: ExamCreateFormValues) => Promise<ActionResult<unknown>>;
}) {
  return (
    <EntityFormDialog
      trigger={trigger}
      title={title}
      schema={examCreateSchema}
      defaultValues={defaultValues}
      fields={examCreateFields(termOptions)}
      action={action}
    />
  );
}

export function ExamEditFormDialog({
  trigger,
  title,
  defaultValues,
  action,
}: {
  trigger: ReactNode;
  title: string;
  defaultValues: ExamEditFormValues;
  action: (values: ExamEditFormValues) => Promise<ActionResult<unknown>>;
}) {
  return (
    <EntityFormDialog
      trigger={trigger}
      title={title}
      schema={examEditSchema}
      defaultValues={defaultValues}
      fields={examEditFields}
      action={action}
    />
  );
}
