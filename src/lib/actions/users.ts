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

type CreatedUser = { generated_password: string | null; email: string };

export async function createUser(input: Record<string, unknown>) {
  const result = await call<CreatedUser>("/api/v1/admin/users", "POST", input);
  if (result.success) {
    revalidatePath("/users");
    if (result.data?.generated_password) {
      return {
        ...result,
        message: `User created. Password: ${result.data.generated_password} — shown once, save it now.`,
      };
    }
  }
  return result;
}

export async function updateUser(publicId: string, input: Record<string, unknown>) {
  // An empty password means "keep current" — never send it, or the
  // backend would happily set the account's password to an empty string.
  const { password, ...rest } = input;
  const body = password ? input : rest;
  const result = await call(`/api/v1/admin/users/${publicId}`, "PATCH", body);
  if (result.success) {
    revalidatePath("/users");
    revalidatePath(`/users/${publicId}`);
  }
  return result;
}

export async function deleteUser(publicId: string) {
  const result = await call(`/api/v1/admin/users/${publicId}`, "DELETE");
  if (result.success) revalidatePath("/users");
  return result;
}

export async function setUserRoles(publicId: string, roles: string[]) {
  const result = await call(`/api/v1/admin/users/${publicId}`, "PATCH", { roles });
  if (result.success) revalidatePath(`/users/${publicId}`);
  return result;
}
