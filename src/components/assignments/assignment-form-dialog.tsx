"use client";

import type { ReactNode } from "react";
import { EntityFormDialog, type SelectOption } from "@/components/schools/entity-form-dialog";
import {
  assignmentCreateSchema,
  assignmentCreateFields,
  type AssignmentCreateFormValues,
  assignmentEditSchema,
  assignmentEditFields,
  type AssignmentEditFormValues,
} from "@/lib/assignments-forms";
import type { ActionResult } from "@/lib/action-result";

export function AssignmentCreateFormDialog({
  trigger,
  title,
  defaultValues,
  classSubjectOptions,
  termOptions,
  action,
}: {
  trigger: ReactNode;
  title: string;
  defaultValues: AssignmentCreateFormValues;
  classSubjectOptions: SelectOption[];
  termOptions: SelectOption[];
  action: (values: AssignmentCreateFormValues) => Promise<ActionResult<unknown>>;
}) {
  return (
    <EntityFormDialog
      trigger={trigger}
      title={title}
      schema={assignmentCreateSchema}
      defaultValues={defaultValues}
      fields={assignmentCreateFields(classSubjectOptions, termOptions)}
      action={action}
    />
  );
}

export function AssignmentEditFormDialog({
  trigger,
  title,
  defaultValues,
  action,
}: {
  trigger: ReactNode;
  title: string;
  defaultValues: AssignmentEditFormValues;
  action: (values: AssignmentEditFormValues) => Promise<ActionResult<unknown>>;
}) {
  return (
    <EntityFormDialog
      trigger={trigger}
      title={title}
      schema={assignmentEditSchema}
      defaultValues={defaultValues}
      fields={assignmentEditFields}
      action={action}
    />
  );
}
