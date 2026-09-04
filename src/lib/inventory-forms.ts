import { z } from "zod";
import type { FieldConfig, SelectOption } from "@/components/schools/entity-form-dialog";

// quantity_on_hand isn't a form field — apps.inventory.services.item_service
// never accepts it from a client; it only ever changes as a side effect of
// a stock movement (see stock_movement_service.record_movement).
export const inventoryItemSchema = z.object({
  name: z.string().min(1, "Name is required"),
  sku: z.string().min(1, "SKU is required"),
  category: z.string().optional(),
  reorder_level: z.coerce.number().int().min(0, "Reorder level cannot be negative"),
});
export type InventoryItemFormValues = z.infer<typeof inventoryItemSchema>;

export const inventoryItemFields: FieldConfig<InventoryItemFormValues>[] = [
  { name: "name", label: "Name", type: "text" },
  { name: "sku", label: "SKU", type: "text" },
  { name: "category", label: "Category (optional)", type: "text" },
  { name: "reorder_level", label: "Reorder level", type: "number" },
];

export const inventoryItemDefaults: InventoryItemFormValues = {
  name: "",
  sku: "",
  category: "",
  reorder_level: 0,
};

export const supplierSchema = z.object({
  name: z.string().min(1, "Name is required"),
  contact_email: z.string().email("Enter a valid email").or(z.literal("")).optional(),
  contact_phone: z.string().optional(),
  address: z.string().optional(),
});
export type SupplierFormValues = z.infer<typeof supplierSchema>;

export const supplierFields: FieldConfig<SupplierFormValues>[] = [
  { name: "name", label: "Name", type: "text" },
  { name: "contact_email", label: "Contact email (optional)", type: "email" },
  { name: "contact_phone", label: "Contact phone (optional)", type: "text" },
  { name: "address", label: "Address (optional)", type: "text" },
];

export const supplierDefaults: SupplierFormValues = {
  name: "",
  contact_email: "",
  contact_phone: "",
  address: "",
};

// item is fixed by context (bound to the item detail page's action), and
// currency_code/order_number/status are all server-derived
// (purchase_order_service.create_purchase_order, models.py's save()) — so
// neither is a form field.
export const purchaseOrderSchema = z.object({
  supplier: z.string().min(1, "Supplier is required"),
  quantity_ordered: z.coerce.number().int().min(1, "Quantity must be at least 1"),
  unit_cost_minor: z.coerce.number().int().min(1, "Unit cost must be at least 1"),
});
export type PurchaseOrderFormValues = z.infer<typeof purchaseOrderSchema>;

export function purchaseOrderFields(supplierOptions: SelectOption[]): FieldConfig<PurchaseOrderFormValues>[] {
  return [
    { name: "supplier", label: "Supplier", type: "select", options: supplierOptions, placeholder: "Select a supplier" },
    { name: "quantity_ordered", label: "Quantity ordered", type: "number" },
    { name: "unit_cost_minor", label: "Unit cost (in minor units, e.g. cents)", type: "number" },
  ];
}

export const purchaseOrderDefaults: PurchaseOrderFormValues = {
  supplier: "",
  quantity_ordered: 1,
  unit_cost_minor: 0,
};

export const purchaseOrderStatusLabels: Record<string, string> = {
  draft: "Draft",
  ordered: "Ordered",
  received: "Received",
  cancelled: "Cancelled",
};

export function stockMovementTypeLabel(type: string): string {
  return { in: "Stock in", out: "Stock out", adjustment: "Adjustment" }[type] ?? type;
}

// Four UI choices rather than the backend's three "in"/"out"/"adjustment"
// movement_type values — "adjustment" alone doesn't say which direction to
// apply, and the backend enforces "in" must be a positive quantity and
// "out" must be negative (stock_movement_service._EXPECTED_SIGN), so
// asking the user to remember which sign to type is an easy way to hit
// that 409 by accident. The quantity here is always a positive magnitude;
// actions/inventory.ts's normalizeMovement derives both the real
// movement_type and the signed quantity from this choice.
export const stockMovementDirectionOptions: SelectOption[] = [
  { value: "in", label: "Stock in" },
  { value: "out", label: "Stock out" },
  { value: "adjustment_increase", label: "Adjustment — increase" },
  { value: "adjustment_decrease", label: "Adjustment — decrease" },
];

export const stockMovementSchema = z.object({
  direction: z.enum(["in", "out", "adjustment_increase", "adjustment_decrease"]),
  quantity: z.coerce.number().int().min(1, "Quantity must be at least 1"),
  note: z.string().optional(),
});
export type StockMovementFormValues = z.infer<typeof stockMovementSchema>;

export const stockMovementFields: FieldConfig<StockMovementFormValues>[] = [
  { name: "direction", label: "Type", type: "select", options: stockMovementDirectionOptions },
  { name: "quantity", label: "Quantity", type: "number" },
  { name: "note", label: "Note (optional)", type: "text" },
];

export const stockMovementDefaults: StockMovementFormValues = {
  direction: "in",
  quantity: 1,
  note: "",
};
