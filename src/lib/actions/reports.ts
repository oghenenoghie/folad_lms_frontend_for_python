"use server";

import { revalidatePath } from "next/cache";
import { authorizedDjangoFetch } from "@/lib/session";
import { toActionResult, type ActionResult } from "@/lib/action-result";

async function call<T>(path: string, method: string, body?: unknown): Promise<ActionResult<T>> {
  const res = await authorizedDjangoFetch(path, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  return toActionResult<T>(res);
}

// Kicks off an async export (apps.reports.services.report_service.request_report
// queues a Celery task) — the row starts "pending" and moves to "ready"/
// "failed" in the background, same shape as the report-card bulk-export
// job list: reload the page to see progress, no client-side polling.
export async function createReportRequest(input: Record<string, unknown>) {
  const result = await call("/api/v1/reports", "POST", input);
  if (result.success) revalidatePath("/reports");
  return result;
}

// A fresh presigned URL is fetched on every click rather than embedded at
// render time — same reasoning as actions/documents.ts's
// getDocumentDownloadUrl.
export async function getReportDownloadUrl(publicId: string): Promise<ActionResult<{ url: string }>> {
  return call(`/api/v1/reports/${publicId}/download`, "GET");
}
