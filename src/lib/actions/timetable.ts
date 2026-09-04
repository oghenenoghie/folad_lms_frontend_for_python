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

// capacity is a nullable PositiveIntegerField — an empty string from the
// optional number input has to become an actual `null`, same reasoning as
// actions/academics.ts's normalizeEffectiveTo.
function normalizeCapacity(input: Record<string, unknown>) {
  return { ...input, capacity: input.capacity ? Number(input.capacity) : null };
}

// --- Rooms (nested under a campus, shown on the school page) ---
export async function createRoom(schoolId: string, campusId: string, input: Record<string, unknown>) {
  const result = await call("/api/v1/rooms", "POST", { ...normalizeCapacity(input), campus: campusId });
  if (result.success) revalidatePath(`/schools/${schoolId}`);
  return result;
}

export async function updateRoom(schoolId: string, publicId: string, input: Record<string, unknown>) {
  const result = await call(`/api/v1/rooms/${publicId}`, "PATCH", normalizeCapacity(input));
  if (result.success) revalidatePath(`/schools/${schoolId}`);
  return result;
}

export async function deleteRoom(schoolId: string, publicId: string) {
  const result = await call(`/api/v1/rooms/${publicId}`, "DELETE");
  if (result.success) revalidatePath(`/schools/${schoolId}`);
  return result;
}

// --- Periods (school-wide, shown on the school page) ---
export async function createPeriod(schoolId: string, input: Record<string, unknown>) {
  const result = await call("/api/v1/periods", "POST", { ...input, school: schoolId });
  if (result.success) revalidatePath(`/schools/${schoolId}`);
  return result;
}

export async function updatePeriod(schoolId: string, publicId: string, input: Record<string, unknown>) {
  const result = await call(`/api/v1/periods/${publicId}`, "PATCH", input);
  if (result.success) revalidatePath(`/schools/${schoolId}`);
  return result;
}

export async function deletePeriod(schoolId: string, publicId: string) {
  const result = await call(`/api/v1/periods/${publicId}`, "DELETE");
  if (result.success) revalidatePath(`/schools/${schoolId}`);
  return result;
}

// --- Timetable slots (shown on the /timetable page's weekly grid) ---
// `room` is optional — an empty string from the "no fixed room" select has
// to become `undefined` (omitted) rather than "", since the backend 400s
// on an empty-string FK.
function normalizeSlotInput(input: Record<string, unknown>) {
  return { ...input, room: input.room || undefined };
}

export async function createTimetableSlot(
  dayOfWeek: string,
  periodId: string,
  input: Record<string, unknown>
) {
  const result = await call("/api/v1/timetable-slots", "POST", {
    ...normalizeSlotInput(input),
    day_of_week: dayOfWeek,
    period: periodId,
  });
  if (result.success) revalidatePath("/timetable");
  return result;
}

export async function updateTimetableSlot(publicId: string, input: Record<string, unknown>) {
  const result = await call(`/api/v1/timetable-slots/${publicId}`, "PATCH", normalizeSlotInput(input));
  if (result.success) revalidatePath("/timetable");
  return result;
}

export async function deleteTimetableSlot(publicId: string) {
  const result = await call(`/api/v1/timetable-slots/${publicId}`, "DELETE");
  if (result.success) revalidatePath("/timetable");
  return result;
}
