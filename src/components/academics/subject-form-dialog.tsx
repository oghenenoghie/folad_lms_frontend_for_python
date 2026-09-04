"use client";

import type { ReactNode } from "react";
import { EntityFormDialog } from "@/components/schools/entity-form-dialog";
import { subjectSchema, subjectFields, type SubjectFormValues } from "@/lib/academics-forms";
import type { ActionResult } from "@/lib/action-result";

export function SubjectFormDialog({
  trigger,
  title,
  defaultValues,
  action,
}: {
  trigger: ReactNode;
  title: string;
  defaultValues: SubjectFormValues;
  action: (values: SubjectFormValues) => Promise<ActionResult<unknown>>;
}) {
  return (
    <EntityFormDialog
      trigger={trigger}
      title={title}
      schema={subjectSchema}
      defaultValues={defaultValues}
      fields={subjectFields}
      action={action}
    />
  );
}
