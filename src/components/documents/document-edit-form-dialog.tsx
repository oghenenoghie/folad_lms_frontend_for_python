"use client";

import type { ReactNode } from "react";
import { EntityFormDialog } from "@/components/schools/entity-form-dialog";
import { documentEditSchema, documentEditFields, type DocumentEditFormValues } from "@/lib/documents-forms";
import type { ActionResult } from "@/lib/action-result";

export function DocumentEditFormDialog({
  trigger,
  title,
  defaultValues,
  action,
}: {
  trigger: ReactNode;
  title: string;
  defaultValues: DocumentEditFormValues;
  action: (values: DocumentEditFormValues) => Promise<ActionResult<unknown>>;
}) {
  return (
    <EntityFormDialog
      trigger={trigger}
      title={title}
      schema={documentEditSchema}
      defaultValues={defaultValues}
      fields={documentEditFields}
      action={action}
    />
  );
}
