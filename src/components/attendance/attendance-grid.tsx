"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { setAttendanceStatus } from "@/lib/actions/attendance";

type QuickStatus = "present" | "absent" | "late";

export type AttendanceRow = {
  enrollmentId: string;
  name: string;
  admissionNumber: string;
  photoUrl: string | null;
  attendanceId: string | null;
  status: QuickStatus | null;
};

export type AttendanceGroup = {
  name: string;
  rows: AttendanceRow[];
};

const STATUS_OPTIONS: { value: QuickStatus; label: string }[] = [
  { value: "present", label: "P" },
  { value: "absent", label: "A" },
  { value: "late", label: "L" },
];

const STATUS_STYLES: Record<QuickStatus, string> = {
  present: "border-emerald-500 bg-emerald-500 text-white hover:bg-emerald-600",
  absent: "border-rose-500 bg-rose-500 text-white hover:bg-rose-600",
  late: "border-amber-500 bg-amber-500 text-white hover:bg-amber-600",
};

export function AttendanceGrid({ groups, date }: { groups: AttendanceGroup[]; date: string }) {
  return (
    <div className="space-y-8">
      {groups.map((group) => (
        <div key={group.name} className="space-y-4">
          <h2 className="text-lg font-semibold">{group.name}</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {group.rows.map((row) => (
              <AttendanceStudentCard key={row.enrollmentId} row={row} date={date} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function AttendanceStudentCard({ row, date }: { row: AttendanceRow; date: string }) {
  const [status, setStatus] = useState(row.status);
  const [attendanceId, setAttendanceId] = useState(row.attendanceId);
  const [isPending, startTransition] = useTransition();

  function pick(value: QuickStatus) {
    const previousStatus = status;
    setStatus(value);
    startTransition(async () => {
      const result = await setAttendanceStatus({
        enrollmentId: row.enrollmentId,
        date,
        status: value,
        existingAttendanceId: attendanceId,
      });
      if (!result.success || !result.data) {
        setStatus(previousStatus);
        toast.error(result.message ?? "Could not save attendance");
        return;
      }
      setAttendanceId(result.data.public_id);
    });
  }

  const initials =
    row.name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("") || "?";

  return (
    <Card>
      <CardContent className="flex flex-col items-center gap-3 p-4">
        <Avatar size="lg">
          {row.photoUrl && <AvatarImage src={row.photoUrl} alt={row.name} />}
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
        <div className="text-center">
          <p className="text-sm font-medium">{row.name}</p>
          <p className="text-xs text-muted-foreground">{row.admissionNumber}</p>
        </div>
        <div className="flex gap-2">
          {STATUS_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              disabled={isPending}
              onClick={() => pick(option.value)}
              aria-pressed={status === option.value}
              aria-label={`Mark ${row.name} as ${option.label}`}
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-full border text-sm font-semibold transition-colors disabled:opacity-60",
                status === option.value
                  ? STATUS_STYLES[option.value]
                  : "border-muted-foreground/30 text-muted-foreground hover:bg-muted"
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
