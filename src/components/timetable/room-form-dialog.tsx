"use client";

import type { ReactNode } from "react";
import { EntityFormDialog } from "@/components/schools/entity-form-dialog";
import { roomSchema, roomFields, type RoomFormValues } from "@/lib/timetable-forms";
import type { ActionResult } from "@/lib/action-result";

export function RoomFormDialog({
  trigger,
  title,
  defaultValues,
  action,
}: {
  trigger: ReactNode;
  title: string;
  defaultValues: RoomFormValues;
  action: (values: RoomFormValues) => Promise<ActionResult<unknown>>;
}) {
  return (
    <EntityFormDialog
      trigger={trigger}
      title={title}
      schema={roomSchema}
      defaultValues={defaultValues}
      fields={roomFields}
      action={action}
    />
  );
}
