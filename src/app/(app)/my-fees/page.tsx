import type { Metadata } from "next";
import Link from "next/link";
import { CreditCard } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getCurrentUser } from "@/lib/session";
import {
  getInvoicesForStudent,
  getPaymentsForInvoice,
  formatMoney,
  INVOICE_STATUS_LABELS,
  type Invoice,
} from "@/lib/finance";

export const metadata: Metadata = { title: "My Fees" };

function invoiceStatusVariant(status: Invoice["status"]): "default" | "secondary" | "destructive" | "outline" {
  if (status === "paid") return "default";
  if (status === "cancelled") return "outline";
  if (status === "issued") return "destructive";
  return "secondary";
}

export default async function MyFeesPage() {
  const user = await getCurrentUser();
  const studentId = user?.student_public_id;

  if (!studentId) {
    return (
      <div className="mx-auto max-w-5xl space-y-6 p-6">
        <h1 className="text-xl font-semibold">My Fees</h1>
        <p className="text-sm text-muted-foreground">
          This page is for students — your account isn&apos;t linked to a student profile.
        </p>
      </div>
    );
  }

  const invoices = await getInvoicesForStudent(studentId);
  const rows = await Promise.all(
    (invoices ?? []).map(async (invoice) => {
      const payments = (await getPaymentsForInvoice(invoice.public_id)) ?? [];
      const paidMinor = payments
        .filter((p) => p.status === "successful")
        .reduce((sum, p) => sum + p.amount_minor, 0);
      return { invoice, balanceMinor: invoice.total_minor - paidMinor };
    })
  );

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-6">
      <div>
        <h1 className="text-xl font-semibold">My Fees</h1>
        <p className="text-sm text-muted-foreground">Invoices and payment history for your fees.</p>
      </div>

      {invoices === null ? (
        <p className="text-sm text-muted-foreground">You don&apos;t have access to view your fees.</p>
      ) : rows.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed py-16 text-center">
          <CreditCard className="h-8 w-8 text-muted-foreground" />
          <p className="font-medium">No invoices yet</p>
          <p className="text-sm text-muted-foreground">
            Once your school issues an invoice, it will show up here.
          </p>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Invoice #</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Balance</TableHead>
              <TableHead>Due date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map(({ invoice, balanceMinor }) => (
              <TableRow key={invoice.public_id}>
                <TableCell>
                  <Link
                    href={`/my-fees/${invoice.public_id}`}
                    className="font-medium text-primary hover:underline"
                  >
                    {invoice.invoice_number}
                  </Link>
                </TableCell>
                <TableCell>
                  <Badge variant={invoiceStatusVariant(invoice.status)}>
                    {INVOICE_STATUS_LABELS[invoice.status]}
                  </Badge>
                </TableCell>
                <TableCell>{formatMoney(invoice.total_minor, invoice.currency_code)}</TableCell>
                <TableCell>
                  {balanceMinor > 0
                    ? formatMoney(balanceMinor, invoice.currency_code)
                    : formatMoney(0, invoice.currency_code)}
                </TableCell>
                <TableCell>{invoice.due_date ?? "—"}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
