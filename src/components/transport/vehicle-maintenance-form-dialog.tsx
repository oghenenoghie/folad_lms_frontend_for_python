"use client";

import type { ReactNode } from "react";
import { EntityFormDialog } from "@/components/schools/entity-form-dialog";
import {
  vehicleMaintenanceSchema,
  vehicleMaintenanceFields,
  type VehicleMaintenanceFormValues,
} from "@/lib/transport-forms";
import type { ActionResult } from "@/lib/action-result";

export function VehicleMaintenanceFormDialog({
  trigger,
  title,
  defaultValues,
  action,
}: {
  trigger: ReactNode;
  title: string;
  defaultValues: VehicleMaintenanceFormValues;
  action: (values: VehicleMaintenanceFormValues) => Promise<ActionResult<unknown>>;
}) {
  return (
    <EntityFormDialog
      trigger={trigger}
      title={title}
      schema={vehicleMaintenanceSchema}
      defaultValues={defaultValues}
      fields={vehicleMaintenanceFields}
      action={action}
    />
  );
}
