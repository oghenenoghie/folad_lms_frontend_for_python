"use server";

import { revalidatePath } from "next/cache";
import { authorizedDjangoFetch } from "@/lib/session";
import { toActionResult, type ActionResult } from "@/lib/action-result";
import type { ReportCard, ReportCardBulkExport, ReportCardWeighting } from "@/lib/report-cards";
import { WHOLE_YEAR } from "@/lib/report-cards-forms";

async function call<T>(path: string, method: string, body?: unknown): Promise<ActionResult<T>> {
  const res = await authorizedDjangoFetch(path, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  return toActionResult<T>(res);
}

// --- Generation ---

export async function generateReportCard(
  values: { student: string; term: string }
): Promise<ActionResult<ReportCard>> {
  const result = await call<ReportCard>("/api/v1/report-cards/generate", "POST", values);
  if (result.success) revalidatePath("/report-cards");
  return result;
}

export async function generateReportCardsBulk(
  values: { term: string }
): Promise<ActionResult<{ generated: string[]; failed: { student: string; error: string }[] }>> {
  const result = await call<{ generated: string[]; failed: { student: string; error: string }[] }>(
    "/api/v1/report-cards/generate-bulk",
    "POST",
    values
  );
  if (result.success) revalidatePath("/report-cards");
  return result;
}

export async function regenerateReportCard(publicId: string): Promise<ActionResult<ReportCard>> {
  const result = await call<ReportCard>(`/api/v1/report-cards/${publicId}/regenerate`, "POST");
  if (result.success) {
    revalidatePath("/report-cards");
    revalidatePath(`/report-cards/${publicId}`);
  }
  return result;
}

// --- Workflow transitions ---

export async function publishReportCard(publicId: string): Promise<ActionResult<ReportCard>> {
  const result = await call<ReportCard>(`/api/v1/report-cards/${publicId}/publish`, "POST");
  if (result.success) {
    revalidatePath("/report-cards");
    revalidatePath(`/report-cards/${publicId}`);
  }
  return result;
}

export async function unpublishReportCard(publicId: string): Promise<ActionResult<ReportCard>> {
  const result = await call<ReportCard>(`/api/v1/report-cards/${publicId}/unpublish`, "POST");
  if (result.success) {
    revalidatePath("/report-cards");
    revalidatePath(`/report-cards/${publicId}`);
  }
  return result;
}

// --- Comments / next-term date (the only report-card fields anyone can hand-edit) ---

export async function updateReportCardComments(
  publicId: string,
  values: { teacher_comment: string; principal_comment: string; next_term_begins: string }
): Promise<ActionResult<ReportCard>> {
  const result = await call<ReportCard>(`/api/v1/report-cards/${publicId}`, "PATCH", {
    teacher_comment: values.teacher_comment,
    principal_comment: values.principal_comment,
    // An empty date input submits "" — the backend's DateField is
    // nullable but doesn't accept "" as a value, only null.
    next_term_begins: values.next_term_begins || null,
  });
  if (result.success) {
    revalidatePath("/report-cards");
    revalidatePath(`/report-cards/${publicId}`);
  }
  return result;
}

// --- Per-school weighting config ---

export async function createReportCardWeighting(
  schoolId: string,
  values: { ca_weight: string; cbt_weight: string; exam_weight: string }
): Promise<ActionResult<ReportCardWeighting>> {
  const result = await call<ReportCardWeighting>("/api/v1/report-card-weightings", "POST", {
    ...values,
    school: schoolId,
  });
  if (result.success) revalidatePath(`/schools/${schoolId}`);
  return result;
}

export async function updateReportCardWeighting(
  schoolId: string,
  publicId: string,
  values: { ca_weight: string; cbt_weight: string; exam_weight: string }
): Promise<ActionResult<ReportCardWeighting>> {
  const result = await call<ReportCardWeighting>(`/api/v1/report-card-weightings/${publicId}`, "PATCH", values);
  if (result.success) revalidatePath(`/schools/${schoolId}`);
  return result;
}

// --- Bulk export (async, ZIP of every PDF for a term/class arm) ---

export async function requestReportCardBulkExport(
  values: { term: string; class_arm: string }
): Promise<ActionResult<ReportCardBulkExport>> {
  const result = await call<ReportCardBulkExport>("/api/v1/report-cards/bulk-exports/request", "POST", {
    term: values.term,
    // WHOLE_YEAR sentinel (Radix Select disallows an empty-string item
    // value) — omitting class_arm entirely is what tells the backend
    // "every student enrolled this academic year".
    ...(values.class_arm !== WHOLE_YEAR ? { class_arm: values.class_arm } : {}),
  });
  if (result.success) revalidatePath("/report-cards");
  return result;
}
