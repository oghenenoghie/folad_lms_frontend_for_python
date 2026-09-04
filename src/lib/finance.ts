import "server-only";
import { cache } from "react";
import { djangoFetch } from "@/lib/session";
import type { DetailResult, Envelope, Paginated } from "@/lib/api-types";

export type InvoiceStatus = "draft" | "issued" | "partially_paid" | "paid" | "cancelled";

export type Invoice = {
  public_id: string;
  school: string;
  student: string;
  academic_year: string;
  term: string;
  invoice_number: string;
  total_minor: number;
  currency_code: string;
  status: InvoiceStatus;
  due_date: string | null;
  issued_at: string | null;
};

export type InvoiceLine = {
  public_id: string;
  invoice: string;
  fee_item: string | null;
  description: string;
  quantity: number;
  unit_amount_minor: number;
  discount: string | null;
  discount_amount_minor: number;
  amount_minor: number;
};

export type PaymentMethod = "cash" | "bank_transfer" | "card" | "ussd" | "cheque";
export type PaymentStatus = "pending" | "successful" | "failed";

export type Payment = {
  public_id: string;
  invoice: string;
  reference: string;
  amount_minor: number;
  currency_code: string;
  method: PaymentMethod;
  status: PaymentStatus;
  paid_at: string;
};

export type Receipt = {
  public_id: string;
  payment: string;
  receipt_number: string;
  status: "pending" | "generating" | "ready" | "failed";
  file_url: string;
  generated_at: string | null;
  error_message: string;
};

export const INVOICE_STATUS_LABELS: Record<InvoiceStatus, string> = {
  draft: "Draft",
  issued: "Issued",
  partially_paid: "Partially paid",
  paid: "Paid",
  cancelled: "Cancelled",
};

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  cash: "Cash",
  bank_transfer: "Bank transfer",
  card: "Card",
  ussd: "USSD",
  cheque: "Cheque",
};

export function formatMoney(amountMinor: number, currencyCode: string): string {
  try {
    return new Intl.NumberFormat("en", { style: "currency", currency: currencyCode }).format(
      amountMinor / 100
    );
  } catch {
    // An unrecognized currency code (Intl throws on those) — fall back to a
    // plain number rather than crash the page over a formatting nicety.
    return `${(amountMinor / 100).toFixed(2)} ${currencyCode}`;
  }
}

/** null return means "not permitted to view" (403) — same convention as
 * lib/schools.ts's listOrNull. */
async function listOrNull<T>(path: string): Promise<T[] | null> {
  const res = await djangoFetch(path);
  if (!res.ok) return null;
  const body: Envelope<Paginated<T>> = await res.json();
  return body.success && body.data ? body.data.results : null;
}

export async function getInvoicesForStudent(studentId: string): Promise<Invoice[] | null> {
  return listOrNull<Invoice>(`/api/v1/invoices?student_id=${studentId}&page_size=100`);
}

// Wrapped in cache(): the detail page's generateMetadata() and page body
// both call this with the same publicId per request.
export const getInvoiceResult = cache(async (publicId: string): Promise<DetailResult<Invoice>> => {
  const res = await djangoFetch(`/api/v1/invoices/${publicId}`);
  if (res.status === 403) return { status: "forbidden" };
  if (!res.ok) return { status: "not_found" };
  const body: Envelope<Invoice> = await res.json();
  if (!body.success || !body.data) return { status: "not_found" };
  return { status: "ok", data: body.data };
});

export async function getInvoiceLines(invoiceId: string): Promise<InvoiceLine[] | null> {
  return listOrNull<InvoiceLine>(`/api/v1/invoice-lines?invoice_id=${invoiceId}&page_size=100`);
}

export async function getPaymentsForInvoice(invoiceId: string): Promise<Payment[] | null> {
  return listOrNull<Payment>(`/api/v1/payments?invoice_id=${invoiceId}&page_size=100`);
}

export async function getReceiptForPayment(paymentId: string): Promise<Receipt | null> {
  const receipts = await listOrNull<Receipt>(`/api/v1/receipts?payment_id=${paymentId}`);
  return receipts && receipts.length > 0 ? receipts[0] : null;
}
