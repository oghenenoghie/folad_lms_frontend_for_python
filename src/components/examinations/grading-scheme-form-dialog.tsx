"use client";

import type { ReactNode } from "react";
import { EntityFormDialog } from "@/components/schools/entity-form-dialog";
import {
  gradingSchemeSchema,
  gradingSchemeFields,
  type GradingSchemeFormValues,
} from "@/lib/examinations-forms";
import type { ActionResult } from "@/lib/action-result";

export function GradingSchemeFormDialog({
  trigger,
  title,
  defaultValues,
  action,
}: {
  trigger: ReactNode;
  title: string;
  defaultValues: GradingSchemeFormValues;
  action: (values: GradingSchemeFormValues) => Promise<ActionResult<unknown>>;
}) {
  return (
    <EntityFormDialog
      trigger={trigger}
      title={title}
      schema={gradingSchemeSchema}
      defaultValues={defaultValues}
      fields={gradingSchemeFields}
      action={action}
    />
  );
}
