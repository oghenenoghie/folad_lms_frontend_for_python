"use client";

import type { ReactNode } from "react";
import { EntityFormDialog } from "@/components/schools/entity-form-dialog";
import { copySchema, copyFields, type CopyFormValues } from "@/lib/library-forms";
import type { ActionResult } from "@/lib/action-result";

export function CopyFormDialog({
  trigger,
  title,
  defaultValues,
  action,
}: {
  trigger: ReactNode;
  title: string;
  defaultValues: CopyFormValues;
  action: (values: CopyFormValues) => Promise<ActionResult<unknown>>;
}) {
  return (
    <EntityFormDialog
      trigger={trigger}
      title={title}
      schema={copySchema}
      defaultValues={defaultValues}
      fields={copyFields}
      action={action}
    />
  );
}
