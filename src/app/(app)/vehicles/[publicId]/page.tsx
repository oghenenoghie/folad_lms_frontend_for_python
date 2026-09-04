import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Pencil } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { VehicleFormDialog } from "@/components/transport/vehicle-form-dialog";
import { VehicleMaintenanceFormDialog } from "@/components/transport/vehicle-maintenance-form-dialog";
import { DeleteConfirmButton } from "@/components/schools/delete-confirm-button";
import { getVehicleResult, getVehicleMaintenance } from "@/lib/transport";
import { updateVehicle, deleteVehicle, createMaintenance, updateMaintenance, deleteMaintenance } from "@/lib/actions/transport";
import { vehicleMaintenanceDefaults, vehicleStatusLabel, maintenanceStatusLabel } from "@/lib/transport-forms";
import { formatMoney } from "@/lib/finance";

export async function generateMetadata({ params }: { params: Promise<{ publicId: string }> }): Promise<Metadata> {
  const { publicId } = await params;
  const result = await getVehicleResult(publicId);
  return { title: result.status === "ok" ? result.data.registration_number : "Vehicle" };
}

function vehicleStatusVariant(status: string): "default" | "secondary" | "outline" {
  if (status === "active") return "default";
  if (status === "retired") return "outline";
  return "secondary";
}

function maintenanceStatusVariant(status: string): "default" | "secondary" | "outline" {
  if (status === "completed") return "default";
  if (status === "cancelled") return "outline";
  return "secondary";
}

export default async function VehicleDetailPage({ params }: { params: Promise<{ publicId: string }> }) {
  const { publicId } = await params;
  const result = await getVehicleResult(publicId);
  if (result.status === "forbidden") {
    return (
      <div className="mx-auto max-w-5xl space-y-6 p-6">
        <p className="text-sm text-muted-foreground">You don&apos;t have access to this vehicle.</p>
      </div>
    );
  }
  if (result.status === "not_found") notFound();
  const vehicle = result.data;

  const records = await getVehicleMaintenance(vehicle.public_id);

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-semibold">{vehicle.registration_number}</h1>
          <p className="text-sm text-muted-foreground">
            {[vehicle.make, vehicle.model].filter(Boolean).join(" ") || "No make/model on file"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <VehicleFormDialog
            trigger={
              <Button variant="secondary">
                <Pencil className="h-4 w-4" />
                Edit
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
            action={updateVehicle.bind(null, vehicle.school, vehicle.public_id)}
          />
          <DeleteConfirmButton
            description={`Delete vehicle ${vehicle.registration_number}? This cannot be undone.`}
            action={deleteVehicle.bind(null, vehicle.school, vehicle.public_id)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 rounded-lg border p-4 text-sm sm:grid-cols-2">
        <div>
          <p className="text-muted-foreground">Capacity</p>
          <p className="text-lg font-semibold">{vehicle.capacity} seats</p>
        </div>
        <div>
          <p className="text-muted-foreground">Status</p>
          <Badge variant={vehicleStatusVariant(vehicle.status)}>{vehicleStatusLabel(vehicle.status)}</Badge>
        </div>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Maintenance records</CardTitle>
          {records !== null && (
            <VehicleMaintenanceFormDialog
              trigger={
                <Button size="sm" variant="secondary">
                  Schedule maintenance
                </Button>
              }
              title="Schedule maintenance"
              defaultValues={vehicleMaintenanceDefaults}
              action={createMaintenance.bind(null, vehicle.public_id)}
            />
          )}
        </CardHeader>
        <CardContent>
          {records === null ? (
            <p className="text-sm text-muted-foreground">You don&apos;t have access to maintenance records.</p>
          ) : records.length === 0 ? (
            <p className="text-sm text-muted-foreground">No maintenance records yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Description</TableHead>
                  <TableHead>Cost</TableHead>
                  <TableHead>Scheduled</TableHead>
                  <TableHead>Completed</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-1" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {records.map((record) => (
                  <TableRow key={record.public_id}>
                    <TableCell>{record.description}</TableCell>
                    <TableCell>
                      {record.cost_minor !== null ? formatMoney(record.cost_minor, record.currency_code || "NGN") : "—"}
                    </TableCell>
                    <TableCell>{record.scheduled_date}</TableCell>
                    <TableCell>{record.completed_date ?? "—"}</TableCell>
                    <TableCell>
                      <Badge variant={maintenanceStatusVariant(record.status)}>
                        {maintenanceStatusLabel(record.status)}
                      </Badge>
                    </TableCell>
                    <TableCell className="flex justify-end gap-1">
                      <VehicleMaintenanceFormDialog
                        trigger={
                          <Button variant="ghost" size="icon-sm">
                            <Pencil className="h-4 w-4" />
                          </Button>
                        }
                        title="Edit maintenance record"
                        defaultValues={{
                          description: record.description,
                          cost_minor: record.cost_minor !== null ? String(record.cost_minor) : "",
                          scheduled_date: record.scheduled_date,
                          completed_date: record.completed_date ?? "",
                          status: record.status,
                        }}
                        action={updateMaintenance.bind(null, vehicle.public_id, record.public_id)}
                      />
                      <DeleteConfirmButton
                        description="Delete this maintenance record?"
                        action={deleteMaintenance.bind(null, vehicle.public_id, record.public_id)}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
