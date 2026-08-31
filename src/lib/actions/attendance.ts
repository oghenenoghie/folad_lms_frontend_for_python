"use server";

import { revalidatePath } from "next/cache";
import { authorizedDjangoFetch } from "@/lib/session";
import { toActionResult, type ActionResult } from "@/lib/action-result";
import type { Attendance, AttendanceStatus } from "@/lib/attendance";

// One record per (enrollment, date) — apps.attendance's own unique
// constraint — so marking a student who already has a record for the
// day is an update (PATCH), not a second create; the caller (the
// attendance grid) tracks which case it's in via `existingAttendanceId`.
export async function setAttendanceStatus(input: {
  enrollmentId: string;
  date: string;
  status: AttendanceStatus;
  existingAttendanceId: string | null;
}): Promise<ActionResult<Attendance>> {
  const { enrollmentId, date, status, existingAttendanceId } = input;
  const res = existingAttendanceId
    ? await authorizedDjangoFetch(`/api/v1/attendance/${existingAttendanceId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      })
    : await authorizedDjangoFetch("/api/v1/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enrollment: enrollmentId, date, status }),
      });
  const result = await toActionResult<Attendance>(res);
  if (result.success) revalidatePath("/attendance");
  return result;
}
