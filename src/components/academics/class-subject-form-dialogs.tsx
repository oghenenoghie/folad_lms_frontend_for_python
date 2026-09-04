"use client";

import type { ReactNode } from "react";
import { EntityFormDialog, type SelectOption } from "@/components/schools/entity-form-dialog";
import {
  classSubjectSchema,
  classSubjectFields,
  type ClassSubjectFormValues,
  classSubjectAssignmentSchema,
  classSubjectAssignmentFields,
  type ClassSubjectAssignmentFormValues,
} from "@/lib/academics-forms";
import type { ActionResult } from "@/lib/action-result";

export function ClassSubjectFormDialog({
  trigger,
  title,
  defaultValues,
  subjectOptions,
  teacherOptions,
  action,
}: {
  trigger: ReactNode;
  title: string;
  defaultValues: ClassSubjectFormValues;
  subjectOptions: SelectOption[];
  teacherOptions: SelectOption[];
  action: (values: ClassSubjectFormValues) => Promise<ActionResult<unknown>>;
}) {
  return (
    <EntityFormDialog
      trigger={trigger}
      title={title}
      schema={classSubjectSchema}
      defaultValues={defaultValues}
      fields={classSubjectFields(subjectOptions, teacherOptions)}
      action={action}
    />
  );
}

export function ClassSubjectAssignmentFormDialog({
  trigger,
  title,
  defaultValues,
  teacherOptions,
  action,
}: {
  trigger: ReactNode;
  title: string;
  defaultValues: ClassSubjectAssignmentFormValues;
  teacherOptions: SelectOption[];
  action: (values: ClassSubjectAssignmentFormValues) => Promise<ActionResult<unknown>>;
}) {
  return (
    <EntityFormDialog
      trigger={trigger}
      title={title}
      schema={classSubjectAssignmentSchema}
      defaultValues={defaultValues}
      fields={classSubjectAssignmentFields(teacherOptions)}
      action={action}
    />
  );
}
