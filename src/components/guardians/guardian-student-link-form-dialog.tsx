"use client";

import type { ReactNode } from "react";
import { EntityFormDialog, type SelectOption } from "@/components/schools/entity-form-dialog";
import {
  guardianStudentLinkCreateSchema,
  guardianStudentLinkCreateFields,
  type GuardianStudentLinkCreateFormValues,
  guardianStudentLinkEditSchema,
  guardianStudentLinkEditFields,
  type GuardianStudentLinkEditFormValues,
} from "@/lib/guardian-forms";
import type { ActionResult } from "@/lib/action-result";

export function GuardianStudentLinkCreateFormDialog({
  trigger,
  title,
  defaultValues,
  studentOptions,
  action,
}: {
  trigger: ReactNode;
  title: string;
  defaultValues: GuardianStudentLinkCreateFormValues;
  studentOptions: SelectOption[];
  action: (values: GuardianStudentLinkCreateFormValues) => Promise<ActionResult<unknown>>;
}) {
  return (
    <EntityFormDialog
      trigger={trigger}
      title={title}
      schema={guardianStudentLinkCreateSchema}
      defaultValues={defaultValues}
      fields={guardianStudentLinkCreateFields(studentOptions)}
      action={action}
    />
  );
}

export function GuardianStudentLinkEditFormDialog({
  trigger,
  title,
  defaultValues,
  action,
}: {
  trigger: ReactNode;
  title: string;
  defaultValues: GuardianStudentLinkEditFormValues;
  action: (values: GuardianStudentLinkEditFormValues) => Promise<ActionResult<unknown>>;
}) {
  return (
    <EntityFormDialog
      trigger={trigger}
      title={title}
      schema={guardianStudentLinkEditSchema}
      defaultValues={defaultValues}
      fields={guardianStudentLinkEditFields}
      action={action}
    />
  );
}
