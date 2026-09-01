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

// --- Guardians ---
export async function createGuardian(input: Record<string, unknown>) {
  const result = await call("/api/v1/guardians", "POST", input);
  if (result.success) revalidatePath("/guardians");
  return result;
}

export async function updateGuardian(publicId: string, input: Record<string, unknown>) {
  const result = await call(`/api/v1/guardians/${publicId}`, "PATCH", input);
  if (result.success) {
    revalidatePath("/guardians");
    revalidatePath(`/guardians/${publicId}`);
  }
  return result;
}

export async function deleteGuardian(publicId: string) {
  const result = await call(`/api/v1/guardians/${publicId}`, "DELETE");
  if (result.success) revalidatePath("/guardians");
  return result;
}

// --- Guardian <-> Student links ("children") ---
export async function linkGuardianStudent(guardianId: string, input: Record<string, unknown>) {
  const result = await call("/api/v1/guardian-students", "POST", { ...input, guardian: guardianId });
  if (result.success) revalidatePath(`/guardians/${guardianId}`);
  return result;
}

export async function updateGuardianStudentLink(
  guardianId: string,
  publicId: string,
  input: Record<string, unknown>
) {
  const result = await call(`/api/v1/guardian-students/${publicId}`, "PATCH", input);
  if (result.success) revalidatePath(`/guardians/${guardianId}`);
  return result;
}

export async function unlinkGuardianStudent(guardianId: string, publicId: string) {
  const result = await call(`/api/v1/guardian-students/${publicId}`, "DELETE");
  if (result.success) revalidatePath(`/guardians/${guardianId}`);
  return result;
}
