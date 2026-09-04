import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Pencil, Plus, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DeleteConfirmButton } from "@/components/schools/delete-confirm-button";
import { ExamEditFormDialog } from "@/components/examinations/exam-form-dialog";
import {
  ExamScheduleCreateFormDialog,
  ExamScheduleEditFormDialog,
} from "@/components/examinations/exam-schedule-form-dialog";
import { InvigilatorFormDialog } from "@/components/examinations/invigilator-form-dialog";
import {
  getExamResult,
  getExamSchedules,
  getInvigilators,
  type ExamSchedule,
} from "@/lib/examinations";
import { getClassSubjects, getSubjects, getClassArms, getClassLevels } from "@/lib/academics";
import { getRooms } from "@/lib/timetable";
import { getStaffList, getTeachers } from "@/lib/staff";
import {
  updateExam,
  deleteExam,
  createExamSchedule,
  updateExamSchedule,
  deleteExamSchedule,
  createInvigilator,
  deleteInvigilator,
} from "@/lib/actions/examinations";
import { examScheduleCreateDefaults, invigilatorDefaults } from "@/lib/examinations-forms";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ publicId: string }>;
}): Promise<Metadata> {
  const { publicId } = await params;
  const result = await getExamResult(publicId);
  return { title: result.status === "ok" ? result.data.name : "Exam" };
}

async function getClassSubjectOptions() {
  const [classSubjects, subjects, classArms, classLevels] = await Promise.all([
    getClassSubjects(),
    getSubjects(),
    getClassArms(),
    getClassLevels(),
  ]);
  if (!classSubjects || !subjects || !classArms || !classLevels) return new Map<string, string>();

  const subjectNameById = new Map(subjects.map((s) => [s.public_id, s.name]));
  const classLevelNameById = new Map(classLevels.map((l) => [l.public_id, l.name]));
  const classArmById = new Map(classArms.map((a) => [a.public_id, a]));

  return new Map(
    classSubjects.map((cs) => {
      const classArm = classArmById.get(cs.class_arm);
      const classLevelName = classArm ? (classLevelNameById.get(classArm.class_level) ?? "") : "";
      const label = `${subjectNameById.get(cs.subject) ?? "Unknown subject"} — ${classLevelName}${classArm?.name ?? ""}`;
      return [cs.public_id, label];
    })
  );
}

function InvigilatorList({
  examId,
  schedule,
  invigilators,
  teacherOptions,
  teacherLabelById,
}: {
  examId: string;
  schedule: ExamSchedule;
  invigilators: { public_id: string; teacher: string }[];
  teacherOptions: { value: string; label: string }[];
  teacherLabelById: Map<string, string>;
}) {
  return (
    <div className="px-4 py-3">
      <div className="mb-2 flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Invigilators</p>
        {teacherOptions.length > 0 && (
          <InvigilatorFormDialog
            trigger={
              <button type="button" className="text-xs font-medium text-primary hover:underline">
                + Assign invigilator
              </button>
            }
            title="Assign invigilator"
            defaultValues={invigilatorDefaults}
            teacherOptions={teacherOptions}
            action={createInvigilator.bind(null, examId, schedule.public_id)}
          />
        )}
      </div>
      {invigilators.length === 0 ? (
        <p className="text-sm text-muted-foreground">No invigilators assigned yet.</p>
      ) : (
        <div className="space-y-1.5">
          {invigilators.map((inv) => (
            <div
              key={inv.public_id}
              className="flex items-center justify-between rounded-md bg-muted/50 px-3 py-1.5 text-sm"
            >
              <span className="flex items-center gap-2">
                <Users className="h-3.5 w-3.5 text-muted-foreground" />
                {teacherLabelById.get(inv.teacher) ?? "Unknown teacher"}
              </span>
              <DeleteConfirmButton
                description="Unassign this invigilator?"
                action={deleteInvigilator.bind(null, examId, inv.public_id)}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

async function ScheduleCard({
  examId,
  schedule,
  classSubjectLabel,
  roomOptions,
  roomLabelById,
  teacherOptions,
  teacherLabelById,
}: {
  examId: string;
  schedule: ExamSchedule;
  classSubjectLabel: string;
  roomOptions: { value: string; label: string }[];
  roomLabelById: Map<string, string>;
  teacherOptions: { value: string; label: string }[];
  teacherLabelById: Map<string, string>;
}) {
  const invigilators = await getInvigilators(schedule.public_id);

  return (
    <div className="rounded-lg border">
      <div className="flex items-center justify-between gap-3 border-b px-4 py-3">
        <div>
          <p className="font-medium">{classSubjectLabel}</p>
          <p className="text-sm text-muted-foreground">
            {schedule.date} · {schedule.start_time}–{schedule.end_time}
            {schedule.room && ` · ${roomLabelById.get(schedule.room) ?? "Unknown room"}`}
          </p>
        </div>
        <div className="flex items-center gap-1">
          <ExamScheduleEditFormDialog
            trigger={
              <Button variant="ghost" size="icon-sm">
                <Pencil className="h-4 w-4" />
              </Button>
            }
            title="Edit exam schedule"
            defaultValues={{
              date: schedule.date,
              start_time: schedule.start_time,
              end_time: schedule.end_time,
              room: schedule.room ?? "",
            }}
            roomOptions={roomOptions}
            action={updateExamSchedule.bind(null, examId, schedule.public_id)}
          />
          <DeleteConfirmButton
            description="Delete this exam schedule? Any invigilator assignments on it go with it."
            action={deleteExamSchedule.bind(null, examId, schedule.public_id)}
          />
        </div>
      </div>

      {invigilators !== null && (
        <InvigilatorList
          examId={examId}
          schedule={schedule}
          invigilators={invigilators}
          teacherOptions={teacherOptions}
          teacherLabelById={teacherLabelById}
        />
      )}
    </div>
  );
}

export default async function ExamDetailPage({ params }: { params: Promise<{ publicId: string }> }) {
  const { publicId } = await params;
  const result = await getExamResult(publicId);
  if (result.status === "forbidden") {
    return (
      <div className="mx-auto max-w-5xl space-y-6 p-6">
        <p className="text-sm text-muted-foreground">You don&apos;t have access to this exam.</p>
      </div>
    );
  }
  if (result.status === "not_found") notFound();
  const exam = result.data;

  const [schedules, classSubjectLabelById, rooms, teachers, staffList] = await Promise.all([
    getExamSchedules(publicId),
    getClassSubjectOptions(),
    getRooms(),
    getTeachers(),
    getStaffList(),
  ]);

  const classSubjectOptions = Array.from(classSubjectLabelById, ([value, label]) => ({ value, label }));
  const roomOptions = (rooms ?? []).map((room) => ({ value: room.public_id, label: room.name }));
  const roomLabelById = new Map(roomOptions.map((o) => [o.value, o.label]));

  const staffNameById = new Map(
    (staffList ?? []).map((staff) => [staff.public_id, `${staff.first_name} ${staff.last_name}`])
  );
  const teacherOptions = (teachers ?? []).map((teacher) => ({
    value: teacher.public_id,
    label: staffNameById.get(teacher.staff) ?? "Unknown teacher",
  }));
  const teacherLabelById = new Map(teacherOptions.map((o) => [o.value, o.label]));

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-6">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <h1 className="text-xl font-semibold">{exam.name}</h1>
          <p className="text-sm text-muted-foreground">
            {exam.start_date} – {exam.end_date}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <ExamEditFormDialog
            trigger={
              <Button variant="secondary">
                <Pencil className="h-4 w-4" />
                Edit
              </Button>
            }
            title="Edit exam"
            defaultValues={{ name: exam.name, start_date: exam.start_date, end_date: exam.end_date }}
            action={updateExam.bind(null, exam.public_id)}
          />
          <DeleteConfirmButton
            description={`Delete ${exam.name}? Its schedules and invigilator assignments go with it.`}
            action={deleteExam.bind(null, exam.public_id)}
          />
        </div>
      </div>

      <div className="space-y-4 rounded-lg border p-4">
        <div className="flex items-center justify-between">
          <h2 className="font-medium">Schedules</h2>
          {schedules !== null && classSubjectOptions.length > 0 && (
            <ExamScheduleCreateFormDialog
              trigger={
                <Button size="sm" variant="secondary">
                  <Plus className="h-4 w-4" />
                  New schedule
                </Button>
              }
              title="New exam schedule"
              defaultValues={examScheduleCreateDefaults}
              classSubjectOptions={classSubjectOptions}
              roomOptions={roomOptions}
              action={createExamSchedule.bind(null, exam.public_id)}
            />
          )}
        </div>

        {schedules === null || schedules.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            {classSubjectOptions.length === 0
              ? "Create a class subject first, then schedule this exam for it."
              : "No schedules yet for this exam."}
          </p>
        ) : (
          <div className="space-y-4">
            {schedules.map((schedule) => (
              <ScheduleCard
                key={schedule.public_id}
                examId={exam.public_id}
                schedule={schedule}
                classSubjectLabel={classSubjectLabelById.get(schedule.class_subject) ?? "Unknown subject"}
                roomOptions={roomOptions}
                roomLabelById={roomLabelById}
                teacherOptions={teacherOptions}
                teacherLabelById={teacherLabelById}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
