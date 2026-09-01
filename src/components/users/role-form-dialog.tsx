"use client";

import type { ReactNode } from "react";
import { EntityFormDialog } from "@/components/schools/entity-form-dialog";
import { roleSchema, roleFields, type RoleFormValues } from "@/lib/user-forms";
import type { ActionResult } from "@/lib/action-result";

export function RoleFormDialog({
  trigger,
  title,
  defaultValues,
  action,
}: {
  trigger: ReactNode;
  title: string;
  defaultValues: RoleFormValues;
  action: (values: RoleFormValues) => Promise<ActionResult<unknown>>;
}) {
  return (
    <EntityFormDialog
      trigger={trigger}
      title={title}
      schema={roleSchema}
      defaultValues={defaultValues}
      fields={roleFields}
      action={action}
    />
  );
}
