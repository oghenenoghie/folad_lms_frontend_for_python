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

// --- Discounts ---
export async function createPercentageDiscount(schoolId: string, input: Record<string, unknown>) {
  const result = await call("/api/v1/discounts", "POST", {
    ...input,
    school: schoolId,
    discount_type: "percentage",
  });
  if (result.success) revalidatePath(`/schools/${schoolId}`);
  return result;
}

export async function createFixedDiscount(schoolId: string, input: Record<string, unknown>) {
  const result = await call("/api/v1/discounts", "POST", {
    ...input,
    school: schoolId,
    discount_type: "fixed_amount",
  });
  if (result.success) revalidatePath(`/schools/${schoolId}`);
  return result;
}

export async function updateDiscount(schoolId: string, publicId: string, input: Record<string, unknown>) {
  const result = await call(`/api/v1/discounts/${publicId}`, "PATCH", input);
  if (result.success) revalidatePath(`/schools/${schoolId}`);
  return result;
}

export async function deleteDiscount(schoolId: string, publicId: string) {
  const result = await call(`/api/v1/discounts/${publicId}`, "DELETE");
  if (result.success) revalidatePath(`/schools/${schoolId}`);
  return result;
}

// --- Scholarships ---
export async function createScholarship(studentId: string, input: Record<string, unknown>) {
  const result = await call("/api/v1/scholarships", "POST", { ...input, student: studentId });
  if (result.success) revalidatePath(`/students/${studentId}`);
  return result;
}

export async function updateScholarshipActive(
  studentId: string,
  publicId: string,
  input: Record<string, unknown>
) {
  const result = await call(`/api/v1/scholarships/${publicId}`, "PATCH", input);
  if (result.success) revalidatePath(`/students/${studentId}`);
  return result;
}

export async function revokeScholarship(studentId: string, publicId: string) {
  const result = await call(`/api/v1/scholarships/${publicId}`, "DELETE");
  if (result.success) revalidatePath(`/students/${studentId}`);
  return result;
}
