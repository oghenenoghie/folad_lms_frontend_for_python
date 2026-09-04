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

// --- Class levels (nested under a campus, shown on the school page) ---
export async function createClassLevel(schoolId: string, campusId: string, input: Record<string, unknown>) {
  const result = await call("/api/v1/class-levels", "POST", { ...input, campus: campusId });
  if (result.success) revalidatePath(`/schools/${schoolId}`);
  return result;
}

export async function updateClassLevel(schoolId: string, publicId: string, input: Record<string, unknown>) {
  const result = await call(`/api/v1/class-levels/${publicId}`, "PATCH", input);
  if (result.success) revalidatePath(`/schools/${schoolId}`);
  return result;
}

export async function deleteClassLevel(schoolId: string, publicId: string) {
  const result = await call(`/api/v1/class-levels/${publicId}`, "DELETE");
  if (result.success) revalidatePath(`/schools/${schoolId}`);
  return result;
}

// --- Class arms (nested under a class level) ---
export async function createClassArm(schoolId: string, classLevelId: string, input: Record<string, unknown>) {
  const result = await call("/api/v1/class-arms", "POST", { ...input, class_level: classLevelId });
  if (result.success) revalidatePath(`/schools/${schoolId}`);
  return result;
}

export async function updateClassArm(schoolId: string, publicId: string, input: Record<string, unknown>) {
  const result = await call(`/api/v1/class-arms/${publicId}`, "PATCH", input);
  if (result.success) revalidatePath(`/schools/${schoolId}`);
  return result;
}

export async function deleteClassArm(schoolId: string, publicId: string) {
  const result = await call(`/api/v1/class-arms/${publicId}`, "DELETE");
  if (result.success) revalidatePath(`/schools/${schoolId}`);
  return result;
}

// --- Class subjects (teacher-subject assignments, nested under a class arm) ---
export async function createClassSubject(schoolId: string, classArmId: string, input: Record<string, unknown>) {
  const result = await call("/api/v1/class-subjects", "POST", { ...input, class_arm: classArmId });
  if (result.success) revalidatePath(`/schools/${schoolId}`);
  return result;
}

export async function updateClassSubjectAssignment(
  schoolId: string,
  publicId: string,
  input: Record<string, unknown>
) {
  const result = await call(`/api/v1/class-subjects/${publicId}`, "PATCH", input);
  if (result.success) revalidatePath(`/schools/${schoolId}`);
  return result;
}

export async function deleteClassSubject(schoolId: string, publicId: string) {
  const result = await call(`/api/v1/class-subjects/${publicId}`, "DELETE");
  if (result.success) revalidatePath(`/schools/${schoolId}`);
  return result;
}

// --- Subjects (school-wide) ---
export async function createSubject(schoolId: string, input: Record<string, unknown>) {
  const result = await call("/api/v1/subjects", "POST", { ...input, school: schoolId });
  if (result.success) revalidatePath(`/schools/${schoolId}`);
  return result;
}

export async function updateSubject(schoolId: string, publicId: string, input: Record<string, unknown>) {
  const result = await call(`/api/v1/subjects/${publicId}`, "PATCH", input);
  if (result.success) revalidatePath(`/schools/${schoolId}`);
  return result;
}

export async function deleteSubject(schoolId: string, publicId: string) {
  const result = await call(`/api/v1/subjects/${publicId}`, "DELETE");
  if (result.success) revalidatePath(`/schools/${schoolId}`);
  return result;
}

// --- Enrollments (shown on the student page) ---
// effective_to is a nullable DateField server-side — DRF's DateField only
// accepts an actual `null`, not "", so a cleared date input has to be
// converted here rather than sent as-is (an empty string 400s as "wrong
// format" instead of clearing the field).
function normalizeEffectiveTo(input: Record<string, unknown>) {
  return { ...input, effective_to: input.effective_to || null };
}

export async function createEnrollment(studentId: string, input: Record<string, unknown>) {
  const result = await call("/api/v1/enrollments", "POST", {
    ...normalizeEffectiveTo(input),
    student: studentId,
  });
  if (result.success) revalidatePath(`/students/${studentId}`);
  return result;
}

export async function updateEnrollment(studentId: string, publicId: string, input: Record<string, unknown>) {
  const result = await call(`/api/v1/enrollments/${publicId}`, "PATCH", normalizeEffectiveTo(input));
  if (result.success) revalidatePath(`/students/${studentId}`);
  return result;
}

export async function deleteEnrollment(studentId: string, publicId: string) {
  const result = await call(`/api/v1/enrollments/${publicId}`, "DELETE");
  if (result.success) revalidatePath(`/students/${studentId}`);
  return result;
}
