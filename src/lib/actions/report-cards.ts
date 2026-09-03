"use server";

import { revalidatePath } from "next/cache";
import { authorizedDjangoFetch } from "@/lib/session";
import { toActionResult, type ActionResult } from "@/lib/action-result";
import type { ReportCard, ReportCardWeighting } from "@/lib/report-cards";

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
