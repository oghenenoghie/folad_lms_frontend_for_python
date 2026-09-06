"use client";

import type { ReactNode } from "react";
import { EntityFormDialog } from "@/components/schools/entity-form-dialog";
import {
  cbtExamSectionSchema,
  cbtExamSectionFields,
  type CBTExamSectionFormValues,
} from "@/lib/cbt-forms";
import type { ActionResult } from "@/lib/action-result";

export function ExamSectionFormDialog({
  trigger,
  title,
  defaultValues,
  action,
}: {
  trigger: ReactNode;
  title: string;
  defaultValues: CBTExamSectionFormValues;
  action: (values: CBTExamSectionFormValues) => Promise<ActionResult<unknown>>;
}) {
  return (
    <EntityFormDialog
      trigger={trigger}
      title={title}
      schema={cbtExamSectionSchema}
      defaultValues={defaultValues}
      fields={cbtExamSectionFields}
      action={action}
    />
  );
}
