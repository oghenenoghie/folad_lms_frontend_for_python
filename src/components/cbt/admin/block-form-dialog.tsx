"use client";

import type { ReactNode } from "react";
import { EntityFormDialog } from "@/components/schools/entity-form-dialog";
import { cbtBlockSchema, cbtBlockFields, type CBTBlockFormValues } from "@/lib/cbt-forms";
import type { ActionResult } from "@/lib/action-result";

export function BlockFormDialog({
  trigger,
  title,
  defaultValues,
  action,
}: {
  trigger: ReactNode;
  title: string;
  defaultValues: CBTBlockFormValues;
  action: (values: CBTBlockFormValues) => Promise<ActionResult<unknown>>;
}) {
  return (
    <EntityFormDialog
      trigger={trigger}
      title={title}
      description="Only paragraph/heading/callout blocks are editable here — richer content (images, equations, tables) isn't supported by this editor yet."
      schema={cbtBlockSchema}
      defaultValues={defaultValues}
      fields={cbtBlockFields}
      action={action}
    />
  );
}
