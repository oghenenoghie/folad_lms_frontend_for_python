"use client";

import type { ReactNode } from "react";
import { EntityFormDialog, type SelectOption } from "@/components/schools/entity-form-dialog";
import {
  cbtExamCreateSchema,
  cbtExamCreateFields,
  type CBTExamCreateFormValues,
  cbtExamEditSchema,
  cbtExamEditFields,
  type CBTExamEditFormValues,
} from "@/lib/cbt-forms";
import type { ActionResult } from "@/lib/action-result";

export function CBTExamCreateFormDialog({
  trigger,
  title,
  defaultValues,
  schoolOptions,
  academicYearOptions,
  termOptions,
  subjectOptions,
  classLevelOptions,
  action,
}: {
  trigger: ReactNode;
  title: string;
  defaultValues: CBTExamCreateFormValues;
  schoolOptions: SelectOption[];
  academicYearOptions: SelectOption[];
  termOptions: SelectOption[];
  subjectOptions: SelectOption[];
  classLevelOptions: SelectOption[];
  action: (values: CBTExamCreateFormValues) => Promise<ActionResult<unknown>>;
}) {
  return (
    <EntityFormDialog
      trigger={trigger}
      title={title}
      schema={cbtExamCreateSchema}
      defaultValues={defaultValues}
      fields={cbtExamCreateFields(
        schoolOptions,
        academicYearOptions,
        termOptions,
        subjectOptions,
        classLevelOptions
      )}
      action={action}
    />
  );
}

export function CBTExamEditFormDialog({
  trigger,
  title,
  defaultValues,
  action,
}: {
  trigger: ReactNode;
  title: string;
  defaultValues: CBTExamEditFormValues;
  action: (values: CBTExamEditFormValues) => Promise<ActionResult<unknown>>;
}) {
  return (
    <EntityFormDialog
      trigger={trigger}
      title={title}
      schema={cbtExamEditSchema}
      defaultValues={defaultValues}
      fields={cbtExamEditFields}
      action={action}
    />
  );
}
