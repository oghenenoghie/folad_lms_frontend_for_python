import type { Metadata } from "next";
import { Bus, Undo2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TransportAssignmentFormDialog } from "@/components/transport/transport-assignment-form-dialog";
import { TransportActionButton } from "@/components/transport/transport-action-button";
import { getVehicles, getTransportRoutes, getRouteStops, getTransportAssignments } from "@/lib/transport";
import { getStudents } from "@/lib/students";
import { getAcademicYears } from "@/lib/schools";
import { createAssignment, unassignTransport } from "@/lib/actions/transport";
import { transportAssignmentDefaults } from "@/lib/transport-forms";

export const metadata: Metadata = { title: "Transport Desk" };

async function getStopOptions() {
  const routes = await getTransportRoutes();
  if (!routes) {
    return {
      stopOptions: [] as { value: string; label: string }[],
      labelByStopId: new Map<string, string>(),
    };
  }

  const stopLists = await Promise.all(routes.map((r) => getRouteStops(r.public_id)));
  const stops = stopLists.flatMap((list, i) =>
    (list ?? []).map((stop) => ({ ...stop, routeName: routes[i].name }))
  );

  const labelByStopId = new Map(
    stops.map((stop) => [stop.public_id, `${stop.routeName} — ${stop.name} (${stop.pickup_time.slice(0, 5)})`])
  );

  return {
    stopOptions: stops
      .slice()
      .sort((a, b) => a.routeName.localeCompare(b.routeName) || a.sequence - b.sequence)
      .map((stop) => ({ value: stop.public_id, label: labelByStopId.get(stop.public_id)! })),
    labelByStopId,
  };
}

export default async function TransportDeskPage() {
  const [assignments, vehicles, routes, students, academicYears, stopData] = await Promise.all([
    getTransportAssignments(),
    getVehicles(),
    getTransportRoutes(),
    getStudents(),
    getAcademicYears(),
    getStopOptions(),
  ]);

  const { stopOptions, labelByStopId } = stopData;
  const studentOptions = (students ?? []).map((s) => ({
    value: s.public_id,
    label: `${s.first_name} ${s.last_name}`,
  }));
  const studentNameById = new Map(studentOptions.map((o) => [o.value, o.label]));
  const vehicleOptions = (vehicles ?? []).map((v) => ({ value: v.public_id, label: v.registration_number }));
  const vehicleNameById = new Map(vehicleOptions.map((o) => [o.value, o.label]));
  const routeOptions = (routes ?? []).map((r) => ({ value: r.public_id, label: r.name }));
  const academicYearOptions = (academicYears ?? []).map((y) => ({ value: y.public_id, label: y.name }));

  const activeAssignments = (assignments ?? []).filter((a) => a.is_active);

  const canAssign =
    (assignments ?? null) !== null &&
    studentOptions.length > 0 &&
    vehicleOptions.length > 0 &&
    routeOptions.length > 0 &&
    stopOptions.length > 0 &&
    academicYearOptions.length > 0;

  return (
    <div className="mx-auto max-w-5xl space-y-8 p-6">
      <div>
        <h1 className="text-xl font-semibold">Transport Desk</h1>
        <p className="text-sm text-muted-foreground">Assign students to a vehicle, route, and pickup stop.</p>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Transport assignments</h2>
          {canAssign && (
            <TransportAssignmentFormDialog
              trigger={
                <Button size="sm">
                  <Plus className="h-4 w-4" />
                  Assign to transport
                </Button>
              }
              title="Assign to transport"
              defaultValues={transportAssignmentDefaults}
              studentOptions={studentOptions}
              vehicleOptions={vehicleOptions}
              routeOptions={routeOptions}
              stopOptions={stopOptions}
              academicYearOptions={academicYearOptions}
              action={createAssignment}
            />
          )}
        </div>

        {assignments === null ? (
          <p className="text-sm text-muted-foreground">You don&apos;t have access to transport assignments.</p>
        ) : activeAssignments.length === 0 ? (
          <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed py-12 text-center">
            <Bus className="h-8 w-8 text-muted-foreground" />
            <p className="font-medium">No active assignments</p>
            <p className="text-sm text-muted-foreground">
              {stopOptions.length === 0 || vehicleOptions.length === 0
                ? "Set up a vehicle and a transport route with stops first."
                : "Assign a student to a vehicle to get started."}
            </p>
          </div>
        ) : (
          <div className="space-y-1.5">
            {activeAssignments.map((assignment) => (
              <div
                key={assignment.public_id}
                className="flex items-center justify-between rounded-md border px-3 py-2 text-sm"
              >
                <div>
                  <p className="font-medium">{studentNameById.get(assignment.student) ?? "Unknown student"}</p>
                  <p className="text-muted-foreground">
                    {vehicleNameById.get(assignment.vehicle) ?? "Unknown vehicle"} ·{" "}
                    {labelByStopId.get(assignment.stop) ?? "Unknown stop"} · since {assignment.assigned_date}
                  </p>
                </div>
                <TransportActionButton
                  label="Unassign"
                  icon={<Undo2 className="h-4 w-4" />}
                  action={unassignTransport.bind(null, assignment.public_id)}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
