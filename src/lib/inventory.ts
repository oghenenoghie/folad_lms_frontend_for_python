import "server-only";
import { djangoFetch } from "@/lib/session";
import type { DetailResult, Envelope, Paginated } from "@/lib/api-types";

export type PurchaseOrderStatus = "draft" | "ordered" | "received" | "cancelled";
export type StockMovementType = "in" | "out" | "adjustment";

export type InventoryItem = {
  public_id: string;
  school: string;
  name: string;
  sku: string;
  category: string;
  quantity_on_hand: number;
  reorder_level: number;
};

export type Supplier = {
  public_id: string;
  school: string;
  name: string;
  contact_email: string;
  contact_phone: string;
  address: string;
};

export type PurchaseOrder = {
  public_id: string;
  school: string;
  supplier: string;
  item: string;
  order_number: string;
  quantity_ordered: number;
  unit_cost_minor: number;
  currency_code: string;
  status: PurchaseOrderStatus;
  ordered_at: string | null;
  received_at: string | null;
};

export type StockMovement = {
  public_id: string;
  item: string;
  movement_type: StockMovementType;
  quantity: number;
  ref_type: string;
  ref_id: number | null;
  note: string;
  occurred_at: string;
};

/** null return means "not permitted to view" (403) — same convention as
 * lib/schools.ts's listOrNull. */
async function listOrNull<T>(path: string): Promise<T[] | null> {
  const res = await djangoFetch(path);
  if (!res.ok) return null;
  const body: Envelope<Paginated<T>> = await res.json();
  return body.success && body.data ? body.data.results : null;
}

export async function getInventoryItems(schoolId?: string): Promise<InventoryItem[] | null> {
  const query = schoolId ? `school_id=${schoolId}&` : "";
  return listOrNull<InventoryItem>(`/api/v1/inventory-items?${query}page_size=100`);
}

export async function getInventoryItemResult(publicId: string): Promise<DetailResult<InventoryItem>> {
  const res = await djangoFetch(`/api/v1/inventory-items/${publicId}`);
  if (res.status === 403) return { status: "forbidden" };
  if (!res.ok) return { status: "not_found" };
  const body: Envelope<InventoryItem> = await res.json();
  if (!body.success || !body.data) return { status: "not_found" };
  return { status: "ok", data: body.data };
}

export async function getSuppliers(schoolId?: string): Promise<Supplier[] | null> {
  const query = schoolId ? `school_id=${schoolId}&` : "";
  return listOrNull<Supplier>(`/api/v1/suppliers?${query}page_size=100`);
}

export async function getPurchaseOrders(filters?: {
  itemId?: string;
  status?: PurchaseOrderStatus;
}): Promise<PurchaseOrder[] | null> {
  const params = new URLSearchParams();
  if (filters?.itemId) params.set("item_id", filters.itemId);
  if (filters?.status) params.set("status", filters.status);
  const query = params.toString() ? `${params.toString()}&` : "";
  return listOrNull<PurchaseOrder>(`/api/v1/purchase-orders?${query}page_size=100`);
}

export async function getStockMovements(itemId?: string): Promise<StockMovement[] | null> {
  const query = itemId ? `item_id=${itemId}&` : "";
  return listOrNull<StockMovement>(`/api/v1/stock-movements?${query}page_size=100`);
}
