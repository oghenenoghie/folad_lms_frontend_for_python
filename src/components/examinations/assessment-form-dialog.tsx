"use client";

import type { ReactNode } from "react";
import { EntityFormDialog, type SelectOption } from "@/components/schools/entity-form-dialog";
import {
  assessmentCreateSchema,
  assessmentCreateFields,
  type AssessmentCreateFormValues,
  assessmentEditSchema,
  assessmentEditFields,
  type AssessmentEditFormValues,
} from "@/lib/examinations-forms";
import type { ActionResult } from "@/lib/action-result";

export function AssessmentCreateFormDialog({
  trigger,
  title,
  defaultValues,
  classSubjectOptions,
  termOptions,
  action,
}: {
  trigger: ReactNode;
  title: string;
  defaultValues: AssessmentCreateFormValues;
  classSubjectOptions: SelectOption[];
  termOptions: SelectOption[];
  action: (values: AssessmentCreateFormValues) => Promise<ActionResult<unknown>>;
}) {
  return (
    <EntityFormDialog
      trigger={trigger}
      title={title}
      schema={assessmentCreateSchema}
      defaultValues={defaultValues}
      fields={assessmentCreateFields(classSubjectOptions, termOptions)}
      action={action}
    />
  );
}

export function AssessmentEditFormDialog({
  trigger,
  title,
  defaultValues,
  action,
}: {
  trigger: ReactNode;
  title: string;
  defaultValues: AssessmentEditFormValues;
  action: (values: AssessmentEditFormValues) => Promise<ActionResult<unknown>>;
}) {
  return (
    <EntityFormDialog
      trigger={trigger}
      title={title}
      schema={assessmentEditSchema}
      defaultValues={defaultValues}
      fields={assessmentEditFields}
      action={action}
    />
  );
}
