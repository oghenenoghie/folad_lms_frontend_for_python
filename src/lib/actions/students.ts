"use server";

import { revalidatePath } from "next/cache";
import { authorizedDjangoFetch } from "@/lib/session";
import { toActionResult, type ActionResult } from "@/lib/action-result";
import { NO_GENDER } from "@/lib/student-forms";
import type { Student } from "@/lib/students";

async function call<T>(path: string, method: string, body?: unknown): Promise<ActionResult<T>> {
  const res = await authorizedDjangoFetch(path, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  return toActionResult<T>(res);
}

function normalizeGender(input: Record<string, unknown>) {
  return { ...input, gender: input.gender === NO_GENDER ? "" : input.gender };
}

type CreatedStudent = Student & { generated_password: string | null };

export async function createStudent(input: Record<string, unknown>) {
  const result = await call<CreatedStudent>("/api/v1/students", "POST", normalizeGender(input));
  if (result.success) {
    revalidatePath("/students");
    // student_service.provision_login() returns this plaintext password
    // exactly once, right here in the create response — it's never
    // stored anywhere else, so this is the only chance to show it. When
    // no email was given, the login uses a synthetic placeholder address
    // generated on the User record — not exposed on this Student payload
    // (there's no /api/v1/users/{id} endpoint to look it up), so the
    // message only asserts the email when we actually know it.
    if (result.data?.generated_password) {
      const loginDescription = result.data.email
        ? `Login email: ${result.data.email}`
        : "A system-generated login email was assigned (check Django Admin for the exact address)";
      return {
        ...result,
        message: `Student created. ${loginDescription}, password: ${result.data.generated_password} — shown once, save it now.`,
      };
    }
  }
  return result;
}

export async function updateStudent(publicId: string, input: Record<string, unknown>) {
  // `school` is immutable after creation (mirrors apps/staff's
  // perform_update), so the edit form never submits it.
  const result = await call(`/api/v1/students/${publicId}`, "PATCH", normalizeGender(input));
  if (result.success) {
    revalidatePath("/students");
    revalidatePath(`/students/${publicId}`);
  }
  return result;
}

export async function deleteStudent(publicId: string) {
  const result = await call(`/api/v1/students/${publicId}`, "DELETE");
  if (result.success) revalidatePath("/students");
  return result;
}
