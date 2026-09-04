import "server-only";
import { djangoFetch } from "@/lib/session";
import type { DetailResult, Envelope, Paginated } from "@/lib/api-types";

export type VehicleStatus = "active" | "maintenance" | "retired";
export type MaintenanceStatus = "scheduled" | "completed" | "cancelled";

export type Vehicle = {
  public_id: string;
  school: string;
  registration_number: string;
  make: string;
  model: string;
  capacity: number;
  status: VehicleStatus;
};

export type TransportRoute = {
  public_id: string;
  school: string;
  name: string;
  description: string;
};

export type RouteStop = {
  public_id: string;
  route: string;
  name: string;
  sequence: number;
  pickup_time: string;
};

export type TransportAssignment = {
  public_id: string;
  student: string;
  vehicle: string;
  route: string;
  stop: string;
  academic_year: string;
  assigned_date: string;
  is_active: boolean;
};

export type VehicleMaintenance = {
  public_id: string;
  vehicle: string;
  description: string;
  cost_minor: number | null;
  currency_code: string;
  scheduled_date: string;
  completed_date: string | null;
  status: MaintenanceStatus;
};

/** null return means "not permitted to view" (403) — same convention as
 * lib/schools.ts's listOrNull. */
async function listOrNull<T>(path: string): Promise<T[] | null> {
  const res = await djangoFetch(path);
  if (!res.ok) return null;
  const body: Envelope<Paginated<T>> = await res.json();
  return body.success && body.data ? body.data.results : null;
}

export async function getVehicles(schoolId?: string): Promise<Vehicle[] | null> {
  const query = schoolId ? `school_id=${schoolId}&` : "";
  return listOrNull<Vehicle>(`/api/v1/vehicles?${query}page_size=100`);
}

export async function getVehicleResult(publicId: string): Promise<DetailResult<Vehicle>> {
  const res = await djangoFetch(`/api/v1/vehicles/${publicId}`);
  if (res.status === 403) return { status: "forbidden" };
  if (!res.ok) return { status: "not_found" };
  const body: Envelope<Vehicle> = await res.json();
  if (!body.success || !body.data) return { status: "not_found" };
  return { status: "ok", data: body.data };
}

export async function getTransportRoutes(schoolId?: string): Promise<TransportRoute[] | null> {
  const query = schoolId ? `school_id=${schoolId}&` : "";
  return listOrNull<TransportRoute>(`/api/v1/transport-routes?${query}page_size=100`);
}

export async function getRouteStops(routeId?: string): Promise<RouteStop[] | null> {
  const query = routeId ? `route_id=${routeId}&` : "";
  return listOrNull<RouteStop>(`/api/v1/route-stops?${query}page_size=100`);
}

export async function getTransportAssignments(filters?: {
  studentId?: string;
  vehicleId?: string;
}): Promise<TransportAssignment[] | null> {
  const params = new URLSearchParams();
  if (filters?.studentId) params.set("student_id", filters.studentId);
  if (filters?.vehicleId) params.set("vehicle_id", filters.vehicleId);
  const query = params.toString() ? `${params.toString()}&` : "";
  return listOrNull<TransportAssignment>(`/api/v1/transport-assignments?${query}page_size=200`);
}

export async function getVehicleMaintenance(vehicleId?: string): Promise<VehicleMaintenance[] | null> {
  const query = vehicleId ? `vehicle_id=${vehicleId}&` : "";
  return listOrNull<VehicleMaintenance>(`/api/v1/vehicle-maintenance?${query}page_size=100`);
}
