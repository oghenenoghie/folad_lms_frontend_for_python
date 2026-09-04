"use client";

import type { ReactNode } from "react";
import { EntityFormDialog, type SelectOption } from "@/components/schools/entity-form-dialog";
import { hostelSchema, hostelFields, type HostelFormValues } from "@/lib/hostel-forms";
import type { ActionResult } from "@/lib/action-result";

export function HostelFormDialog({
  trigger,
  title,
  defaultValues,
  wardenOptions,
  action,
}: {
  trigger: ReactNode;
  title: string;
  defaultValues: HostelFormValues;
  wardenOptions: SelectOption[];
  action: (values: HostelFormValues) => Promise<ActionResult<unknown>>;
}) {
  return (
    <EntityFormDialog
      trigger={trigger}
      title={title}
      schema={hostelSchema}
      defaultValues={defaultValues}
      fields={hostelFields(wardenOptions)}
      action={action}
    />
  );
}
