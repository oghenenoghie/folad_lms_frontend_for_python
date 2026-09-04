"use client";

import type { ReactNode } from "react";
import { EntityFormDialog, type SelectOption } from "@/components/schools/entity-form-dialog";
import {
  examScheduleCreateSchema,
  examScheduleCreateFields,
  type ExamScheduleCreateFormValues,
  examScheduleEditSchema,
  examScheduleEditFields,
  type ExamScheduleEditFormValues,
} from "@/lib/examinations-forms";
import type { ActionResult } from "@/lib/action-result";

export function ExamScheduleCreateFormDialog({
  trigger,
  title,
  defaultValues,
  classSubjectOptions,
  roomOptions,
  action,
}: {
  trigger: ReactNode;
  title: string;
  defaultValues: ExamScheduleCreateFormValues;
  classSubjectOptions: SelectOption[];
  roomOptions: SelectOption[];
  action: (values: ExamScheduleCreateFormValues) => Promise<ActionResult<unknown>>;
}) {
  return (
    <EntityFormDialog
      trigger={trigger}
      title={title}
      schema={examScheduleCreateSchema}
      defaultValues={defaultValues}
      fields={examScheduleCreateFields(classSubjectOptions, roomOptions)}
      action={action}
    />
  );
}

export function ExamScheduleEditFormDialog({
  trigger,
  title,
  defaultValues,
  roomOptions,
  action,
}: {
  trigger: ReactNode;
  title: string;
  defaultValues: ExamScheduleEditFormValues;
  roomOptions: SelectOption[];
  action: (values: ExamScheduleEditFormValues) => Promise<ActionResult<unknown>>;
}) {
  return (
    <EntityFormDialog
      trigger={trigger}
      title={title}
      schema={examScheduleEditSchema}
      defaultValues={defaultValues}
      fields={examScheduleEditFields(roomOptions)}
      action={action}
    />
  );
}
