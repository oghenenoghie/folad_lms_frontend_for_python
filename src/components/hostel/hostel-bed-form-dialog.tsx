"use client";

import type { ReactNode } from "react";
import { EntityFormDialog } from "@/components/schools/entity-form-dialog";
import { hostelBedSchema, hostelBedFields, type HostelBedFormValues } from "@/lib/hostel-forms";
import type { ActionResult } from "@/lib/action-result";

export function HostelBedFormDialog({
  trigger,
  title,
  defaultValues,
  action,
}: {
  trigger: ReactNode;
  title: string;
  defaultValues: HostelBedFormValues;
  action: (values: HostelBedFormValues) => Promise<ActionResult<unknown>>;
}) {
  return (
    <EntityFormDialog
      trigger={trigger}
      title={title}
      schema={hostelBedSchema}
      defaultValues={defaultValues}
      fields={hostelBedFields}
      action={action}
    />
  );
}
