import { Clock, Pencil, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PeriodFormDialog } from "@/components/timetable/period-form-dialog";
import { DeleteConfirmButton } from "@/components/schools/delete-confirm-button";
import { getPeriods } from "@/lib/timetable";
import { createPeriod, updatePeriod, deletePeriod } from "@/lib/actions/timetable";
import { periodDefaults } from "@/lib/timetable-forms";

export async function PeriodsSection({ schoolId }: { schoolId: string }) {
  const periods = await getPeriods(schoolId);
  if (periods === null) return null;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Periods</CardTitle>
        <PeriodFormDialog
          trigger={
            <Button size="sm" variant="secondary">
              <Plus className="h-4 w-4" />
              New period
            </Button>
          }
          title="New period"
          defaultValues={periodDefaults}
          action={createPeriod.bind(null, schoolId)}
        />
      </CardHeader>
      <CardContent>
        {periods.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-8 text-center">
            <Clock className="h-6 w-6 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              No periods yet — set these up to build the timetable.
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Time</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-1" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {periods.map((period) => (
                <TableRow key={period.public_id}>
                  <TableCell>{period.name}</TableCell>
                  <TableCell>
                    {period.start_time} – {period.end_time}
                  </TableCell>
                  <TableCell>
                    <Badge variant={period.is_active ? "default" : "secondary"}>
                      {period.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell className="flex justify-end gap-1">
                    <PeriodFormDialog
                      trigger={
                        <Button variant="ghost" size="icon-sm">
                          <Pencil className="h-4 w-4" />
                        </Button>
                      }
                      title="Edit period"
                      defaultValues={{
                        name: period.name,
                        sequence: period.sequence,
                        start_time: period.start_time,
                        end_time: period.end_time,
                        is_active: period.is_active,
                      }}
                      action={updatePeriod.bind(null, schoolId, period.public_id)}
                    />
                    <DeleteConfirmButton
                      description={`Delete period ${period.name}?`}
                      action={deletePeriod.bind(null, schoolId, period.public_id)}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
