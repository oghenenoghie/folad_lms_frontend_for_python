"use client";

import type { ReactNode } from "react";
import { EntityFormDialog } from "@/components/schools/entity-form-dialog";
import { gradeAnswerSchema, gradeAnswerFields, type GradeAnswerFormValues } from "@/lib/examinations-forms";
import type { ActionResult } from "@/lib/action-result";

export function GradeAnswerDialog({
  trigger,
  title,
  description,
  defaultValues,
  action,
}: {
  trigger: ReactNode;
  title: string;
  description?: string;
  defaultValues: GradeAnswerFormValues;
  action: (values: GradeAnswerFormValues) => Promise<ActionResult<unknown>>;
}) {
  return (
    <EntityFormDialog
      trigger={trigger}
      title={title}
      description={description}
      schema={gradeAnswerSchema}
      defaultValues={defaultValues}
      fields={gradeAnswerFields}
      action={action}
    />
  );
}
