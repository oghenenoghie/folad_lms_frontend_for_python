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

// --- Vehicles (shown on the school page) ---
export async function createVehicle(schoolId: string, input: Record<string, unknown>) {
  const result = await call("/api/v1/vehicles", "POST", { ...input, school: schoolId });
  if (result.success) revalidatePath(`/schools/${schoolId}`);
  return result;
}

export async function updateVehicle(schoolId: string, publicId: string, input: Record<string, unknown>) {
  const result = await call(`/api/v1/vehicles/${publicId}`, "PATCH", input);
  if (result.success) {
    revalidatePath(`/schools/${schoolId}`);
    revalidatePath(`/vehicles/${publicId}`);
  }
  return result;
}

export async function deleteVehicle(schoolId: string, publicId: string) {
  const result = await call(`/api/v1/vehicles/${publicId}`, "DELETE");
  if (result.success) revalidatePath(`/schools/${schoolId}`);
  return result;
}

// --- Transport routes + stops (shown on the school page) ---
export async function createTransportRoute(schoolId: string, input: Record<string, unknown>) {
  const result = await call("/api/v1/transport-routes", "POST", { ...input, school: schoolId });
  if (result.success) revalidatePath(`/schools/${schoolId}`);
  return result;
}

export async function updateTransportRoute(schoolId: string, publicId: string, input: Record<string, unknown>) {
  const result = await call(`/api/v1/transport-routes/${publicId}`, "PATCH", input);
  if (result.success) revalidatePath(`/schools/${schoolId}`);
  return result;
}

export async function deleteTransportRoute(schoolId: string, publicId: string) {
  const result = await call(`/api/v1/transport-routes/${publicId}`, "DELETE");
  if (result.success) revalidatePath(`/schools/${schoolId}`);
  return result;
}

export async function createRouteStop(schoolId: string, routeId: string, input: Record<string, unknown>) {
  const result = await call("/api/v1/route-stops", "POST", { ...input, route: routeId });
  if (result.success) revalidatePath(`/schools/${schoolId}`);
  return result;
}

export async function updateRouteStop(schoolId: string, publicId: string, input: Record<string, unknown>) {
  const result = await call(`/api/v1/route-stops/${publicId}`, "PATCH", input);
  if (result.success) revalidatePath(`/schools/${schoolId}`);
  return result;
}

export async function deleteRouteStop(schoolId: string, publicId: string) {
  const result = await call(`/api/v1/route-stops/${publicId}`, "DELETE");
  if (result.success) revalidatePath(`/schools/${schoolId}`);
  return result;
}

// --- Transport assignments (shown on the Transport Desk) ---
export async function createAssignment(input: Record<string, unknown>) {
  const result = await call("/api/v1/transport-assignments", "POST", {
    ...input,
    assigned_date: input.assigned_date || undefined,
  });
  if (result.success) revalidatePath("/transport-desk");
  return result;
}

// DELETE on this endpoint deactivates the assignment (unassign_transport)
// rather than hard/soft-deleting the row — see apps.transport.views'
// TransportAssignmentDetailView docstring.
export async function unassignTransport(publicId: string) {
  const result = await call(`/api/v1/transport-assignments/${publicId}`, "DELETE");
  if (result.success) revalidatePath("/transport-desk");
  return result;
}

// --- Vehicle maintenance (shown on the vehicle detail page) ---
// cost_minor is a nullable BigIntegerField and completed_date a nullable
// DateField — both normalized the same way as actions/timetable.ts's
// normalizeCapacity and actions/finance.ts's normalizeDueDate.
function normalizeMaintenance(input: Record<string, unknown>) {
  return {
    ...input,
    cost_minor: input.cost_minor ? Number(input.cost_minor) : null,
    completed_date: input.completed_date || null,
  };
}

export async function createMaintenance(vehicleId: string, input: Record<string, unknown>) {
  const result = await call("/api/v1/vehicle-maintenance", "POST", {
    ...normalizeMaintenance(input),
    vehicle: vehicleId,
  });
  if (result.success) revalidatePath(`/vehicles/${vehicleId}`);
  return result;
}

export async function updateMaintenance(vehicleId: string, publicId: string, input: Record<string, unknown>) {
  const result = await call(`/api/v1/vehicle-maintenance/${publicId}`, "PATCH", normalizeMaintenance(input));
  if (result.success) revalidatePath(`/vehicles/${vehicleId}`);
  return result;
}

export async function deleteMaintenance(vehicleId: string, publicId: string) {
  const result = await call(`/api/v1/vehicle-maintenance/${publicId}`, "DELETE");
  if (result.success) revalidatePath(`/vehicles/${vehicleId}`);
  return result;
}
