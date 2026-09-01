"use client";

import type { ReactNode } from "react";
import { EntityFormDialog, type SelectOption } from "@/components/schools/entity-form-dialog";
import {
  studentCreateSchema,
  studentCreateFields,
  type StudentCreateFormValues,
  studentEditSchema,
  studentEditFields,
  type StudentEditFormValues,
} from "@/lib/student-forms";
import type { ActionResult } from "@/lib/action-result";

export function StudentCreateFormDialog({
  trigger,
  title,
  defaultValues,
  schoolOptions,
  action,
}: {
  trigger: ReactNode;
  title: string;
  defaultValues: StudentCreateFormValues;
  schoolOptions: SelectOption[];
  action: (values: StudentCreateFormValues) => Promise<ActionResult<unknown>>;
}) {
  return (
    <EntityFormDialog
      trigger={trigger}
      title={title}
      schema={studentCreateSchema}
      defaultValues={defaultValues}
      fields={studentCreateFields(schoolOptions)}
      action={action}
    />
  );
}

export function StudentEditFormDialog({
  trigger,
  title,
  defaultValues,
  action,
}: {
  trigger: ReactNode;
  title: string;
  defaultValues: StudentEditFormValues;
  action: (values: StudentEditFormValues) => Promise<ActionResult<unknown>>;
}) {
  return (
    <EntityFormDialog
      trigger={trigger}
      title={title}
      schema={studentEditSchema}
      defaultValues={defaultValues}
      fields={studentEditFields}
      action={action}
    />
  );
}
