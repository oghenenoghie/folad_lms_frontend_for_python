"use client";

import type { ReactNode } from "react";
import { EntityFormDialog } from "@/components/schools/entity-form-dialog";
import { routeStopSchema, routeStopFields, type RouteStopFormValues } from "@/lib/transport-forms";
import type { ActionResult } from "@/lib/action-result";

export function RouteStopFormDialog({
  trigger,
  title,
  defaultValues,
  action,
}: {
  trigger: ReactNode;
  title: string;
  defaultValues: RouteStopFormValues;
  action: (values: RouteStopFormValues) => Promise<ActionResult<unknown>>;
}) {
  return (
    <EntityFormDialog
      trigger={trigger}
      title={title}
      schema={routeStopSchema}
      defaultValues={defaultValues}
      fields={routeStopFields}
      action={action}
    />
  );
}
