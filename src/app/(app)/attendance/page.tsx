import type { Metadata } from "next";
import { CalendarCheck } from "lucide-react";
import { AttendanceFilters } from "@/components/attendance/attendance-filters";
import { AttendanceGrid, type AttendanceGroup } from "@/components/attendance/attendance-grid";
import { getClassArms, getClassLevels, getEnrollmentsForClassArm } from "@/lib/academics";
import { getAcademicYears, getCampuses, getSchools } from "@/lib/schools";
import { getStudentsBySchool } from "@/lib/students";
import { getAttendanceForDate, type AttendanceStatus } from "@/lib/attendance";

export const metadata: Metadata = { title: "Attendance" };

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

const QUICK_STATUSES = new Set(["present", "absent", "late"]);

// ClassLevel only carries a `campus` FK, not `school` directly — build
// campus->school once so a chosen class level can resolve back to the
// school its students/academic-year live under.
async function getClassLevelOptions() {
  const [classLevels, schools] = await Promise.all([getClassLevels(), getSchools()]);
  if (!classLevels || !schools) {
    return { options: [], schoolByClassLevel: new Map<string, string>() };
  }

  const campusLists = await Promise.all(schools.map((school) => getCampuses(school.public_id)));
  const schoolByCampus = new Map<string, string>();
  schools.forEach((school, index) => {
    for (const campus of campusLists[index] ?? []) schoolByCampus.set(campus.public_id, school.public_id);
  });

  const schoolByClassLevel = new Map(
    classLevels.map((level) => [level.public_id, schoolByCampus.get(level.campus) ?? ""])
  );
  const options = classLevels.map((level) => ({ value: level.public_id, label: level.name }));
  return { options, schoolByClassLevel };
}

async function getAttendanceGroups(
  classLevelId: string,
  schoolId: string,
  date: string
): Promise<AttendanceGroup[]> {
  const [classArms, academicYears, attendanceForDate] = await Promise.all([
    getClassArms(),
    getAcademicYears(schoolId),
    getAttendanceForDate(date),
  ]);
  const armsForLevel = (classArms ?? []).filter((arm) => arm.class_level === classLevelId);
  if (!armsForLevel.length) return [];

  const currentYear = (academicYears ?? []).find((year) => year.is_current) ?? (academicYears ?? [])[0];
  if (!currentYear) return [];

  const [enrollmentLists, students] = await Promise.all([
    Promise.all(armsForLevel.map((arm) => getEnrollmentsForClassArm(arm.public_id, currentYear.public_id))),
    getStudentsBySchool(schoolId),
  ]);
  const studentById = new Map((students ?? []).map((student) => [student.public_id, student]));
  const attendanceByEnrollment = new Map((attendanceForDate ?? []).map((record) => [record.enrollment, record]));

  return armsForLevel.map((arm, index) => {
    const rows = (enrollmentLists[index] ?? [])
      .filter((enrollment) => enrollment.status === "active")
      .map((enrollment) => {
        const student = studentById.get(enrollment.student);
        const attendance = attendanceByEnrollment.get(enrollment.public_id) ?? null;
        return {
          enrollmentId: enrollment.public_id,
          name: student ? `${student.first_name} ${student.last_name}` : "Unknown student",
          admissionNumber: student?.admission_number ?? "",
          photoUrl: student?.photo_url ?? null,
          attendanceId: attendance?.public_id ?? null,
          status: attendance && QUICK_STATUSES.has(attendance.status) ? (attendance.status as AttendanceStatus) : null,
        };
      });
    return { name: arm.name, rows };
  }).filter((group) => group.rows.length > 0) as AttendanceGroup[];
}

export default async function AttendancePage({
  searchParams,
}: {
  searchParams: Promise<{ class_level?: string; date?: string }>;
}) {
  const params = await searchParams;
  const selectedDate = params.date || todayIso();
  const { options: classLevelOptions, schoolByClassLevel } = await getClassLevelOptions();
  const selectedClassLevel = params.class_level;

  const groups = selectedClassLevel
    ? await getAttendanceGroups(selectedClassLevel, schoolByClassLevel.get(selectedClassLevel) ?? "", selectedDate)
    : [];

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-6">
      <div>
        <h1 className="text-xl font-semibold">Attendance</h1>
        <p className="text-sm text-muted-foreground">Mark today&apos;s attendance for each class.</p>
      </div>

      <AttendanceFilters
        classLevelOptions={classLevelOptions}
        selectedClassLevel={selectedClassLevel}
        selectedDate={selectedDate}
      />

      {classLevelOptions.length === 0 ? (
        <p className="text-sm text-muted-foreground">You don&apos;t have access to any classes.</p>
      ) : !selectedClassLevel ? (
        <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed py-16 text-center">
          <CalendarCheck className="h-8 w-8 text-muted-foreground" />
          <p className="font-medium">Select a class to take attendance</p>
        </div>
      ) : groups.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed py-16 text-center">
          <CalendarCheck className="h-8 w-8 text-muted-foreground" />
          <p className="font-medium">No enrolled students found</p>
          <p className="text-sm text-muted-foreground">
            This class has no active enrollments for the current academic year.
          </p>
        </div>
      ) : (
        <AttendanceGrid groups={groups} date={selectedDate} />
      )}
    </div>
  );
}
