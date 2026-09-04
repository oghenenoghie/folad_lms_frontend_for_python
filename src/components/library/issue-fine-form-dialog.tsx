"use client";

import type { ReactNode } from "react";
import { EntityFormDialog } from "@/components/schools/entity-form-dialog";
import { issueFineSchema, issueFineFields, type IssueFineFormValues } from "@/lib/library-forms";
import type { ActionResult } from "@/lib/action-result";

export function IssueFineFormDialog({
  trigger,
  title,
  defaultValues,
  action,
}: {
  trigger: ReactNode;
  title: string;
  defaultValues: IssueFineFormValues;
  action: (values: IssueFineFormValues) => Promise<ActionResult<unknown>>;
}) {
  return (
    <EntityFormDialog
      trigger={trigger}
      title={title}
      schema={issueFineSchema}
      defaultValues={defaultValues}
      fields={issueFineFields}
      action={action}
    />
  );
}
