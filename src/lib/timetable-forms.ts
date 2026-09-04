import { z } from "zod";
import type { FieldConfig, SelectOption } from "@/components/schools/entity-form-dialog";

export const roomSchema = z.object({
  name: z.string().min(1, "Name is required"),
  capacity: z.string().optional(),
  is_active: z.boolean(),
});
export type RoomFormValues = z.infer<typeof roomSchema>;

export const roomFields: FieldConfig<RoomFormValues>[] = [
  { name: "name", label: "Name", type: "text" },
  { name: "capacity", label: "Capacity (optional)", type: "number" },
  { name: "is_active", label: "Active", type: "checkbox" },
];

export const roomDefaults: RoomFormValues = { name: "", capacity: "", is_active: true };

export const periodSchema = z.object({
  name: z.string().min(1, "Name is required"),
  sequence: z.coerce.number().int().min(1, "Sequence must be at least 1"),
  start_time: z.string().min(1, "Start time is required"),
  end_time: z.string().min(1, "End time is required"),
  is_active: z.boolean(),
});
export type PeriodFormValues = z.infer<typeof periodSchema>;

export const periodFields: FieldConfig<PeriodFormValues>[] = [
  { name: "name", label: "Name (e.g. Period 1)", type: "text" },
  { name: "sequence", label: "Sequence (order in the day)", type: "number" },
  { name: "start_time", label: "Start time", type: "time" },
  { name: "end_time", label: "End time", type: "time" },
  { name: "is_active", label: "Active", type: "checkbox" },
];

export const periodDefaults: PeriodFormValues = {
  name: "",
  sequence: 1,
  start_time: "",
  end_time: "",
  is_active: true,
};

// A slot's class_subject/day_of_week/period are fixed at creation — the
// day+period come from the grid cell the "+" was clicked in (see
// TimetableGrid), and the subject/teacher pair isn't editable afterward
// (apps.timetable.views.TimetableSlotDetailView.perform_update drops
// class_subject on PATCH) — a reassignment is meant to be a new slot, same
// convention as ClassSubject/Scholarship. Only room and active status can
// be revised in place.
export const timetableSlotCreateSchema = z.object({
  class_subject: z.string().min(1, "Subject is required"),
  room: z.string().optional(),
  is_active: z.boolean(),
});
export type TimetableSlotCreateFormValues = z.infer<typeof timetableSlotCreateSchema>;

export function timetableSlotCreateFields(
  classSubjectOptions: SelectOption[],
  roomOptions: SelectOption[]
): FieldConfig<TimetableSlotCreateFormValues>[] {
  return [
    {
      name: "class_subject",
      label: "Subject",
      type: "select",
      options: classSubjectOptions,
      placeholder: "Select a subject",
    },
    {
      name: "room",
      label: "Room (optional)",
      type: "select",
      options: roomOptions,
      placeholder: "No fixed room",
    },
    { name: "is_active", label: "Active", type: "checkbox" },
  ];
}

export const timetableSlotCreateDefaults: TimetableSlotCreateFormValues = {
  class_subject: "",
  room: "",
  is_active: true,
};

export const timetableSlotEditSchema = z.object({
  room: z.string().optional(),
  is_active: z.boolean(),
});
export type TimetableSlotEditFormValues = z.infer<typeof timetableSlotEditSchema>;

export function timetableSlotEditFields(
  roomOptions: SelectOption[]
): FieldConfig<TimetableSlotEditFormValues>[] {
  return [
    {
      name: "room",
      label: "Room (optional)",
      type: "select",
      options: roomOptions,
      placeholder: "No fixed room",
    },
    { name: "is_active", label: "Active", type: "checkbox" },
  ];
}

export const DAY_OF_WEEK_OPTIONS: SelectOption[] = [
  { value: "monday", label: "Monday" },
  { value: "tuesday", label: "Tuesday" },
  { value: "wednesday", label: "Wednesday" },
  { value: "thursday", label: "Thursday" },
  { value: "friday", label: "Friday" },
  { value: "saturday", label: "Saturday" },
  { value: "sunday", label: "Sunday" },
];
