import { Truck, Pencil, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { SupplierFormDialog } from "@/components/inventory/supplier-form-dialog";
import { DeleteConfirmButton } from "@/components/schools/delete-confirm-button";
import { getSuppliers } from "@/lib/inventory";
import { createSupplier, updateSupplier, deleteSupplier } from "@/lib/actions/inventory";
import { supplierDefaults } from "@/lib/inventory-forms";

export async function SuppliersSection({ schoolId }: { schoolId: string }) {
  const suppliers = await getSuppliers(schoolId);
  if (suppliers === null) return null;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Suppliers</CardTitle>
        <SupplierFormDialog
          trigger={
            <Button size="sm" variant="secondary">
              <Plus className="h-4 w-4" />
              New supplier
            </Button>
          }
          title="New supplier"
          defaultValues={supplierDefaults}
          action={createSupplier.bind(null, schoolId)}
        />
      </CardHeader>
      <CardContent>
        {suppliers.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-8 text-center">
            <Truck className="h-6 w-6 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">No suppliers yet.</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead className="w-1" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {suppliers.map((supplier) => (
                <TableRow key={supplier.public_id}>
                  <TableCell>{supplier.name}</TableCell>
                  <TableCell>{supplier.contact_email || supplier.contact_phone || "—"}</TableCell>
                  <TableCell className="flex justify-end gap-1">
                    <SupplierFormDialog
                      trigger={
                        <Button variant="ghost" size="icon-sm">
                          <Pencil className="h-4 w-4" />
                        </Button>
                      }
                      title="Edit supplier"
                      defaultValues={{
                        name: supplier.name,
                        contact_email: supplier.contact_email,
                        contact_phone: supplier.contact_phone,
                        address: supplier.address,
                      }}
                      action={updateSupplier.bind(null, schoolId, supplier.public_id)}
                    />
                    <DeleteConfirmButton
                      description={`Delete supplier ${supplier.name}?`}
                      action={deleteSupplier.bind(null, schoolId, supplier.public_id)}
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
