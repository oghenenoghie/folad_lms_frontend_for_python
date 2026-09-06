"use client";

import type { ReactNode } from "react";
import { EntityFormDialog, type SelectOption } from "@/components/schools/entity-form-dialog";
import {
  cbtExamCandidateSchema,
  cbtExamCandidateFields,
  type CBTExamCandidateFormValues,
  cbtExamCandidatesFromClassArmSchema,
  cbtExamCandidatesFromClassArmFields,
  type CBTExamCandidatesFromClassArmFormValues,
} from "@/lib/cbt-forms";
import type { ActionResult } from "@/lib/action-result";

export function ExamCandidateFormDialog({
  trigger,
  title,
  defaultValues,
  studentOptions,
  action,
}: {
  trigger: ReactNode;
  title: string;
  defaultValues: CBTExamCandidateFormValues;
  studentOptions: SelectOption[];
  action: (values: CBTExamCandidateFormValues) => Promise<ActionResult<unknown>>;
}) {
  return (
    <EntityFormDialog
      trigger={trigger}
      title={title}
      schema={cbtExamCandidateSchema}
      defaultValues={defaultValues}
      fields={cbtExamCandidateFields(studentOptions)}
      action={action}
    />
  );
}

export function ExamCandidatesFromClassArmFormDialog({
  trigger,
  title,
  defaultValues,
  classArmOptions,
  academicYearOptions,
  action,
}: {
  trigger: ReactNode;
  title: string;
  defaultValues: CBTExamCandidatesFromClassArmFormValues;
  classArmOptions: SelectOption[];
  academicYearOptions: SelectOption[];
  action: (values: CBTExamCandidatesFromClassArmFormValues) => Promise<ActionResult<unknown>>;
}) {
  return (
    <EntityFormDialog
      trigger={trigger}
      title={title}
      description="Adds every currently-enrolled student in this class arm as a candidate."
      schema={cbtExamCandidatesFromClassArmSchema}
      defaultValues={defaultValues}
      fields={cbtExamCandidatesFromClassArmFields(classArmOptions, academicYearOptions)}
      action={action}
    />
  );
}
