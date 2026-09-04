"use server";

import { revalidatePath } from "next/cache";
import { authorizedDjangoFetch } from "@/lib/session";
import { toActionResult, type ActionResult } from "@/lib/action-result";

async function call<T>(path: string, method: string, body?: unknown): Promise<ActionResult<T>> {
  const res = await authorizedDjangoFetch(path, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  return toActionResult<T>(res);
}

// --- Inventory items (shown on the school page) ---
export async function createInventoryItem(schoolId: string, input: Record<string, unknown>) {
  const result = await call("/api/v1/inventory-items", "POST", { ...input, school: schoolId });
  if (result.success) revalidatePath(`/schools/${schoolId}`);
  return result;
}

export async function updateInventoryItem(schoolId: string, publicId: string, input: Record<string, unknown>) {
  const result = await call(`/api/v1/inventory-items/${publicId}`, "PATCH", input);
  if (result.success) {
    revalidatePath(`/schools/${schoolId}`);
    revalidatePath(`/inventory-items/${publicId}`);
  }
  return result;
}

export async function deleteInventoryItem(schoolId: string, publicId: string) {
  const result = await call(`/api/v1/inventory-items/${publicId}`, "DELETE");
  if (result.success) revalidatePath(`/schools/${schoolId}`);
  return result;
}

// --- Suppliers (shown on the school page) ---
export async function createSupplier(schoolId: string, input: Record<string, unknown>) {
  const result = await call("/api/v1/suppliers", "POST", { ...input, school: schoolId });
  if (result.success) revalidatePath(`/schools/${schoolId}`);
  return result;
}

export async function updateSupplier(schoolId: string, publicId: string, input: Record<string, unknown>) {
  const result = await call(`/api/v1/suppliers/${publicId}`, "PATCH", input);
  if (result.success) revalidatePath(`/schools/${schoolId}`);
  return result;
}

export async function deleteSupplier(schoolId: string, publicId: string) {
  const result = await call(`/api/v1/suppliers/${publicId}`, "DELETE");
  if (result.success) revalidatePath(`/schools/${schoolId}`);
  return result;
}

// --- Purchase orders (shown on an item's detail page) ---
export async function createPurchaseOrder(itemId: string, input: Record<string, unknown>) {
  const result = await call("/api/v1/purchase-orders", "POST", { ...input, item: itemId });
  if (result.success) revalidatePath(`/inventory-items/${itemId}`);
  return result;
}

export async function updatePurchaseOrder(itemId: string, publicId: string, input: Record<string, unknown>) {
  const result = await call(`/api/v1/purchase-orders/${publicId}`, "PATCH", input);
  if (result.success) revalidatePath(`/inventory-items/${itemId}`);
  return result;
}

export async function deletePurchaseOrder(itemId: string, publicId: string) {
  const result = await call(`/api/v1/purchase-orders/${publicId}`, "DELETE");
  if (result.success) revalidatePath(`/inventory-items/${itemId}`);
  return result;
}

export async function markPurchaseOrderOrdered(itemId: string, publicId: string) {
  const result = await call(`/api/v1/purchase-orders/${publicId}/mark-ordered`, "POST");
  if (result.success) revalidatePath(`/inventory-items/${itemId}`);
  return result;
}

export async function receivePurchaseOrder(itemId: string, publicId: string) {
  const result = await call(`/api/v1/purchase-orders/${publicId}/receive`, "POST");
  if (result.success) revalidatePath(`/inventory-items/${itemId}`);
  return result;
}

export async function cancelPurchaseOrder(itemId: string, publicId: string) {
  const result = await call(`/api/v1/purchase-orders/${publicId}/cancel`, "POST");
  if (result.success) revalidatePath(`/inventory-items/${itemId}`);
  return result;
}

// --- Stock movements (shown on an item's detail page) ---
// `direction` is a UI-only choice (see inventory-forms.ts's
// stockMovementDirectionOptions comment) — this derives the real
// movement_type and the signed quantity the backend expects.
function normalizeMovement(input: Record<string, unknown>) {
  const direction = input.direction as string;
  const quantity = Math.abs(Number(input.quantity));
  const movementType = direction.startsWith("adjustment") ? "adjustment" : direction;
  const sign = direction === "out" || direction === "adjustment_decrease" ? -1 : 1;
  return { movement_type: movementType, quantity: sign * quantity, note: input.note || "" };
}

export async function createStockMovement(itemId: string, input: Record<string, unknown>) {
  const result = await call("/api/v1/stock-movements", "POST", {
    ...normalizeMovement(input),
    item: itemId,
  });
  if (result.success) revalidatePath(`/inventory-items/${itemId}`);
  return result;
}
