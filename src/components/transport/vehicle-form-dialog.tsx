"use client";

import type { ReactNode } from "react";
import { EntityFormDialog } from "@/components/schools/entity-form-dialog";
import { vehicleSchema, vehicleFields, type VehicleFormValues } from "@/lib/transport-forms";
import type { ActionResult } from "@/lib/action-result";

export function VehicleFormDialog({
  trigger,
  title,
  defaultValues,
  action,
}: {
  trigger: ReactNode;
  title: string;
  defaultValues: VehicleFormValues;
  action: (values: VehicleFormValues) => Promise<ActionResult<unknown>>;
}) {
  return (
    <EntityFormDialog
      trigger={trigger}
      title={title}
      schema={vehicleSchema}
      defaultValues={defaultValues}
      fields={vehicleFields}
      action={action}
    />
  );
}
