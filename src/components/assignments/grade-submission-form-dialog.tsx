"use client";

import type { ReactNode } from "react";
import { EntityFormDialog } from "@/components/schools/entity-form-dialog";
import {
  gradeSubmissionSchema,
  gradeSubmissionFields,
  type GradeSubmissionFormValues,
} from "@/lib/assignments-forms";
import type { ActionResult } from "@/lib/action-result";

export function GradeSubmissionFormDialog({
  trigger,
  title,
  defaultValues,
  action,
}: {
  trigger: ReactNode;
  title: string;
  defaultValues: GradeSubmissionFormValues;
  action: (values: GradeSubmissionFormValues) => Promise<ActionResult<unknown>>;
}) {
  return (
    <EntityFormDialog
      trigger={trigger}
      title={title}
      schema={gradeSubmissionSchema}
      defaultValues={defaultValues}
      fields={gradeSubmissionFields}
      action={action}
    />
  );
}
