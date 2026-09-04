import "server-only";
import { djangoFetch } from "@/lib/session";
import type { DetailResult, Envelope, Paginated } from "@/lib/api-types";

export type HostelType = "boys" | "girls" | "mixed";
export type BedStatus = "available" | "occupied" | "maintenance";
export type IncidentSeverity = "low" | "medium" | "high";
export type IncidentStatus = "open" | "resolved";

export type Hostel = {
  public_id: string;
  school: string;
  name: string;
  hostel_type: HostelType;
  warden: string | null;
};

export type HostelBuilding = {
  public_id: string;
  hostel: string;
  name: string;
};

export type HostelRoom = {
  public_id: string;
  building: string;
  room_number: string;
  capacity: number;
};

export type HostelBed = {
  public_id: string;
  room: string;
  bed_number: string;
  status: BedStatus;
};

export type HostelAllocation = {
  public_id: string;
  student: string;
  bed: string;
  academic_year: string;
  allocated_date: string;
  vacated_date: string | null;
  is_active: boolean;
};

export type HostelIncident = {
  public_id: string;
  hostel: string;
  room: string | null;
  student: string | null;
  reported_by: string | null;
  description: string;
  severity: IncidentSeverity;
  status: IncidentStatus;
  occurred_at: string;
  resolved_at: string | null;
};

/** null return means "not permitted to view" (403) — same convention as
 * lib/schools.ts's listOrNull. */
async function listOrNull<T>(path: string): Promise<T[] | null> {
  const res = await djangoFetch(path);
  if (!res.ok) return null;
  const body: Envelope<Paginated<T>> = await res.json();
  return body.success && body.data ? body.data.results : null;
}

export async function getHostels(schoolId?: string): Promise<Hostel[] | null> {
  const query = schoolId ? `school_id=${schoolId}&` : "";
  return listOrNull<Hostel>(`/api/v1/hostels?${query}page_size=100`);
}

export async function getHostelResult(publicId: string): Promise<DetailResult<Hostel>> {
  const res = await djangoFetch(`/api/v1/hostels/${publicId}`);
  if (res.status === 403) return { status: "forbidden" };
  if (!res.ok) return { status: "not_found" };
  const body: Envelope<Hostel> = await res.json();
  if (!body.success || !body.data) return { status: "not_found" };
  return { status: "ok", data: body.data };
}

export async function getHostelBuildings(hostelId?: string): Promise<HostelBuilding[] | null> {
  const query = hostelId ? `hostel_id=${hostelId}&` : "";
  return listOrNull<HostelBuilding>(`/api/v1/hostel-buildings?${query}page_size=100`);
}

export async function getHostelRooms(buildingId?: string): Promise<HostelRoom[] | null> {
  const query = buildingId ? `building_id=${buildingId}&` : "";
  return listOrNull<HostelRoom>(`/api/v1/hostel-rooms?${query}page_size=100`);
}

export async function getHostelBeds(roomId?: string): Promise<HostelBed[] | null> {
  const query = roomId ? `room_id=${roomId}&` : "";
  return listOrNull<HostelBed>(`/api/v1/hostel-beds?${query}page_size=100`);
}

export async function getHostelAllocations(filters?: {
  studentId?: string;
  bedId?: string;
}): Promise<HostelAllocation[] | null> {
  const params = new URLSearchParams();
  if (filters?.studentId) params.set("student_id", filters.studentId);
  if (filters?.bedId) params.set("bed_id", filters.bedId);
  const query = params.toString() ? `${params.toString()}&` : "";
  return listOrNull<HostelAllocation>(`/api/v1/hostel-allocations?${query}page_size=200`);
}

export async function getHostelIncidents(filters?: {
  hostelId?: string;
  status?: IncidentStatus;
}): Promise<HostelIncident[] | null> {
  const params = new URLSearchParams();
  if (filters?.hostelId) params.set("hostel_id", filters.hostelId);
  if (filters?.status) params.set("status", filters.status);
  const query = params.toString() ? `${params.toString()}&` : "";
  return listOrNull<HostelIncident>(`/api/v1/hostel-incidents?${query}page_size=100`);
}
