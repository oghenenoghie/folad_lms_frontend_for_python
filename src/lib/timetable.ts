import "server-only";
import { djangoFetch } from "@/lib/session";
import type { Envelope, Paginated } from "@/lib/api-types";

export type DayOfWeek = "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday";

export type Room = {
  public_id: string;
  campus: string;
  name: string;
  capacity: number | null;
  is_active: boolean;
};

export type Period = {
  public_id: string;
  school: string;
  name: string;
  sequence: number;
  start_time: string;
  end_time: string;
  is_active: boolean;
};

export type TimetableSlot = {
  public_id: string;
  class_subject: string;
  class_arm: string;
  teacher: string;
  room: string | null;
  day_of_week: DayOfWeek;
  period: string;
  is_active: boolean;
};

/** null return means "not permitted to view" (403) — same convention as
 * lib/schools.ts's listOrNull. */
async function listOrNull<T>(path: string): Promise<T[] | null> {
  const res = await djangoFetch(path);
  if (!res.ok) return null;
  const body: Envelope<Paginated<T>> = await res.json();
  return body.success && body.data ? body.data.results : null;
}

export async function getRooms(campusId?: string): Promise<Room[] | null> {
  const query = campusId ? `campus_id=${campusId}&` : "";
  return listOrNull<Room>(`/api/v1/rooms?${query}page_size=200`);
}

export async function getPeriods(schoolId?: string): Promise<Period[] | null> {
  const query = schoolId ? `school_id=${schoolId}&` : "";
  return listOrNull<Period>(`/api/v1/periods?${query}page_size=100`);
}

export async function getTimetableSlots(classArmId?: string): Promise<TimetableSlot[] | null> {
  const query = classArmId ? `class_arm_id=${classArmId}&` : "";
  return listOrNull<TimetableSlot>(`/api/v1/timetable-slots?${query}page_size=200`);
}
