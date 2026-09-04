"use client";

import type { ReactNode } from "react";
import { EntityFormDialog } from "@/components/schools/entity-form-dialog";
import { hostelRoomSchema, hostelRoomFields, type HostelRoomFormValues } from "@/lib/hostel-forms";
import type { ActionResult } from "@/lib/action-result";

export function HostelRoomFormDialog({
  trigger,
  title,
  defaultValues,
  action,
}: {
  trigger: ReactNode;
  title: string;
  defaultValues: HostelRoomFormValues;
  action: (values: HostelRoomFormValues) => Promise<ActionResult<unknown>>;
}) {
  return (
    <EntityFormDialog
      trigger={trigger}
      title={title}
      schema={hostelRoomSchema}
      defaultValues={defaultValues}
      fields={hostelRoomFields}
      action={action}
    />
  );
}
