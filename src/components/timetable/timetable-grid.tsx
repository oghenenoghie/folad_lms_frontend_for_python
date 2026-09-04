import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DeleteConfirmButton } from "@/components/schools/delete-confirm-button";
import {
  TimetableSlotCreateFormDialog,
  TimetableSlotEditFormDialog,
} from "@/components/timetable/timetable-slot-form-dialogs";
import { createTimetableSlot, updateTimetableSlot, deleteTimetableSlot } from "@/lib/actions/timetable";
import { timetableSlotCreateDefaults, DAY_OF_WEEK_OPTIONS } from "@/lib/timetable-forms";
import type { Period, TimetableSlot } from "@/lib/timetable";
import type { SelectOption } from "@/components/schools/entity-form-dialog";

export function TimetableGrid({
  periods,
  slots,
  classSubjectOptions,
  roomOptions,
  subjectLabelByClassSubject,
  roomNameById,
}: {
  periods: Period[];
  slots: TimetableSlot[];
  classSubjectOptions: SelectOption[];
  roomOptions: SelectOption[];
  subjectLabelByClassSubject: Map<string, string>;
  roomNameById: Map<string, string>;
}) {
  const slotByDayAndPeriod = new Map(slots.map((slot) => [`${slot.day_of_week}:${slot.period}`, slot]));

  return (
    <div className="overflow-x-auto rounded-lg border">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b bg-muted/50">
            <th className="w-32 border-r p-2 text-left font-medium">Period</th>
            {DAY_OF_WEEK_OPTIONS.map((day) => (
              <th key={day.value} className="min-w-48 border-r p-2 text-left font-medium last:border-r-0">
                {day.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {periods.map((period) => (
            <tr key={period.public_id} className="border-b last:border-b-0">
              <td className="border-r p-2 align-top">
                <p className="font-medium">{period.name}</p>
                <p className="text-xs text-muted-foreground">
                  {period.start_time}–{period.end_time}
                </p>
              </td>
              {DAY_OF_WEEK_OPTIONS.map((day) => {
                const slot = slotByDayAndPeriod.get(`${day.value}:${period.public_id}`);
                return (
                  <td key={day.value} className="border-r p-2 align-top last:border-r-0">
                    {slot ? (
                      <div className="space-y-1 rounded-md bg-muted/50 p-2">
                        <p className="font-medium">
                          {subjectLabelByClassSubject.get(slot.class_subject) ?? "Unknown subject"}
                        </p>
                        {slot.room && (
                          <p className="text-xs text-muted-foreground">{roomNameById.get(slot.room) ?? slot.room}</p>
                        )}
                        {!slot.is_active && <p className="text-xs text-muted-foreground">Inactive</p>}
                        <div className="flex items-center gap-1">
                          <TimetableSlotEditFormDialog
                            trigger={
                              <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">
                                Edit
                              </Button>
                            }
                            title="Edit timetable slot"
                            defaultValues={{ room: slot.room ?? "", is_active: slot.is_active }}
                            roomOptions={roomOptions}
                            action={updateTimetableSlot.bind(null, slot.public_id)}
                          />
                          <DeleteConfirmButton
                            description="Remove this timetable slot?"
                            action={deleteTimetableSlot.bind(null, slot.public_id)}
                          />
                        </div>
                      </div>
                    ) : classSubjectOptions.length > 0 ? (
                      <TimetableSlotCreateFormDialog
                        trigger={
                          <Button variant="ghost" size="icon-sm" className="text-muted-foreground">
                            <Plus className="h-4 w-4" />
                          </Button>
                        }
                        title={`Add a slot (${day.label}, ${period.name})`}
                        defaultValues={timetableSlotCreateDefaults}
                        classSubjectOptions={classSubjectOptions}
                        roomOptions={roomOptions}
                        action={createTimetableSlot.bind(null, day.value, period.public_id)}
                      />
                    ) : null}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
