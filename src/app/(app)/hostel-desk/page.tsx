import type { Metadata } from "next";
import { Bed, BedSingle, Pencil, Undo2, CheckCircle2, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { HostelAllocationFormDialog } from "@/components/hostel/hostel-allocation-form-dialog";
import {
  HostelIncidentFormDialog,
  HostelIncidentEditFormDialog,
} from "@/components/hostel/hostel-incident-form-dialog";
import { HostelActionButton } from "@/components/hostel/hostel-action-button";
import { DeleteConfirmButton } from "@/components/schools/delete-confirm-button";
import {
  getHostels,
  getHostelBuildings,
  getHostelRooms,
  getHostelBeds,
  getHostelAllocations,
  getHostelIncidents,
} from "@/lib/hostel";
import { getStudents } from "@/lib/students";
import { getAcademicYears } from "@/lib/schools";
import {
  createAllocation,
  vacateAllocation,
  createIncident,
  updateIncident,
  resolveIncident,
  deleteIncident,
} from "@/lib/actions/hostel";
import {
  hostelAllocationDefaults,
  hostelIncidentDefaults,
  incidentSeverityLabel,
} from "@/lib/hostel-forms";

export const metadata: Metadata = { title: "Hostel Desk" };

async function getBedOptions() {
  const hostels = await getHostels();
  if (!hostels) {
    return {
      availableOptions: [] as { value: string; label: string }[],
      labelByBedId: new Map<string, string>(),
      roomOptionsByHostel: new Map<string, { value: string; label: string }[]>(),
    };
  }

  const buildingLists = await Promise.all(hostels.map((h) => getHostelBuildings(h.public_id)));
  const buildings = buildingLists.flatMap((list, i) =>
    (list ?? []).map((building) => ({ ...building, hostelName: hostels[i].name }))
  );

  const roomLists = await Promise.all(buildings.map((b) => getHostelRooms(b.public_id)));
  const rooms = roomLists.flatMap((list, i) =>
    (list ?? []).map((room) => ({ ...room, buildingName: buildings[i].name, hostelName: buildings[i].hostelName }))
  );

  const bedLists = await Promise.all(rooms.map((r) => getHostelBeds(r.public_id)));
  const beds = bedLists.flatMap((list, i) => (list ?? []).map((bed) => ({ ...bed, roomInfo: rooms[i] })));

  return {
    availableOptions: beds
      .filter((bed) => bed.status === "available")
      .map((bed) => ({
        value: bed.public_id,
        label: `${bed.roomInfo.hostelName} / ${bed.roomInfo.buildingName} / Room ${bed.roomInfo.room_number} — Bed ${bed.bed_number}`,
      })),
    labelByBedId: new Map(
      beds.map((bed) => [
        bed.public_id,
        `${bed.roomInfo.hostelName} / ${bed.roomInfo.buildingName} / Room ${bed.roomInfo.room_number} — Bed ${bed.bed_number}`,
      ])
    ),
    roomOptionsByHostel: new Map<string, { value: string; label: string }[]>(
      hostels.map((h) => [
        h.public_id,
        rooms
          .filter((r) => r.hostelName === h.name)
          .map((r) => ({ value: r.public_id, label: `${r.buildingName} / Room ${r.room_number}` })),
      ])
    ),
  };
}

function severityVariant(severity: string): "default" | "secondary" | "destructive" {
  if (severity === "high") return "destructive";
  if (severity === "medium") return "secondary";
  return "default";
}

export default async function HostelDeskPage() {
  const [allocations, incidents, hostels, students, academicYears, bedData] = await Promise.all([
    getHostelAllocations(),
    getHostelIncidents(),
    getHostels(),
    getStudents(),
    getAcademicYears(),
    getBedOptions(),
  ]);

  const { availableOptions: bedOptions, labelByBedId, roomOptionsByHostel } = bedData;
  const studentOptions = (students ?? []).map((s) => ({
    value: s.public_id,
    label: `${s.first_name} ${s.last_name}`,
  }));
  const studentNameById = new Map(studentOptions.map((o) => [o.value, o.label]));
  const academicYearOptions = (academicYears ?? []).map((y) => ({ value: y.public_id, label: y.name }));
  const allRoomOptions = Array.from(roomOptionsByHostel.values()).flat();
  const hostelOptions = (hostels ?? []).map((h) => ({ value: h.public_id, label: h.name }));

  const activeAllocations = (allocations ?? []).filter((a) => a.is_active);
  const openIncidents = (incidents ?? []).filter((i) => i.status === "open");

  return (
    <div className="mx-auto max-w-5xl space-y-8 p-6">
      <div>
        <h1 className="text-xl font-semibold">Hostel Desk</h1>
        <p className="text-sm text-muted-foreground">Allocate beds and track hostel incidents.</p>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Bed allocations</h2>
          {allocations !== null && bedOptions.length > 0 && studentOptions.length > 0 && academicYearOptions.length > 0 && (
            <HostelAllocationFormDialog
              trigger={
                <Button size="sm">
                  <Plus className="h-4 w-4" />
                  Allocate a bed
                </Button>
              }
              title="Allocate a bed"
              defaultValues={hostelAllocationDefaults}
              studentOptions={studentOptions}
              bedOptions={bedOptions}
              academicYearOptions={academicYearOptions}
              action={createAllocation}
            />
          )}
        </div>

        {allocations === null ? (
          <p className="text-sm text-muted-foreground">You don&apos;t have access to hostel allocations.</p>
        ) : activeAllocations.length === 0 ? (
          <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed py-12 text-center">
            <Bed className="h-8 w-8 text-muted-foreground" />
            <p className="font-medium">No active allocations</p>
            <p className="text-sm text-muted-foreground">
              {bedOptions.length === 0
                ? "Set up a hostel with buildings, rooms, and beds first."
                : "Allocate a student to a bed to get started."}
            </p>
          </div>
        ) : (
          <div className="space-y-1.5">
            {activeAllocations.map((allocation) => (
              <div
                key={allocation.public_id}
                className="flex items-center justify-between rounded-md border px-3 py-2 text-sm"
              >
                <div>
                  <p className="font-medium">{studentNameById.get(allocation.student) ?? "Unknown student"}</p>
                  <p className="text-muted-foreground">
                    {labelByBedId.get(allocation.bed) ?? "Unknown bed"} · since {allocation.allocated_date}
                  </p>
                </div>
                <HostelActionButton
                  label="Vacate"
                  icon={<Undo2 className="h-4 w-4" />}
                  action={vacateAllocation.bind(null, allocation.public_id)}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Incidents</h2>
          {incidents !== null && hostels && hostels.length > 0 && (
            <HostelIncidentFormDialog
              trigger={
                <Button size="sm" variant="secondary">
                  <Plus className="h-4 w-4" />
                  Report an incident
                </Button>
              }
              title="Report an incident"
              defaultValues={hostelIncidentDefaults}
              hostelOptions={hostelOptions}
              roomOptions={allRoomOptions}
              studentOptions={studentOptions}
              action={createIncident}
            />
          )}
        </div>

        {incidents === null ? (
          <p className="text-sm text-muted-foreground">You don&apos;t have access to hostel incidents.</p>
        ) : openIncidents.length === 0 ? (
          <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed py-12 text-center">
            <BedSingle className="h-8 w-8 text-muted-foreground" />
            <p className="font-medium">No open incidents</p>
          </div>
        ) : (
          <div className="space-y-1.5">
            {openIncidents.map((incident) => (
              <div
                key={incident.public_id}
                className="flex items-center justify-between rounded-md border px-3 py-2 text-sm"
              >
                <div>
                  <p className="font-medium">{incident.description}</p>
                  <p className="text-muted-foreground">
                    {incident.student ? `${studentNameById.get(incident.student) ?? "Unknown student"} · ` : ""}
                    {incident.occurred_at.slice(0, 10)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={severityVariant(incident.severity)}>
                    {incidentSeverityLabel(incident.severity)}
                  </Badge>
                  <HostelIncidentEditFormDialog
                    trigger={
                      <Button variant="ghost" size="icon-sm">
                        <Pencil className="h-4 w-4" />
                      </Button>
                    }
                    title="Edit incident"
                    defaultValues={{
                      description: incident.description,
                      severity: incident.severity,
                      occurred_at: incident.occurred_at.slice(0, 10),
                      room: incident.room ?? "",
                      student: incident.student ?? "",
                    }}
                    roomOptions={allRoomOptions}
                    studentOptions={studentOptions}
                    action={updateIncident.bind(null, incident.public_id)}
                  />
                  <HostelActionButton
                    label="Resolve"
                    icon={<CheckCircle2 className="h-4 w-4" />}
                    action={resolveIncident.bind(null, incident.public_id)}
                  />
                  <DeleteConfirmButton
                    description="Delete this incident report?"
                    action={deleteIncident.bind(null, incident.public_id)}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
