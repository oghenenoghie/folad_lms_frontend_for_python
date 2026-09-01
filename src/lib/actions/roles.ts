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

export async function createRole(input: Record<string, unknown>) {
  const result = await call("/api/v1/admin/roles", "POST", input);
  if (result.success) revalidatePath("/roles");
  return result;
}

export async function updateRole(publicId: string, input: Record<string, unknown>) {
  const result = await call(`/api/v1/admin/roles/${publicId}`, "PATCH", input);
  if (result.success) {
    revalidatePath("/roles");
    revalidatePath(`/roles/${publicId}`);
  }
  return result;
}

export async function deleteRole(publicId: string) {
  const result = await call(`/api/v1/admin/roles/${publicId}`, "DELETE");
  if (result.success) revalidatePath("/roles");
  return result;
}

export async function setRolePermissions(publicId: string, permissions: string[]) {
  const result = await call(`/api/v1/admin/roles/${publicId}`, "PATCH", { permissions });
  if (result.success) revalidatePath(`/roles/${publicId}`);
  return result;
}
