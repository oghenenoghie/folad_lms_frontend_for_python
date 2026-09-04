import { DoorOpen, Pencil, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RoomFormDialog } from "@/components/timetable/room-form-dialog";
import { DeleteConfirmButton } from "@/components/schools/delete-confirm-button";
import { getCampuses } from "@/lib/schools";
import { getRooms } from "@/lib/timetable";
import { createRoom, updateRoom, deleteRoom } from "@/lib/actions/timetable";
import { roomDefaults } from "@/lib/timetable-forms";

export async function RoomsSection({ schoolId }: { schoolId: string }) {
  const campuses = await getCampuses(schoolId);
  if (campuses === null) return null;

  // Rooms are scoped per campus (a physical space belongs to one campus),
  // same reasoning as ClassLevelsSection's per-campus class ladders.
  const roomsByCampus = await Promise.all(
    campuses.map(async (campus) => ({ campus, rooms: await getRooms(campus.public_id) }))
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Rooms</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {campuses.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-8 text-center">
            <DoorOpen className="h-6 w-6 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Add a campus first, then set up its rooms.</p>
          </div>
        ) : (
          roomsByCampus.map(({ campus, rooms }) => (
            <div key={campus.public_id} className="space-y-3">
              <div className="flex items-center justify-between">
                {campuses.length > 1 ? (
                  <p className="text-sm font-semibold text-muted-foreground">{campus.name}</p>
                ) : (
                  <span />
                )}
                <RoomFormDialog
                  trigger={
                    <Button size="sm" variant="secondary">
                      <Plus className="h-4 w-4" />
                      New room
                    </Button>
                  }
                  title={`New room (${campus.name})`}
                  defaultValues={roomDefaults}
                  action={createRoom.bind(null, schoolId, campus.public_id)}
                />
              </div>
              {rooms === null || rooms.length === 0 ? (
                <p className="text-sm text-muted-foreground">No rooms yet for this campus.</p>
              ) : (
                <div className="space-y-1.5">
                  {rooms.map((room) => (
                    <div
                      key={room.public_id}
                      className="flex items-center justify-between rounded-md bg-muted/50 px-3 py-1.5 text-sm"
                    >
                      <span>
                        {room.name}
                        {room.capacity !== null && (
                          <span className="text-muted-foreground"> · Capacity {room.capacity}</span>
                        )}
                        {!room.is_active && <Badge variant="secondary" className="ml-2">Inactive</Badge>}
                      </span>
                      <div className="flex items-center gap-1">
                        <RoomFormDialog
                          trigger={
                            <Button variant="ghost" size="icon-sm">
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>
                          }
                          title="Edit room"
                          defaultValues={{
                            name: room.name,
                            capacity: room.capacity !== null ? String(room.capacity) : "",
                            is_active: room.is_active,
                          }}
                          action={updateRoom.bind(null, schoolId, room.public_id)}
                        />
                        <DeleteConfirmButton
                          description={`Delete room ${room.name}?`}
                          action={deleteRoom.bind(null, schoolId, room.public_id)}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
