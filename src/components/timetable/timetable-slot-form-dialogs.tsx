"use client";

import type { ReactNode } from "react";
import { EntityFormDialog, type SelectOption } from "@/components/schools/entity-form-dialog";
import {
  timetableSlotCreateSchema,
  timetableSlotCreateFields,
  type TimetableSlotCreateFormValues,
  timetableSlotEditSchema,
  timetableSlotEditFields,
  type TimetableSlotEditFormValues,
} from "@/lib/timetable-forms";
import type { ActionResult } from "@/lib/action-result";

export function TimetableSlotCreateFormDialog({
  trigger,
  title,
  defaultValues,
  classSubjectOptions,
  roomOptions,
  action,
}: {
  trigger: ReactNode;
  title: string;
  defaultValues: TimetableSlotCreateFormValues;
  classSubjectOptions: SelectOption[];
  roomOptions: SelectOption[];
  action: (values: TimetableSlotCreateFormValues) => Promise<ActionResult<unknown>>;
}) {
  return (
    <EntityFormDialog
      trigger={trigger}
      title={title}
      schema={timetableSlotCreateSchema}
      defaultValues={defaultValues}
      fields={timetableSlotCreateFields(classSubjectOptions, roomOptions)}
      action={action}
    />
  );
}

export function TimetableSlotEditFormDialog({
  trigger,
  title,
  defaultValues,
  roomOptions,
  action,
}: {
  trigger: ReactNode;
  title: string;
  defaultValues: TimetableSlotEditFormValues;
  roomOptions: SelectOption[];
  action: (values: TimetableSlotEditFormValues) => Promise<ActionResult<unknown>>;
}) {
  return (
    <EntityFormDialog
      trigger={trigger}
      title={title}
      schema={timetableSlotEditSchema}
      defaultValues={defaultValues}
      fields={timetableSlotEditFields(roomOptions)}
      action={action}
    />
  );
}
