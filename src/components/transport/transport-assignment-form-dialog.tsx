"use client";

import type { ReactNode } from "react";
import { EntityFormDialog, type SelectOption } from "@/components/schools/entity-form-dialog";
import {
  transportAssignmentSchema,
  transportAssignmentFields,
  type TransportAssignmentFormValues,
} from "@/lib/transport-forms";
import type { ActionResult } from "@/lib/action-result";

export function TransportAssignmentFormDialog({
  trigger,
  title,
  defaultValues,
  studentOptions,
  vehicleOptions,
  routeOptions,
  stopOptions,
  academicYearOptions,
  action,
}: {
  trigger: ReactNode;
  title: string;
  defaultValues: TransportAssignmentFormValues;
  studentOptions: SelectOption[];
  vehicleOptions: SelectOption[];
  routeOptions: SelectOption[];
  stopOptions: SelectOption[];
  academicYearOptions: SelectOption[];
  action: (values: TransportAssignmentFormValues) => Promise<ActionResult<unknown>>;
}) {
  return (
    <EntityFormDialog
      trigger={trigger}
      title={title}
      schema={transportAssignmentSchema}
      defaultValues={defaultValues}
      fields={transportAssignmentFields(studentOptions, vehicleOptions, routeOptions, stopOptions, academicYearOptions)}
      action={action}
    />
  );
}
