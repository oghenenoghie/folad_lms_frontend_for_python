"use client";

import type { ReactNode } from "react";
import { EntityFormDialog, type SelectOption } from "@/components/schools/entity-form-dialog";
import {
  requestReportCardSchema,
  requestReportCardFields,
  type RequestReportCardFormValues,
} from "@/lib/report-cards-forms";
import type { ActionResult } from "@/lib/action-result";

export function RequestReportCardDialog({
  trigger,
  title,
  termOptions,
  action,
}: {
  trigger: ReactNode;
  title: string;
  termOptions: SelectOption[];
  action: (values: RequestReportCardFormValues) => Promise<ActionResult<unknown>>;
}) {
  return (
    <EntityFormDialog
      trigger={trigger}
      title={title}
      schema={requestReportCardSchema}
      defaultValues={{ term: "" }}
      fields={requestReportCardFields(termOptions)}
      action={action}
    />
  );
}
