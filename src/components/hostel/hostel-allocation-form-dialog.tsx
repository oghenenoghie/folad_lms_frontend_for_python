"use client";

import type { ReactNode } from "react";
import { EntityFormDialog, type SelectOption } from "@/components/schools/entity-form-dialog";
import {
  hostelAllocationSchema,
  hostelAllocationFields,
  type HostelAllocationFormValues,
} from "@/lib/hostel-forms";
import type { ActionResult } from "@/lib/action-result";

export function HostelAllocationFormDialog({
  trigger,
  title,
  defaultValues,
  studentOptions,
  bedOptions,
  academicYearOptions,
  action,
}: {
  trigger: ReactNode;
  title: string;
  defaultValues: HostelAllocationFormValues;
  studentOptions: SelectOption[];
  bedOptions: SelectOption[];
  academicYearOptions: SelectOption[];
  action: (values: HostelAllocationFormValues) => Promise<ActionResult<unknown>>;
}) {
  return (
    <EntityFormDialog
      trigger={trigger}
      title={title}
      schema={hostelAllocationSchema}
      defaultValues={defaultValues}
      fields={hostelAllocationFields(studentOptions, bedOptions, academicYearOptions)}
      action={action}
    />
  );
}
