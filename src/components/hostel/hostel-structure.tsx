import { Pencil, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { HostelBuildingFormDialog } from "@/components/hostel/hostel-building-form-dialog";
import { HostelRoomFormDialog } from "@/components/hostel/hostel-room-form-dialog";
import { HostelBedFormDialog } from "@/components/hostel/hostel-bed-form-dialog";
import { DeleteConfirmButton } from "@/components/schools/delete-confirm-button";
import { getHostelBuildings, getHostelRooms, getHostelBeds, type HostelRoom } from "@/lib/hostel";
import {
  createBuilding,
  updateBuilding,
  deleteBuilding,
  createRoom,
  updateRoom,
  deleteRoom,
  createBed,
  updateBed,
  deleteBed,
} from "@/lib/actions/hostel";
import { hostelBuildingDefaults, hostelRoomDefaults, hostelBedDefaults } from "@/lib/hostel-forms";

const BED_STATUS_VARIANT: Record<string, "default" | "secondary" | "destructive"> = {
  available: "default",
  occupied: "secondary",
  maintenance: "destructive",
};

async function RoomCard({ hostelId, room }: { hostelId: string; room: HostelRoom }) {
  const beds = await getHostelBeds(room.public_id);

  return (
    <div className="rounded-lg border">
      <div className="flex items-center justify-between gap-3 border-b px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="font-medium">Room {room.room_number}</span>
          <span className="text-sm text-muted-foreground">Capacity {room.capacity}</span>
        </div>
        <div className="flex items-center gap-1">
          <HostelRoomFormDialog
            trigger={
              <Button variant="ghost" size="icon-sm">
                <Pencil className="h-4 w-4" />
              </Button>
            }
            title="Edit room"
            defaultValues={{ room_number: room.room_number, capacity: room.capacity }}
            action={updateRoom.bind(null, hostelId, room.public_id)}
          />
          <DeleteConfirmButton
            description={`Delete room ${room.room_number}? This cannot be undone.`}
            action={deleteRoom.bind(null, hostelId, room.public_id)}
          />
        </div>
      </div>

      {beds !== null && (
        <div className="px-4 py-3">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Beds</p>
            <HostelBedFormDialog
              trigger={
                <button type="button" className="text-xs font-medium text-primary hover:underline">
                  + Add bed
                </button>
              }
              title={`New bed (Room ${room.room_number})`}
              defaultValues={hostelBedDefaults}
              action={createBed.bind(null, hostelId, room.public_id)}
            />
          </div>
          {beds.length === 0 ? (
            <p className="text-sm text-muted-foreground">No beds yet.</p>
          ) : (
            <div className="space-y-1.5">
              {beds.map((bed) => (
                <div
                  key={bed.public_id}
                  className="flex items-center justify-between rounded-md bg-muted/50 px-3 py-1.5 text-sm"
                >
                  <span className="flex items-center gap-2">
                    Bed {bed.bed_number}
                    <Badge variant={BED_STATUS_VARIANT[bed.status] ?? "secondary"}>{bed.status}</Badge>
                  </span>
                  <div className="flex items-center gap-1">
                    <HostelBedFormDialog
                      trigger={
                        <Button variant="ghost" size="icon-sm">
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                      }
                      title="Edit bed"
                      defaultValues={{ bed_number: bed.bed_number }}
                      action={updateBed.bind(null, hostelId, bed.public_id)}
                    />
                    <DeleteConfirmButton
                      description={`Delete bed ${bed.bed_number}?`}
                      action={deleteBed.bind(null, hostelId, bed.public_id)}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export async function HostelStructure({ hostelId }: { hostelId: string }) {
  const buildings = await getHostelBuildings(hostelId);
  if (buildings === null) return null;

  const roomsByBuilding = await Promise.all(
    buildings.map(async (building) => ({ building, rooms: await getHostelRooms(building.public_id) }))
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Buildings, rooms &amp; beds</h2>
        <HostelBuildingFormDialog
          trigger={
            <Button size="sm" variant="secondary">
              <Plus className="h-4 w-4" />
              New building
            </Button>
          }
          title="New building"
          defaultValues={hostelBuildingDefaults}
          action={createBuilding.bind(null, hostelId)}
        />
      </div>

      {buildings.length === 0 ? (
        <p className="text-sm text-muted-foreground">No buildings yet.</p>
      ) : (
        roomsByBuilding.map(({ building, rooms }) => (
          <div key={building.public_id} className="space-y-3 rounded-lg border p-4">
            <div className="flex items-center justify-between">
              <span className="font-medium">{building.name}</span>
              <div className="flex items-center gap-1">
                <HostelBuildingFormDialog
                  trigger={
                    <Button variant="ghost" size="icon-sm">
                      <Pencil className="h-4 w-4" />
                    </Button>
                  }
                  title="Edit building"
                  defaultValues={{ name: building.name }}
                  action={updateBuilding.bind(null, hostelId, building.public_id)}
                />
                <DeleteConfirmButton
                  description={`Delete building ${building.name}? This cannot be undone.`}
                  action={deleteBuilding.bind(null, hostelId, building.public_id)}
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Rooms</p>
              <HostelRoomFormDialog
                trigger={
                  <button type="button" className="text-xs font-medium text-primary hover:underline">
                    + Add room
                  </button>
                }
                title={`New room (${building.name})`}
                defaultValues={hostelRoomDefaults}
                action={createRoom.bind(null, hostelId, building.public_id)}
              />
            </div>
            {rooms === null || rooms.length === 0 ? (
              <p className="text-sm text-muted-foreground">No rooms yet.</p>
            ) : (
              <div className="space-y-3">
                {rooms.map((room) => (
                  <RoomCard key={room.public_id} hostelId={hostelId} room={room} />
                ))}
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
}
