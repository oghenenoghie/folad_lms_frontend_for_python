"use client";

import type { ReactNode } from "react";
import { EntityFormDialog } from "@/components/schools/entity-form-dialog";
import {
  transportRouteSchema,
  transportRouteFields,
  type TransportRouteFormValues,
} from "@/lib/transport-forms";
import type { ActionResult } from "@/lib/action-result";

export function TransportRouteFormDialog({
  trigger,
  title,
  defaultValues,
  action,
}: {
  trigger: ReactNode;
  title: string;
  defaultValues: TransportRouteFormValues;
  action: (values: TransportRouteFormValues) => Promise<ActionResult<unknown>>;
}) {
  return (
    <EntityFormDialog
      trigger={trigger}
      title={title}
      schema={transportRouteSchema}
      defaultValues={defaultValues}
      fields={transportRouteFields}
      action={action}
    />
  );
}
