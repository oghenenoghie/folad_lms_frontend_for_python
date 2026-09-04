import { z } from "zod";
import type { FieldConfig, SelectOption } from "@/components/schools/entity-form-dialog";

export const hostelTypeOptions: SelectOption[] = [
  { value: "boys", label: "Boys" },
  { value: "girls", label: "Girls" },
  { value: "mixed", label: "Mixed" },
];

export function hostelTypeLabel(type: string): string {
  return hostelTypeOptions.find((option) => option.value === type)?.label ?? type;
}

export const hostelSchema = z.object({
  name: z.string().min(1, "Name is required"),
  hostel_type: z.enum(["boys", "girls", "mixed"]),
  warden: z.string().optional(),
});
export type HostelFormValues = z.infer<typeof hostelSchema>;

export function hostelFields(wardenOptions: SelectOption[]): FieldConfig<HostelFormValues>[] {
  return [
    { name: "name", label: "Name", type: "text" },
    { name: "hostel_type", label: "Type", type: "select", options: hostelTypeOptions },
    { name: "warden", label: "Warden (optional)", type: "select", options: wardenOptions, placeholder: "No warden assigned" },
  ];
}

export const hostelDefaults: HostelFormValues = { name: "", hostel_type: "mixed", warden: "" };

export const hostelBuildingSchema = z.object({ name: z.string().min(1, "Name is required") });
export type HostelBuildingFormValues = z.infer<typeof hostelBuildingSchema>;
export const hostelBuildingFields: FieldConfig<HostelBuildingFormValues>[] = [
  { name: "name", label: "Name", type: "text" },
];
export const hostelBuildingDefaults: HostelBuildingFormValues = { name: "" };

export const hostelRoomSchema = z.object({
  room_number: z.string().optional(),
  capacity: z.coerce.number().int().min(1, "Capacity must be at least 1"),
});
export type HostelRoomFormValues = z.infer<typeof hostelRoomSchema>;
export const hostelRoomFields: FieldConfig<HostelRoomFormValues>[] = [
  { name: "room_number", label: "Room number (leave blank to auto-generate)", type: "text" },
  { name: "capacity", label: "Capacity (number of beds)", type: "number" },
];
export const hostelRoomDefaults: HostelRoomFormValues = { room_number: "", capacity: 1 };

// A bed's status isn't a form field — apps.hostel.services.bed_service
// never accepts it from a client; it only ever changes as a side effect
// of allocating/vacating a bed (see allocation_service).
export const hostelBedSchema = z.object({ bed_number: z.string().optional() });
export type HostelBedFormValues = z.infer<typeof hostelBedSchema>;
export const hostelBedFields: FieldConfig<HostelBedFormValues>[] = [
  { name: "bed_number", label: "Bed number (leave blank to auto-generate)", type: "text" },
];
export const hostelBedDefaults: HostelBedFormValues = { bed_number: "" };

// Re-allocating a student to a different bed is vacate-then-allocate,
// never an in-place edit (apps.hostel.services.allocation_service) — so
// there's only a create form here, no edit form.
export const hostelAllocationSchema = z.object({
  student: z.string().min(1, "Student is required"),
  bed: z.string().min(1, "Bed is required"),
  academic_year: z.string().min(1, "Academic year is required"),
  allocated_date: z.string().optional(),
});
export type HostelAllocationFormValues = z.infer<typeof hostelAllocationSchema>;

export function hostelAllocationFields(
  studentOptions: SelectOption[],
  bedOptions: SelectOption[],
  academicYearOptions: SelectOption[]
): FieldConfig<HostelAllocationFormValues>[] {
  return [
    { name: "student", label: "Student", type: "select", options: studentOptions, placeholder: "Select a student" },
    { name: "bed", label: "Bed", type: "select", options: bedOptions, placeholder: "Select an available bed" },
    {
      name: "academic_year",
      label: "Academic year",
      type: "select",
      options: academicYearOptions,
      placeholder: "Select an academic year",
    },
    { name: "allocated_date", label: "Allocated date (defaults to today)", type: "date" },
  ];
}

export const hostelAllocationDefaults: HostelAllocationFormValues = {
  student: "",
  bed: "",
  academic_year: "",
  allocated_date: "",
};

export const incidentSeverityOptions: SelectOption[] = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
];

export function incidentSeverityLabel(severity: string): string {
  return incidentSeverityOptions.find((option) => option.value === severity)?.label ?? severity;
}

// occurred_at is a required DateTimeField server-side — the date-only
// input here is normalized to a full ISO datetime in
// actions/hostel.ts's normalizeOccurredAt, same reasoning as
// actions/academics.ts's normalizeEffectiveTo for a different field shape.
export const hostelIncidentSchema = z.object({
  hostel: z.string().min(1, "Hostel is required"),
  description: z.string().min(1, "Description is required"),
  severity: z.enum(["low", "medium", "high"]),
  occurred_at: z.string().min(1, "Date is required"),
  room: z.string().optional(),
  student: z.string().optional(),
});
export type HostelIncidentFormValues = z.infer<typeof hostelIncidentSchema>;

export function hostelIncidentFields(
  hostelOptions: SelectOption[],
  roomOptions: SelectOption[],
  studentOptions: SelectOption[]
): FieldConfig<HostelIncidentFormValues>[] {
  return [
    { name: "hostel", label: "Hostel", type: "select", options: hostelOptions, placeholder: "Select a hostel" },
    { name: "description", label: "Description", type: "text" },
    { name: "severity", label: "Severity", type: "select", options: incidentSeverityOptions },
    { name: "occurred_at", label: "Date occurred", type: "date" },
    { name: "room", label: "Room (optional)", type: "select", options: roomOptions, placeholder: "No specific room" },
    {
      name: "student",
      label: "Student (optional)",
      type: "select",
      options: studentOptions,
      placeholder: "No specific student",
    },
  ];
}

export const hostelIncidentDefaults: HostelIncidentFormValues = {
  hostel: "",
  description: "",
  severity: "low",
  occurred_at: "",
  room: "",
  student: "",
};

// hostel isn't editable after the fact — apps.hostel.views
// .HostelIncidentDetailView.perform_update drops it on PATCH, same
// convention as ClassSubject/Scholarship's fixed parent FK.
export const hostelIncidentEditSchema = z.object({
  description: z.string().min(1, "Description is required"),
  severity: z.enum(["low", "medium", "high"]),
  occurred_at: z.string().min(1, "Date is required"),
  room: z.string().optional(),
  student: z.string().optional(),
});
export type HostelIncidentEditFormValues = z.infer<typeof hostelIncidentEditSchema>;

export function hostelIncidentEditFields(
  roomOptions: SelectOption[],
  studentOptions: SelectOption[]
): FieldConfig<HostelIncidentEditFormValues>[] {
  return [
    { name: "description", label: "Description", type: "text" },
    { name: "severity", label: "Severity", type: "select", options: incidentSeverityOptions },
    { name: "occurred_at", label: "Date occurred", type: "date" },
    { name: "room", label: "Room (optional)", type: "select", options: roomOptions, placeholder: "No specific room" },
    {
      name: "student",
      label: "Student (optional)",
      type: "select",
      options: studentOptions,
      placeholder: "No specific student",
    },
  ];
}
