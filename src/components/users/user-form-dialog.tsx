"use client";

import type { ReactNode } from "react";
import { EntityFormDialog } from "@/components/schools/entity-form-dialog";
import { userSchema, userCreateFields, userEditFields, type UserFormValues } from "@/lib/user-forms";
import type { ActionResult } from "@/lib/action-result";

function UserFormDialogBase({
  trigger,
  title,
  defaultValues,
  fields,
  action,
}: {
  trigger: ReactNode;
  title: string;
  defaultValues: UserFormValues;
  fields: typeof userCreateFields;
  action: (values: UserFormValues) => Promise<ActionResult<unknown>>;
}) {
  return (
    <EntityFormDialog
      trigger={trigger}
      title={title}
      schema={userSchema}
      defaultValues={defaultValues}
      fields={fields}
      action={action}
    />
  );
}

export function UserCreateFormDialog(props: {
  trigger: ReactNode;
  title: string;
  defaultValues: UserFormValues;
  action: (values: UserFormValues) => Promise<ActionResult<unknown>>;
}) {
  return <UserFormDialogBase {...props} fields={userCreateFields} />;
}

export function UserEditFormDialog(props: {
  trigger: ReactNode;
  title: string;
  defaultValues: UserFormValues;
  action: (values: UserFormValues) => Promise<ActionResult<unknown>>;
}) {
  return <UserFormDialogBase {...props} fields={userEditFields} />;
}
