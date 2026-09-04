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

// --- Fee structures ---
export async function createFeeStructure(schoolId: string, input: Record<string, unknown>) {
  const result = await call("/api/v1/fee-structures", "POST", input);
  if (result.success) revalidatePath(`/schools/${schoolId}`);
  return result;
}

export async function updateFeeStructure(
  schoolId: string,
  publicId: string,
  input: Record<string, unknown>
) {
  const result = await call(`/api/v1/fee-structures/${publicId}`, "PATCH", input);
  if (result.success) revalidatePath(`/schools/${schoolId}`);
  return result;
}

export async function deleteFeeStructure(schoolId: string, publicId: string) {
  const result = await call(`/api/v1/fee-structures/${publicId}`, "DELETE");
  if (result.success) revalidatePath(`/schools/${schoolId}`);
  return result;
}

// --- Fee items ---
export async function createFeeItem(schoolId: string, feeStructureId: string, input: Record<string, unknown>) {
  const result = await call("/api/v1/fee-items", "POST", { ...input, fee_structure: feeStructureId });
  if (result.success) revalidatePath(`/schools/${schoolId}`);
  return result;
}

export async function updateFeeItem(schoolId: string, publicId: string, input: Record<string, unknown>) {
  const result = await call(`/api/v1/fee-items/${publicId}`, "PATCH", input);
  if (result.success) revalidatePath(`/schools/${schoolId}`);
  return result;
}

export async function deleteFeeItem(schoolId: string, publicId: string) {
  const result = await call(`/api/v1/fee-items/${publicId}`, "DELETE");
  if (result.success) revalidatePath(`/schools/${schoolId}`);
  return result;
}

// --- Invoices ---
// `due_date` is a nullable DateField — an empty string from the optional
// date input has to become an actual `null`, same reasoning as
// actions/academics.ts's normalizeEffectiveTo.
function normalizeDueDate(input: Record<string, unknown>) {
  return { ...input, due_date: input.due_date || null };
}

export async function createInvoice(input: Record<string, unknown>) {
  const result = await call("/api/v1/invoices", "POST", normalizeDueDate(input));
  if (result.success) revalidatePath("/invoices");
  return result;
}

export async function deleteInvoice(publicId: string) {
  const result = await call(`/api/v1/invoices/${publicId}`, "DELETE");
  if (result.success) revalidatePath("/invoices");
  return result;
}

export async function issueInvoice(publicId: string) {
  const result = await call(`/api/v1/invoices/${publicId}/issue`, "POST");
  if (result.success) revalidatePath(`/invoices/${publicId}`);
  return result;
}

export async function cancelInvoice(publicId: string) {
  const result = await call(`/api/v1/invoices/${publicId}/cancel`, "POST");
  if (result.success) revalidatePath(`/invoices/${publicId}`);
  return result;
}

// --- Invoice lines ---
// `fee_item`/`unit_amount_minor` are both optional — an empty string from
// the "no fee item" select or a blank custom-amount input has to become
// `undefined` (omitted) rather than "", since the backend derives them
// from fee_item when absent but 400s on an empty-string FK or integer.
function normalizeLineInput(input: Record<string, unknown>) {
  const { fee_item, description, unit_amount_minor, ...rest } = input;
  return {
    ...rest,
    fee_item: fee_item || undefined,
    description: description || undefined,
    unit_amount_minor: unit_amount_minor ? Number(unit_amount_minor) : undefined,
  };
}

export async function createInvoiceLine(invoiceId: string, input: Record<string, unknown>) {
  const result = await call("/api/v1/invoice-lines", "POST", {
    ...normalizeLineInput(input),
    invoice: invoiceId,
  });
  if (result.success) revalidatePath(`/invoices/${invoiceId}`);
  return result;
}

export async function deleteInvoiceLine(invoiceId: string, publicId: string) {
  const result = await call(`/api/v1/invoice-lines/${publicId}`, "DELETE");
  if (result.success) revalidatePath(`/invoices/${invoiceId}`);
  return result;
}

// --- Payments ---
export async function recordPayment(invoiceId: string, input: Record<string, unknown>) {
  const result = await call("/api/v1/payments", "POST", { ...input, invoice: invoiceId });
  if (result.success) revalidatePath(`/invoices/${invoiceId}`);
  return result;
}

// --- Refunds ---
export async function issueRefund(invoiceId: string, paymentId: string, input: Record<string, unknown>) {
  const result = await call("/api/v1/refunds", "POST", { ...input, payment: paymentId });
  if (result.success) revalidatePath(`/invoices/${invoiceId}`);
  return result;
}
