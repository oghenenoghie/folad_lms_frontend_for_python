"use server";

import { revalidatePath } from "next/cache";
import { authorizedDjangoFetch } from "@/lib/session";
import { toActionResult, type ActionResult } from "@/lib/action-result";
import type { DocumentOwnerType } from "@/lib/documents";

async function call<T>(path: string, method: string, body?: unknown): Promise<ActionResult<T>> {
  const res = await authorizedDjangoFetch(path, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  return toActionResult<T>(res);
}

function ownerPath(ownerType: DocumentOwnerType, ownerId: string): string {
  return ownerType === "student" ? `/students/${ownerId}` : `/staff/${ownerId}`;
}

// Multipart, not JSON — apps.documents.views.DocumentUploadView reads the
// file from request.FILES, outside DRF's serializer validation, same
// reasoning as actions/examinations.ts's uploadQuestionImage. fetch()
// derives the multipart/form-data boundary from the FormData itself, so
// no Content-Type header is set here.
export async function uploadDocument(
  schoolId: string,
  ownerType: DocumentOwnerType,
  ownerId: string,
  formData: FormData
): Promise<ActionResult<unknown>> {
  formData.set("school", schoolId);
  formData.set(ownerType, ownerId);
  const res = await authorizedDjangoFetch("/api/v1/documents/upload", {
    method: "POST",
    body: formData,
  });
  const result = await toActionResult(res);
  if (result.success) revalidatePath(ownerPath(ownerType, ownerId));
  return result;
}

export async function updateDocument(
  ownerType: DocumentOwnerType,
  ownerId: string,
  publicId: string,
  input: Record<string, unknown>
) {
  const result = await call(`/api/v1/documents/${publicId}`, "PATCH", input);
  if (result.success) revalidatePath(ownerPath(ownerType, ownerId));
  return result;
}

export async function deleteDocument(ownerType: DocumentOwnerType, ownerId: string, publicId: string) {
  const result = await call(`/api/v1/documents/${publicId}`, "DELETE");
  if (result.success) revalidatePath(ownerPath(ownerType, ownerId));
  return result;
}

// Never persisted client-side — a fresh presigned URL is fetched at click
// time, same reasoning as apps.documents.services.document_service's own
// "no file_url field" design (a stored URL would eventually point at an
// expired link).
export async function getDocumentDownloadUrl(publicId: string): Promise<ActionResult<{ url: string }>> {
  return call(`/api/v1/documents/${publicId}/download`, "GET");
}
