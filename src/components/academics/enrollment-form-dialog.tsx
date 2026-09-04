"use client";

import type { ReactNode } from "react";
import { EntityFormDialog, type SelectOption } from "@/components/schools/entity-form-dialog";
import { enrollmentSchema, enrollmentFields, type EnrollmentFormValues } from "@/lib/academics-forms";
import type { ActionResult } from "@/lib/action-result";

export function EnrollmentFormDialog({
  trigger,
  title,
  defaultValues,
  classArmOptions,
  academicYearOptions,
  action,
}: {
  trigger: ReactNode;
  title: string;
  defaultValues: EnrollmentFormValues;
  classArmOptions: SelectOption[];
  academicYearOptions: SelectOption[];
  action: (values: EnrollmentFormValues) => Promise<ActionResult<unknown>>;
}) {
  return (
    <EntityFormDialog
      trigger={trigger}
      title={title}
      schema={enrollmentSchema}
      defaultValues={defaultValues}
      fields={enrollmentFields(classArmOptions, academicYearOptions)}
      action={action}
    />
  );
}
