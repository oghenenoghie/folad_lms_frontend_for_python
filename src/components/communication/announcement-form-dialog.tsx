"use client";

import type { ReactNode } from "react";
import { EntityFormDialog } from "@/components/schools/entity-form-dialog";
import {
  announcementSchema,
  announcementFields,
  type AnnouncementFormValues,
} from "@/lib/communication-forms";
import type { ActionResult } from "@/lib/action-result";

export function AnnouncementFormDialog({
  trigger,
  title,
  defaultValues,
  action,
}: {
  trigger: ReactNode;
  title: string;
  defaultValues: AnnouncementFormValues;
  action: (values: AnnouncementFormValues) => Promise<ActionResult<unknown>>;
}) {
  return (
    <EntityFormDialog
      trigger={trigger}
      title={title}
      schema={announcementSchema}
      defaultValues={defaultValues}
      fields={announcementFields}
      action={action}
    />
  );
}
