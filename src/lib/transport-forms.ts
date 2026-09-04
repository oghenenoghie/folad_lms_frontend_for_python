import { z } from "zod";
import type { FieldConfig, SelectOption } from "@/components/schools/entity-form-dialog";

export const vehicleStatusOptions: SelectOption[] = [
  { value: "active", label: "Active" },
  { value: "maintenance", label: "Maintenance" },
  { value: "retired", label: "Retired" },
];

export function vehicleStatusLabel(status: string): string {
  return vehicleStatusOptions.find((option) => option.value === status)?.label ?? status;
}

export const vehicleSchema = z.object({
  registration_number: z.string().min(1, "Registration number is required"),
  make: z.string().optional(),
  model: z.string().optional(),
  capacity: z.coerce.number().int().min(1, "Capacity must be at least 1"),
  status: z.enum(["active", "maintenance", "retired"]),
});
export type VehicleFormValues = z.infer<typeof vehicleSchema>;

export const vehicleFields: FieldConfig<VehicleFormValues>[] = [
  { name: "registration_number", label: "Registration number", type: "text" },
  { name: "make", label: "Make (optional)", type: "text" },
  { name: "model", label: "Model (optional)", type: "text" },
  { name: "capacity", label: "Capacity (seats)", type: "number" },
  { name: "status", label: "Status", type: "select", options: vehicleStatusOptions },
];

export const vehicleDefaults: VehicleFormValues = {
  registration_number: "",
  make: "",
  model: "",
  capacity: 1,
  status: "active",
};

export const transportRouteSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
});
export type TransportRouteFormValues = z.infer<typeof transportRouteSchema>;

export const transportRouteFields: FieldConfig<TransportRouteFormValues>[] = [
  { name: "name", label: "Route name", type: "text" },
  { name: "description", label: "Description (optional)", type: "text" },
];

export const transportRouteDefaults: TransportRouteFormValues = { name: "", description: "" };

export const routeStopSchema = z.object({
  name: z.string().min(1, "Name is required"),
  sequence: z.coerce.number().int().min(1, "Sequence must be at least 1"),
  pickup_time: z.string().min(1, "Pickup time is required"),
});
export type RouteStopFormValues = z.infer<typeof routeStopSchema>;

export const routeStopFields: FieldConfig<RouteStopFormValues>[] = [
  { name: "name", label: "Stop name", type: "text" },
  { name: "sequence", label: "Sequence (order along the route)", type: "number" },
  { name: "pickup_time", label: "Pickup time", type: "time" },
];

export const routeStopDefaults: RouteStopFormValues = { name: "", sequence: 1, pickup_time: "" };

export const transportAssignmentSchema = z.object({
  student: z.string().min(1, "Student is required"),
  vehicle: z.string().min(1, "Vehicle is required"),
  route: z.string().min(1, "Route is required"),
  stop: z.string().min(1, "Stop is required"),
  academic_year: z.string().min(1, "Academic year is required"),
  assigned_date: z.string().optional(),
});
export type TransportAssignmentFormValues = z.infer<typeof transportAssignmentSchema>;

export function transportAssignmentFields(
  studentOptions: SelectOption[],
  vehicleOptions: SelectOption[],
  routeOptions: SelectOption[],
  stopOptions: SelectOption[],
  academicYearOptions: SelectOption[]
): FieldConfig<TransportAssignmentFormValues>[] {
  return [
    { name: "student", label: "Student", type: "select", options: studentOptions, placeholder: "Select a student" },
    { name: "vehicle", label: "Vehicle", type: "select", options: vehicleOptions, placeholder: "Select a vehicle" },
    { name: "route", label: "Route", type: "select", options: routeOptions, placeholder: "Select a route" },
    { name: "stop", label: "Pickup stop", type: "select", options: stopOptions, placeholder: "Select a stop" },
    {
      name: "academic_year",
      label: "Academic year",
      type: "select",
      options: academicYearOptions,
      placeholder: "Select an academic year",
    },
    { name: "assigned_date", label: "Assigned date (defaults to today)", type: "date" },
  ];
}

export const transportAssignmentDefaults: TransportAssignmentFormValues = {
  student: "",
  vehicle: "",
  route: "",
  stop: "",
  academic_year: "",
  assigned_date: "",
};

export const maintenanceStatusOptions: SelectOption[] = [
  { value: "scheduled", label: "Scheduled" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];

export function maintenanceStatusLabel(status: string): string {
  return maintenanceStatusOptions.find((option) => option.value === status)?.label ?? status;
}

export const vehicleMaintenanceSchema = z.object({
  description: z.string().min(1, "Description is required"),
  // A nullable BigIntegerField server-side — kept as a plain string here
  // (normalized to a number or null in actions/transport.ts) rather than
  // z.coerce.number(), since coercing an empty optional input gives NaN,
  // not undefined. Same reasoning as actions/timetable.ts's normalizeCapacity.
  cost_minor: z.string().optional(),
  scheduled_date: z.string().min(1, "Scheduled date is required"),
  completed_date: z.string().optional(),
  status: z.enum(["scheduled", "completed", "cancelled"]),
});
export type VehicleMaintenanceFormValues = z.infer<typeof vehicleMaintenanceSchema>;

export const vehicleMaintenanceFields: FieldConfig<VehicleMaintenanceFormValues>[] = [
  { name: "description", label: "Description", type: "text" },
  { name: "cost_minor", label: "Cost (in minor units, e.g. cents; optional)", type: "number" },
  { name: "scheduled_date", label: "Scheduled date", type: "date" },
  { name: "completed_date", label: "Completed date (optional)", type: "date" },
  { name: "status", label: "Status", type: "select", options: maintenanceStatusOptions },
];

export const vehicleMaintenanceDefaults: VehicleMaintenanceFormValues = {
  description: "",
  cost_minor: "",
  scheduled_date: "",
  completed_date: "",
  status: "scheduled",
};
