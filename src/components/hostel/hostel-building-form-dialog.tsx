"use client";

import type { ReactNode } from "react";
import { EntityFormDialog } from "@/components/schools/entity-form-dialog";
import {
  hostelBuildingSchema,
  hostelBuildingFields,
  type HostelBuildingFormValues,
} from "@/lib/hostel-forms";
import type { ActionResult } from "@/lib/action-result";

export function HostelBuildingFormDialog({
  trigger,
  title,
  defaultValues,
  action,
}: {
  trigger: ReactNode;
  title: string;
  defaultValues: HostelBuildingFormValues;
  action: (values: HostelBuildingFormValues) => Promise<ActionResult<unknown>>;
}) {
  return (
    <EntityFormDialog
      trigger={trigger}
      title={title}
      schema={hostelBuildingSchema}
      defaultValues={defaultValues}
      fields={hostelBuildingFields}
      action={action}
    />
  );
}
