import type { Metadata } from "next";
import { CalendarDays } from "lucide-react";
import { TimetableClassArmFilter } from "@/components/timetable/timetable-class-arm-filter";
import { TimetableGrid } from "@/components/timetable/timetable-grid";
import { getClassArms, getClassLevels, getClassSubjects, getSubjects } from "@/lib/academics";
import { getCampuses, getSchools } from "@/lib/schools";
import { getStaffList, getTeachers } from "@/lib/staff";
import { getPeriods, getRooms, getTimetableSlots } from "@/lib/timetable";

export const metadata: Metadata = { title: "Timetable" };

// ClassArm only carries a `class_level` FK, not `school` directly — build
// class-level->campus->school once so a chosen class arm can resolve back
// to the school its periods/rooms live under, same reasoning as
// attendance/page.tsx's getClassLevelOptions.
async function getClassArmOptions() {
  const [classArms, classLevels, schools] = await Promise.all([
    getClassArms(),
    getClassLevels(),
    getSchools(),
  ]);
  if (!classArms || !classLevels || !schools) {
    return { options: [], schoolByClassArm: new Map<string, string>() };
  }

  const campusLists = await Promise.all(schools.map((school) => getCampuses(school.public_id)));
  const schoolByCampus = new Map<string, string>();
  schools.forEach((school, index) => {
    for (const campus of campusLists[index] ?? []) schoolByCampus.set(campus.public_id, school.public_id);
  });

  const classLevelById = new Map(classLevels.map((level) => [level.public_id, level]));
  const schoolByClassArm = new Map<string, string>();
  const options = classArms.map((arm) => {
    const level = classLevelById.get(arm.class_level);
    const schoolId = level ? (schoolByCampus.get(level.campus) ?? "") : "";
    schoolByClassArm.set(arm.public_id, schoolId);
    return { value: arm.public_id, label: `${level?.name ?? ""} ${arm.name}`.trim() };
  });
  return { options, schoolByClassArm };
}

export default async function TimetablePage({
  searchParams,
}: {
  searchParams: Promise<{ class_arm?: string }>;
}) {
  const { class_arm: classArmParam } = await searchParams;
  const { options: classArmOptions, schoolByClassArm } = await getClassArmOptions();
  const classArmId = classArmParam || classArmOptions[0]?.value;
  const schoolId = classArmId ? schoolByClassArm.get(classArmId) : undefined;

  const [periods, classSubjects, subjects, teachers, staff, rooms, slots] = schoolId
    ? await Promise.all([
        getPeriods(schoolId),
        getClassSubjects(classArmId),
        getSubjects(schoolId),
        getTeachers(schoolId),
        getStaffList(schoolId),
        (async () => {
          const campuses = await getCampuses(schoolId);
          const roomLists = await Promise.all((campuses ?? []).map((campus) => getRooms(campus.public_id)));
          return roomLists.flatMap((list) => list ?? []);
        })(),
        getTimetableSlots(classArmId),
      ])
    : [null, null, null, null, null, [], null];

  const subjectNameById = new Map((subjects ?? []).map((s) => [s.public_id, s.name]));
  const staffNameById = new Map((staff ?? []).map((s) => [s.public_id, `${s.first_name} ${s.last_name}`]));
  const teacherNameById = new Map((teachers ?? []).map((t) => [t.public_id, staffNameById.get(t.staff) ?? "Unknown teacher"]));
  const classSubjectOptions = (classSubjects ?? []).map((cs) => ({
    value: cs.public_id,
    label: `${subjectNameById.get(cs.subject) ?? "Unknown subject"} — ${teacherNameById.get(cs.teacher) ?? "Unknown teacher"}`,
  }));
  const subjectLabelByClassSubject = new Map(classSubjectOptions.map((o) => [o.value, o.label]));
  const roomOptions = rooms.map((room) => ({ value: room.public_id, label: room.name }));
  const roomNameById = new Map(roomOptions.map((o) => [o.value, o.label]));

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-6">
      <div>
        <h1 className="text-xl font-semibold">Timetable</h1>
        <p className="text-sm text-muted-foreground">
          The weekly schedule of subjects, teachers, and rooms for a class.
        </p>
      </div>

      {classArmOptions.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Set up a class arm first, then build its timetable.
        </p>
      ) : (
        <>
          <TimetableClassArmFilter classArmOptions={classArmOptions} selectedClassArm={classArmId} />

          {periods === null ? (
            <p className="text-sm text-muted-foreground">You don&apos;t have access to this timetable.</p>
          ) : periods.length === 0 ? (
            <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed py-16 text-center">
              <CalendarDays className="h-8 w-8 text-muted-foreground" />
              <p className="font-medium">No periods set up</p>
              <p className="text-sm text-muted-foreground">
                Add periods on the school page first, then build this class&apos;s timetable.
              </p>
            </div>
          ) : (
            <>
              {classSubjectOptions.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  No subjects are assigned to this class yet — assign a subject and teacher to it first
                  to be able to add new slots below.
                </p>
              )}
              <TimetableGrid
                periods={periods}
                slots={slots ?? []}
                classSubjectOptions={classSubjectOptions}
                roomOptions={roomOptions}
                subjectLabelByClassSubject={subjectLabelByClassSubject}
                roomNameById={roomNameById}
              />
            </>
          )}
        </>
      )}
    </div>
  );
}
