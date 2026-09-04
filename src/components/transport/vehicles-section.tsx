import Link from "next/link";
import { Bus, Pencil, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { VehicleFormDialog } from "@/components/transport/vehicle-form-dialog";
import { DeleteConfirmButton } from "@/components/schools/delete-confirm-button";
import { getVehicles } from "@/lib/transport";
import { createVehicle, updateVehicle, deleteVehicle } from "@/lib/actions/transport";
import { vehicleDefaults, vehicleStatusLabel } from "@/lib/transport-forms";

function statusVariant(status: string): "default" | "secondary" | "outline" {
  if (status === "active") return "default";
  if (status === "retired") return "outline";
  return "secondary";
}

export async function VehiclesSection({ schoolId }: { schoolId: string }) {
  const vehicles = await getVehicles(schoolId);
  if (vehicles === null) return null;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Vehicles</CardTitle>
        <VehicleFormDialog
          trigger={
            <Button size="sm" variant="secondary">
              <Plus className="h-4 w-4" />
              New vehicle
            </Button>
          }
          title="New vehicle"
          defaultValues={vehicleDefaults}
          action={createVehicle.bind(null, schoolId)}
        />
      </CardHeader>
      <CardContent>
        {vehicles.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-8 text-center">
            <Bus className="h-6 w-6 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">No vehicles yet.</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Registration</TableHead>
                <TableHead>Make / model</TableHead>
                <TableHead>Capacity</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-1" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {vehicles.map((vehicle) => (
                <TableRow key={vehicle.public_id}>
                  <TableCell>
                    <Link
                      href={`/vehicles/${vehicle.public_id}`}
                      className="font-medium text-primary hover:underline"
                    >
                      {vehicle.registration_number}
                    </Link>
                  </TableCell>
                  <TableCell>
                    {[vehicle.make, vehicle.model].filter(Boolean).join(" ") || "—"}
                  </TableCell>
                  <TableCell>{vehicle.capacity}</TableCell>
                  <TableCell>
                    <Badge variant={statusVariant(vehicle.status)}>{vehicleStatusLabel(vehicle.status)}</Badge>
                  </TableCell>
                  <TableCell className="flex justify-end gap-1">
                    <VehicleFormDialog
                      trigger={
                        <Button variant="ghost" size="icon-sm">
                          <Pencil className="h-4 w-4" />
                        </Button>
                      }
                      title="Edit vehicle"
                      defaultValues={{
                        registration_number: vehicle.registration_number,
                        make: vehicle.make,
                        model: vehicle.model,
                        capacity: vehicle.capacity,
                        status: vehicle.status,
                      }}
                      action={updateVehicle.bind(null, schoolId, vehicle.public_id)}
                    />
                    <DeleteConfirmButton
                      description={`Delete vehicle ${vehicle.registration_number}? This cannot be undone.`}
                      action={deleteVehicle.bind(null, schoolId, vehicle.public_id)}
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
