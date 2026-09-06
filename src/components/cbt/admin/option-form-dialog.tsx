"use client";

import type { ReactNode } from "react";
import { EntityFormDialog } from "@/components/schools/entity-form-dialog";
import { cbtOptionSchema, cbtOptionFields, type CBTOptionFormValues } from "@/lib/cbt-forms";
import type { ActionResult } from "@/lib/action-result";

export function OptionFormDialog({
  trigger,
  title,
  defaultValues,
  action,
}: {
  trigger: ReactNode;
  title: string;
  defaultValues: CBTOptionFormValues;
  action: (values: CBTOptionFormValues) => Promise<ActionResult<unknown>>;
}) {
  return (
    <EntityFormDialog
      trigger={trigger}
      title={title}
      schema={cbtOptionSchema}
      defaultValues={defaultValues}
      fields={cbtOptionFields}
      action={action}
    />
  );
}
