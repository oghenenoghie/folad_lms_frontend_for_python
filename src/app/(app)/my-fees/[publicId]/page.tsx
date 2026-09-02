import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Download } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getCurrentUser } from "@/lib/session";
import {
  getInvoiceResult,
  getInvoiceLines,
  getPaymentsForInvoice,
  getReceiptForPayment,
  formatMoney,
  INVOICE_STATUS_LABELS,
  PAYMENT_METHOD_LABELS,
  type Payment,
} from "@/lib/finance";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ publicId: string }>;
}): Promise<Metadata> {
  const { publicId } = await params;
  const result = await getInvoiceResult(publicId);
  return { title: result.status === "ok" ? result.data.invoice_number : "Invoice" };
}

function paymentStatusVariant(status: Payment["status"]): "default" | "secondary" | "destructive" {
  if (status === "successful") return "default";
  if (status === "failed") return "destructive";
  return "secondary";
}

export default async function MyInvoiceDetailPage({
  params,
}: {
  params: Promise<{ publicId: string }>;
}) {
  const { publicId } = await params;
  const user = await getCurrentUser();
  const studentId = user?.student_public_id;

  if (!studentId) {
    return (
      <div className="mx-auto max-w-5xl space-y-6 p-6">
        <p className="text-sm text-muted-foreground">
          This page is for students — your account isn&apos;t linked to a student profile.
        </p>
      </div>
    );
  }

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
  if (invoice.student !== studentId) notFound();

  const [lines, payments] = await Promise.all([
    getInvoiceLines(publicId),
    getPaymentsForInvoice(publicId),
  ]);
  const receipts = await Promise.all(
    (payments ?? []).map((payment) => getReceiptForPayment(payment.public_id))
  );

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-6">
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-semibold">{invoice.invoice_number}</h1>
          <Badge variant="secondary">{INVOICE_STATUS_LABELS[invoice.status]}</Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          Total {formatMoney(invoice.total_minor, invoice.currency_code)}
          {invoice.due_date && <> · Due {invoice.due_date}</>}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Line items</CardTitle>
        </CardHeader>
        <CardContent>
          {!lines || lines.length === 0 ? (
            <p className="text-sm text-muted-foreground">No line items yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Description</TableHead>
                  <TableHead>Qty</TableHead>
                  <TableHead>Unit amount</TableHead>
                  <TableHead>Discount</TableHead>
                  <TableHead>Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {lines.map((line) => (
                  <TableRow key={line.public_id}>
                    <TableCell>{line.description}</TableCell>
                    <TableCell>{line.quantity}</TableCell>
                    <TableCell>{formatMoney(line.unit_amount_minor, invoice.currency_code)}</TableCell>
                    <TableCell>
                      {line.discount_amount_minor > 0
                        ? formatMoney(line.discount_amount_minor, invoice.currency_code)
                        : "—"}
                    </TableCell>
                    <TableCell>{formatMoney(line.amount_minor, invoice.currency_code)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Payment history</CardTitle>
        </CardHeader>
        <CardContent>
          {!payments || payments.length === 0 ? (
            <p className="text-sm text-muted-foreground">No payments recorded yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Reference</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Paid at</TableHead>
                  <TableHead>Receipt</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.map((payment, i) => {
                  const receipt = receipts[i];
                  return (
                    <TableRow key={payment.public_id}>
                      <TableCell>{payment.reference}</TableCell>
                      <TableCell>{PAYMENT_METHOD_LABELS[payment.method]}</TableCell>
                      <TableCell>{formatMoney(payment.amount_minor, payment.currency_code)}</TableCell>
                      <TableCell>
                        <Badge variant={paymentStatusVariant(payment.status)}>{payment.status}</Badge>
                      </TableCell>
                      <TableCell>{new Date(payment.paid_at).toLocaleDateString()}</TableCell>
                      <TableCell>
                        {receipt?.status === "ready" && receipt.file_url ? (
                          <a
                            href={receipt.file_url}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-primary hover:underline"
                          >
                            <Download className="h-3.5 w-3.5" />
                            {receipt.receipt_number}
                          </a>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
