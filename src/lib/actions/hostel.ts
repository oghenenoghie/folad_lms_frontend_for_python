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

// --- Hostels (shown on the school page) ---
export async function createHostel(schoolId: string, input: Record<string, unknown>) {
  const result = await call("/api/v1/hostels", "POST", { ...input, school: schoolId, warden: input.warden || undefined });
  if (result.success) revalidatePath(`/schools/${schoolId}`);
  return result;
}

export async function updateHostel(schoolId: string, publicId: string, input: Record<string, unknown>) {
  const result = await call(`/api/v1/hostels/${publicId}`, "PATCH", {
    ...input,
    warden: input.warden || null,
  });
  if (result.success) {
    revalidatePath(`/schools/${schoolId}`);
    revalidatePath(`/hostels/${publicId}`);
  }
  return result;
}

export async function deleteHostel(schoolId: string, publicId: string) {
  const result = await call(`/api/v1/hostels/${publicId}`, "DELETE");
  if (result.success) revalidatePath(`/schools/${schoolId}`);
  return result;
}

// --- Buildings, rooms, beds (shown on a hostel's detail page) ---
export async function createBuilding(hostelId: string, input: Record<string, unknown>) {
  const result = await call("/api/v1/hostel-buildings", "POST", { ...input, hostel: hostelId });
  if (result.success) revalidatePath(`/hostels/${hostelId}`);
  return result;
}

export async function updateBuilding(hostelId: string, publicId: string, input: Record<string, unknown>) {
  const result = await call(`/api/v1/hostel-buildings/${publicId}`, "PATCH", input);
  if (result.success) revalidatePath(`/hostels/${hostelId}`);
  return result;
}

export async function deleteBuilding(hostelId: string, publicId: string) {
  const result = await call(`/api/v1/hostel-buildings/${publicId}`, "DELETE");
  if (result.success) revalidatePath(`/hostels/${hostelId}`);
  return result;
}

export async function createRoom(hostelId: string, buildingId: string, input: Record<string, unknown>) {
  const result = await call("/api/v1/hostel-rooms", "POST", { ...input, building: buildingId });
  if (result.success) revalidatePath(`/hostels/${hostelId}`);
  return result;
}

export async function updateRoom(hostelId: string, publicId: string, input: Record<string, unknown>) {
  const result = await call(`/api/v1/hostel-rooms/${publicId}`, "PATCH", input);
  if (result.success) revalidatePath(`/hostels/${hostelId}`);
  return result;
}

export async function deleteRoom(hostelId: string, publicId: string) {
  const result = await call(`/api/v1/hostel-rooms/${publicId}`, "DELETE");
  if (result.success) revalidatePath(`/hostels/${hostelId}`);
  return result;
}

export async function createBed(hostelId: string, roomId: string, input: Record<string, unknown>) {
  const result = await call("/api/v1/hostel-beds", "POST", { ...input, room: roomId });
  if (result.success) revalidatePath(`/hostels/${hostelId}`);
  return result;
}

export async function updateBed(hostelId: string, publicId: string, input: Record<string, unknown>) {
  const result = await call(`/api/v1/hostel-beds/${publicId}`, "PATCH", input);
  if (result.success) revalidatePath(`/hostels/${hostelId}`);
  return result;
}

export async function deleteBed(hostelId: string, publicId: string) {
  const result = await call(`/api/v1/hostel-beds/${publicId}`, "DELETE");
  if (result.success) revalidatePath(`/hostels/${hostelId}`);
  return result;
}

// --- Allocations and incidents (shown on /hostel-desk) ---
// `allocated_date` is optional server-side (defaults to today) — an empty
// string from the optional date input has to become `undefined` (omitted)
// rather than "", since the backend 400s on an empty-string date.
export async function createAllocation(input: Record<string, unknown>) {
  const result = await call("/api/v1/hostel-allocations", "POST", {
    ...input,
    allocated_date: input.allocated_date || undefined,
  });
  if (result.success) revalidatePath("/hostel-desk");
  return result;
}

export async function vacateAllocation(publicId: string) {
  const result = await call(`/api/v1/hostel-allocations/${publicId}/vacate`, "POST");
  if (result.success) revalidatePath("/hostel-desk");
  return result;
}

// occurred_at is a required DateTimeField — the date-only input has to
// become a full ISO datetime, same reasoning as actions/finance.ts's
// normalizeDueDate for a different field shape.
function normalizeOccurredAt(input: Record<string, unknown>) {
  return {
    ...input,
    occurred_at: input.occurred_at ? new Date(`${input.occurred_at}T00:00:00`).toISOString() : input.occurred_at,
    room: input.room || undefined,
    student: input.student || undefined,
  };
}

export async function createIncident(input: Record<string, unknown>) {
  const result = await call("/api/v1/hostel-incidents", "POST", normalizeOccurredAt(input));
  if (result.success) revalidatePath("/hostel-desk");
  return result;
}

export async function updateIncident(publicId: string, input: Record<string, unknown>) {
  const result = await call(`/api/v1/hostel-incidents/${publicId}`, "PATCH", normalizeOccurredAt(input));
  if (result.success) revalidatePath("/hostel-desk");
  return result;
}

export async function resolveIncident(publicId: string) {
  const result = await call(`/api/v1/hostel-incidents/${publicId}/resolve`, "POST");
  if (result.success) revalidatePath("/hostel-desk");
  return result;
}

export async function deleteIncident(publicId: string) {
  const result = await call(`/api/v1/hostel-incidents/${publicId}`, "DELETE");
  if (result.success) revalidatePath("/hostel-desk");
  return result;
}
