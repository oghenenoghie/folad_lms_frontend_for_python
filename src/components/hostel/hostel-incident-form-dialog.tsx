"use client";

import type { ReactNode } from "react";
import { EntityFormDialog, type SelectOption } from "@/components/schools/entity-form-dialog";
import {
  hostelIncidentSchema,
  hostelIncidentFields,
  type HostelIncidentFormValues,
  hostelIncidentEditSchema,
  hostelIncidentEditFields,
  type HostelIncidentEditFormValues,
} from "@/lib/hostel-forms";
import type { ActionResult } from "@/lib/action-result";

export function HostelIncidentFormDialog({
  trigger,
  title,
  defaultValues,
  hostelOptions,
  roomOptions,
  studentOptions,
  action,
}: {
  trigger: ReactNode;
  title: string;
  defaultValues: HostelIncidentFormValues;
  hostelOptions: SelectOption[];
  roomOptions: SelectOption[];
  studentOptions: SelectOption[];
  action: (values: HostelIncidentFormValues) => Promise<ActionResult<unknown>>;
}) {
  return (
    <EntityFormDialog
      trigger={trigger}
      title={title}
      schema={hostelIncidentSchema}
      defaultValues={defaultValues}
      fields={hostelIncidentFields(hostelOptions, roomOptions, studentOptions)}
      action={action}
    />
  );
}

export function HostelIncidentEditFormDialog({
  trigger,
  title,
  defaultValues,
  roomOptions,
  studentOptions,
  action,
}: {
  trigger: ReactNode;
  title: string;
  defaultValues: HostelIncidentEditFormValues;
  roomOptions: SelectOption[];
  studentOptions: SelectOption[];
  action: (values: HostelIncidentEditFormValues) => Promise<ActionResult<unknown>>;
}) {
  return (
    <EntityFormDialog
      trigger={trigger}
      title={title}
      schema={hostelIncidentEditSchema}
      defaultValues={defaultValues}
      fields={hostelIncidentEditFields(roomOptions, studentOptions)}
      action={action}
    />
  );
}
