import Link from "next/link";
import { Package, Pencil, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { InventoryItemFormDialog } from "@/components/inventory/inventory-item-form-dialog";
import { DeleteConfirmButton } from "@/components/schools/delete-confirm-button";
import { getInventoryItems } from "@/lib/inventory";
import { createInventoryItem, updateInventoryItem, deleteInventoryItem } from "@/lib/actions/inventory";
import { inventoryItemDefaults } from "@/lib/inventory-forms";

export async function InventoryItemsSection({ schoolId }: { schoolId: string }) {
  const items = await getInventoryItems(schoolId);
  if (items === null) return null;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Inventory items</CardTitle>
        <InventoryItemFormDialog
          trigger={
            <Button size="sm" variant="secondary">
              <Plus className="h-4 w-4" />
              New item
            </Button>
          }
          title="New inventory item"
          defaultValues={inventoryItemDefaults}
          action={createInventoryItem.bind(null, schoolId)}
        />
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-8 text-center">
            <Package className="h-6 w-6 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">No inventory items yet.</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead>On hand</TableHead>
                <TableHead className="w-1" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => (
                <TableRow key={item.public_id}>
                  <TableCell>
                    <Link
                      href={`/inventory-items/${item.public_id}`}
                      className="font-medium text-primary hover:underline"
                    >
                      {item.name}
                    </Link>
                    {item.category && <span className="text-muted-foreground"> · {item.category}</span>}
                  </TableCell>
                  <TableCell>{item.sku}</TableCell>
                  <TableCell>
                    {item.quantity_on_hand}
                    {item.quantity_on_hand <= item.reorder_level && (
                      <Badge variant="destructive" className="ml-2">
                        Reorder
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="flex justify-end gap-1">
                    <InventoryItemFormDialog
                      trigger={
                        <Button variant="ghost" size="icon-sm">
                          <Pencil className="h-4 w-4" />
                        </Button>
                      }
                      title="Edit inventory item"
                      defaultValues={{
                        name: item.name,
                        sku: item.sku,
                        category: item.category,
                        reorder_level: item.reorder_level,
                      }}
                      action={updateInventoryItem.bind(null, schoolId, item.public_id)}
                    />
                    <DeleteConfirmButton
                      description={`Delete ${item.name}? This cannot be undone.`}
                      action={deleteInventoryItem.bind(null, schoolId, item.public_id)}
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
