"use client";

import type { ReactNode } from "react";
import { EntityFormDialog, type SelectOption } from "@/components/schools/entity-form-dialog";
import {
  studentMemberSchema,
  studentMemberFields,
  type StudentMemberFormValues,
  staffMemberSchema,
  staffMemberFields,
  type StaffMemberFormValues,
  memberActiveSchema,
  memberActiveFields,
  type MemberActiveFormValues,
} from "@/lib/library-forms";
import type { ActionResult } from "@/lib/action-result";

export function StudentMemberFormDialog({
  trigger,
  title,
  defaultValues,
  studentOptions,
  action,
}: {
  trigger: ReactNode;
  title: string;
  defaultValues: StudentMemberFormValues;
  studentOptions: SelectOption[];
  action: (values: StudentMemberFormValues) => Promise<ActionResult<unknown>>;
}) {
  return (
    <EntityFormDialog
      trigger={trigger}
      title={title}
      schema={studentMemberSchema}
      defaultValues={defaultValues}
      fields={studentMemberFields(studentOptions)}
      action={action}
    />
  );
}

export function StaffMemberFormDialog({
  trigger,
  title,
  defaultValues,
  staffOptions,
  action,
}: {
  trigger: ReactNode;
  title: string;
  defaultValues: StaffMemberFormValues;
  staffOptions: SelectOption[];
  action: (values: StaffMemberFormValues) => Promise<ActionResult<unknown>>;
}) {
  return (
    <EntityFormDialog
      trigger={trigger}
      title={title}
      schema={staffMemberSchema}
      defaultValues={defaultValues}
      fields={staffMemberFields(staffOptions)}
      action={action}
    />
  );
}

export function MemberActiveFormDialog({
  trigger,
  title,
  defaultValues,
  action,
}: {
  trigger: ReactNode;
  title: string;
  defaultValues: MemberActiveFormValues;
  action: (values: MemberActiveFormValues) => Promise<ActionResult<unknown>>;
}) {
  return (
    <EntityFormDialog
      trigger={trigger}
      title={title}
      schema={memberActiveSchema}
      defaultValues={defaultValues}
      fields={memberActiveFields}
      action={action}
    />
  );
}
