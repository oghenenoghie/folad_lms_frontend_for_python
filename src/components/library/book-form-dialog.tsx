"use client";

import type { ReactNode } from "react";
import { EntityFormDialog } from "@/components/schools/entity-form-dialog";
import { bookSchema, bookFields, type BookFormValues } from "@/lib/library-forms";
import type { ActionResult } from "@/lib/action-result";

export function BookFormDialog({
  trigger,
  title,
  defaultValues,
  action,
}: {
  trigger: ReactNode;
  title: string;
  defaultValues: BookFormValues;
  action: (values: BookFormValues) => Promise<ActionResult<unknown>>;
}) {
  return (
    <EntityFormDialog
      trigger={trigger}
      title={title}
      schema={bookSchema}
      defaultValues={defaultValues}
      fields={bookFields}
      action={action}
    />
  );
}
