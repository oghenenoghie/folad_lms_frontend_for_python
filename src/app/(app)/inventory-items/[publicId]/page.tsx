import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Pencil } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { InventoryItemFormDialog } from "@/components/inventory/inventory-item-form-dialog";
import { PurchaseOrderFormDialog } from "@/components/inventory/purchase-order-form-dialog";
import { StockMovementFormDialog } from "@/components/inventory/stock-movement-form-dialog";
import { InventoryActionButton } from "@/components/inventory/inventory-action-button";
import { DeleteConfirmButton } from "@/components/schools/delete-confirm-button";
import { getInventoryItemResult, getSuppliers, getPurchaseOrders, getStockMovements } from "@/lib/inventory";
import {
  updateInventoryItem,
  deleteInventoryItem,
  createPurchaseOrder,
  deletePurchaseOrder,
  markPurchaseOrderOrdered,
  receivePurchaseOrder,
  cancelPurchaseOrder,
  createStockMovement,
} from "@/lib/actions/inventory";
import {
  purchaseOrderDefaults,
  purchaseOrderStatusLabels,
  stockMovementDefaults,
  stockMovementTypeLabel,
} from "@/lib/inventory-forms";
import { formatMoney } from "@/lib/finance";

export async function generateMetadata({ params }: { params: Promise<{ publicId: string }> }): Promise<Metadata> {
  const { publicId } = await params;
  const result = await getInventoryItemResult(publicId);
  return { title: result.status === "ok" ? result.data.name : "Inventory item" };
}

function poStatusVariant(status: string): "default" | "secondary" | "destructive" | "outline" {
  if (status === "received") return "default";
  if (status === "cancelled") return "outline";
  if (status === "ordered") return "secondary";
  return "secondary";
}

export default async function InventoryItemDetailPage({ params }: { params: Promise<{ publicId: string }> }) {
  const { publicId } = await params;
  const result = await getInventoryItemResult(publicId);
  if (result.status === "forbidden") {
    return (
      <div className="mx-auto max-w-5xl space-y-6 p-6">
        <p className="text-sm text-muted-foreground">You don&apos;t have access to this item.</p>
      </div>
    );
  }
  if (result.status === "not_found") notFound();
  const item = result.data;

  const [suppliers, purchaseOrders, movements] = await Promise.all([
    getSuppliers(item.school),
    getPurchaseOrders({ itemId: item.public_id }),
    getStockMovements(item.public_id),
  ]);

  const supplierOptions = (suppliers ?? []).map((s) => ({ value: s.public_id, label: s.name }));
  const supplierNameById = new Map(supplierOptions.map((o) => [o.value, o.label]));

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-semibold">{item.name}</h1>
          <p className="text-sm text-muted-foreground">
            SKU {item.sku}
            {item.category && ` · ${item.category}`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <InventoryItemFormDialog
            trigger={
              <Button variant="secondary">
                <Pencil className="h-4 w-4" />
                Edit
              </Button>
            }
            title="Edit inventory item"
            defaultValues={{
              name: item.name,
              sku: item.sku,
              category: item.category,
              reorder_level: item.reorder_level,
            }}
            action={updateInventoryItem.bind(null, item.school, item.public_id)}
          />
          <DeleteConfirmButton
            description={`Delete ${item.name}? This cannot be undone.`}
            action={deleteInventoryItem.bind(null, item.school, item.public_id)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 rounded-lg border p-4 text-sm sm:grid-cols-2">
        <div>
          <p className="text-muted-foreground">Quantity on hand</p>
          <p className="text-lg font-semibold">
            {item.quantity_on_hand}
            {item.quantity_on_hand <= item.reorder_level && (
              <Badge variant="destructive" className="ml-2">
                At or below reorder level
              </Badge>
            )}
          </p>
        </div>
        <div>
          <p className="text-muted-foreground">Reorder level</p>
          <p className="text-lg font-semibold">{item.reorder_level}</p>
        </div>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Purchase orders</CardTitle>
          {purchaseOrders !== null && supplierOptions.length > 0 && (
            <PurchaseOrderFormDialog
              trigger={
                <Button size="sm" variant="secondary">
                  New purchase order
                </Button>
              }
              title="New purchase order"
              defaultValues={purchaseOrderDefaults}
              supplierOptions={supplierOptions}
              action={createPurchaseOrder.bind(null, item.public_id)}
            />
          )}
        </CardHeader>
        <CardContent>
          {purchaseOrders === null ? (
            <p className="text-sm text-muted-foreground">You don&apos;t have access to purchase orders.</p>
          ) : purchaseOrders.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              {supplierOptions.length === 0
                ? "Add a supplier on the school page first, then order stock."
                : "No purchase orders yet."}
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order #</TableHead>
                  <TableHead>Supplier</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Cost</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-1" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {purchaseOrders.map((po) => (
                  <TableRow key={po.public_id}>
                    <TableCell>{po.order_number}</TableCell>
                    <TableCell>{supplierNameById.get(po.supplier) ?? "Unknown supplier"}</TableCell>
                    <TableCell>{po.quantity_ordered}</TableCell>
                    <TableCell>{formatMoney(po.unit_cost_minor * po.quantity_ordered, po.currency_code)}</TableCell>
                    <TableCell>
                      <Badge variant={poStatusVariant(po.status)}>
                        {purchaseOrderStatusLabels[po.status] ?? po.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="flex justify-end gap-1">
                      {po.status === "draft" && (
                        <>
                          <InventoryActionButton
                            label="Mark ordered"
                            action={markPurchaseOrderOrdered.bind(null, item.public_id, po.public_id)}
                          />
                          <DeleteConfirmButton
                            description={`Delete purchase order ${po.order_number}?`}
                            action={deletePurchaseOrder.bind(null, item.public_id, po.public_id)}
                          />
                        </>
                      )}
                      {po.status === "ordered" && (
                        <>
                          <InventoryActionButton
                            label="Receive"
                            action={receivePurchaseOrder.bind(null, item.public_id, po.public_id)}
                          />
                          <InventoryActionButton
                            label="Cancel"
                            variant="destructive"
                            action={cancelPurchaseOrder.bind(null, item.public_id, po.public_id)}
                          />
                        </>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Stock movements</CardTitle>
          {movements !== null && (
            <StockMovementFormDialog
              trigger={
                <Button size="sm" variant="secondary">
                  Record movement
                </Button>
              }
              title="Record a stock movement"
              defaultValues={stockMovementDefaults}
              action={createStockMovement.bind(null, item.public_id)}
            />
          )}
        </CardHeader>
        <CardContent>
          {movements === null ? (
            <p className="text-sm text-muted-foreground">You don&apos;t have access to stock movements.</p>
          ) : movements.length === 0 ? (
            <p className="text-sm text-muted-foreground">No stock movements yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Note</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {movements.map((movement) => (
                  <TableRow key={movement.public_id}>
                    <TableCell>{stockMovementTypeLabel(movement.movement_type)}</TableCell>
                    <TableCell>{movement.quantity > 0 ? `+${movement.quantity}` : movement.quantity}</TableCell>
                    <TableCell>{movement.note || "—"}</TableCell>
                    <TableCell>{movement.occurred_at.slice(0, 10)}</TableCell>
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
