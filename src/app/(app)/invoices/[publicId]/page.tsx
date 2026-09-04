import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { CheckCircle2, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DeleteConfirmButton } from "@/components/schools/delete-confirm-button";
import { InvoiceLineFormDialog } from "@/components/finance/invoice-line-form-dialog";
import { PaymentFormDialog } from "@/components/finance/payment-form-dialog";
import { RefundFormDialog } from "@/components/finance/refund-form-dialog";
import { FinanceActionButton } from "@/components/finance/action-button";
import {
  getInvoiceResult,
  getInvoiceLines,
  getPaymentsForInvoice,
  getReceiptForPayment,
  getRefundsForPayment,
  getFeeStructures,
  getFeeItems,
  formatMoney,
  INVOICE_STATUS_LABELS,
  type Payment,
} from "@/lib/finance";
import { getStudentResult } from "@/lib/students";
import {
  deleteInvoiceLine,
  createInvoiceLine,
  issueInvoice,
  cancelInvoice,
  recordPayment,
  issueRefund,
} from "@/lib/actions/finance";
import { invoiceLineDefaults, paymentDefaults, refundDefaults, paymentMethodLabel } from "@/lib/finance-forms";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ publicId: string }>;
}): Promise<Metadata> {
  const { publicId } = await params;
  const result = await getInvoiceResult(publicId);
  return { title: result.status === "ok" ? result.data.invoice_number : "Invoice" };
}

async function getFeeItemOptions(termId: string) {
  const structures = (await getFeeStructures(termId)) ?? [];
  const itemLists = await Promise.all(structures.map((s) => getFeeItems(s.public_id)));
  return itemLists
    .flatMap((items) => items ?? [])
    .map((item) => ({ value: item.public_id, label: `${item.name} — ${formatMoney(item.amount_minor, item.currency_code)}` }));
}

async function PaymentCard({ invoiceId, payment }: { invoiceId: string; payment: Payment }) {
  const [receipt, refunds] = await Promise.all([
    getReceiptForPayment(payment.public_id),
    getRefundsForPayment(payment.public_id),
  ]);
  const refundedMinor = (refunds ?? [])
    .filter((r) => r.status === "completed")
    .reduce((sum, r) => sum + r.amount_minor, 0);
  const refundable = payment.amount_minor - refundedMinor;

  return (
    <div className="rounded-lg border">
      <div className="flex items-center justify-between gap-3 border-b px-4 py-3">
        <div>
          <p className="font-medium">
            {formatMoney(payment.amount_minor, payment.currency_code)} — {paymentMethodLabel(payment.method)}
          </p>
          <p className="text-sm text-muted-foreground">
            Ref {payment.reference} · {payment.paid_at}
            {receipt && ` · Receipt ${receipt.receipt_number} (${receipt.status})`}
          </p>
        </div>
        {refundable > 0 && (
          <RefundFormDialog
            trigger={
              <Button variant="outline" size="sm">
                Issue refund
              </Button>
            }
            title="Issue a refund"
            defaultValues={refundDefaults}
            action={issueRefund.bind(null, invoiceId, payment.public_id)}
          />
        )}
      </div>

      {(refunds ?? []).length > 0 && (
        <div className="px-4 py-3">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Refunds</p>
          <div className="space-y-1.5">
            {(refunds ?? []).map((refund) => (
              <div
                key={refund.public_id}
                className="flex items-center justify-between rounded-md bg-muted/50 px-3 py-1.5 text-sm"
              >
                <span>
                  {formatMoney(refund.amount_minor, refund.currency_code)}
                  {refund.reason && ` — ${refund.reason}`}
                </span>
                <Badge variant={refund.status === "completed" ? "outline" : "secondary"}>{refund.status}</Badge>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default async function InvoiceDetailPage({ params }: { params: Promise<{ publicId: string }> }) {
  const { publicId } = await params;
  const result = await getInvoiceResult(publicId);
  if (result.status === "forbidden") {
    return (
      <div className="mx-auto max-w-5xl space-y-6 p-6">
        <p className="text-sm text-muted-foreground">You don&apos;t have access to this invoice.</p>
      </div>
    );
  }
  if (result.status === "not_found") notFound();
  const invoice = result.data;

  const [studentResult, lines, payments, feeItemOptions] = await Promise.all([
    getStudentResult(invoice.student),
    getInvoiceLines(publicId),
    getPaymentsForInvoice(publicId),
    getFeeItemOptions(invoice.term),
  ]);
  const studentName =
    studentResult.status === "ok" ? `${studentResult.data.first_name} ${studentResult.data.last_name}` : "Unknown student";

  const isDraft = invoice.status === "draft";
  const canRecordPayment = invoice.status === "issued" || invoice.status === "partially_paid";
  const canCancel = invoice.status === "draft" || invoice.status === "issued";

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-6">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-semibold">{invoice.invoice_number}</h1>
            <Badge>{INVOICE_STATUS_LABELS[invoice.status]}</Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            {studentName} · {formatMoney(invoice.total_minor, invoice.currency_code)}
            {invoice.due_date && ` · due ${invoice.due_date}`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {isDraft && (
            <FinanceActionButton
              label="Issue"
              icon={<CheckCircle2 className="h-4 w-4" />}
              action={issueInvoice.bind(null, invoice.public_id)}
            />
          )}
          {canCancel && (
            <FinanceActionButton
              label="Cancel"
              icon={<XCircle className="h-4 w-4" />}
              variant="destructive"
              action={cancelInvoice.bind(null, invoice.public_id)}
            />
          )}
        </div>
      </div>

      <div className="space-y-3 rounded-lg border p-4">
        <div className="flex items-center justify-between">
          <h2 className="font-medium">Lines</h2>
          {isDraft && (
            <InvoiceLineFormDialog
              trigger={
                <Button size="sm" variant="secondary">
                  + Add line
                </Button>
              }
              title="Add invoice line"
              defaultValues={invoiceLineDefaults}
              feeItemOptions={feeItemOptions}
              action={createInvoiceLine.bind(null, invoice.public_id)}
            />
          )}
        </div>
        {lines === null || lines.length === 0 ? (
          <p className="text-sm text-muted-foreground">No lines yet.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Description</TableHead>
                <TableHead>Qty</TableHead>
                <TableHead>Unit</TableHead>
                <TableHead>Amount</TableHead>
                {isDraft && <TableHead className="w-1" />}
              </TableRow>
            </TableHeader>
            <TableBody>
              {lines.map((line) => (
                <TableRow key={line.public_id}>
                  <TableCell>{line.description}</TableCell>
                  <TableCell>{line.quantity}</TableCell>
                  <TableCell>{formatMoney(line.unit_amount_minor, invoice.currency_code)}</TableCell>
                  <TableCell>{formatMoney(line.amount_minor, invoice.currency_code)}</TableCell>
                  {isDraft && (
                    <TableCell className="text-right">
                      <DeleteConfirmButton
                        description={`Remove line "${line.description}"?`}
                        action={deleteInvoiceLine.bind(null, invoice.public_id, line.public_id)}
                      />
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      <div className="space-y-3 rounded-lg border p-4">
        <div className="flex items-center justify-between">
          <h2 className="font-medium">Payments</h2>
          {canRecordPayment && (
            <PaymentFormDialog
              trigger={
                <Button size="sm" variant="secondary">
                  Record payment
                </Button>
              }
              title="Record a payment"
              defaultValues={paymentDefaults}
              action={recordPayment.bind(null, invoice.public_id)}
            />
          )}
        </div>
        {payments === null || payments.length === 0 ? (
          <p className="text-sm text-muted-foreground">No payments recorded yet.</p>
        ) : (
          <div className="space-y-4">
            {payments.map((payment) => (
              <PaymentCard key={payment.public_id} invoiceId={invoice.public_id} payment={payment} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
