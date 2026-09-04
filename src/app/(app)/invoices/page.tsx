import type { Metadata } from "next";
import Link from "next/link";
import { Receipt, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { InvoiceCreateFormDialog } from "@/components/finance/invoice-form-dialog";
import { getInvoices, formatMoney, INVOICE_STATUS_LABELS, type InvoiceStatus } from "@/lib/finance";
import { getStudents } from "@/lib/students";
import { getAcademicYears, getTerms } from "@/lib/schools";
import { createInvoice } from "@/lib/actions/finance";
import { invoiceCreateDefaults } from "@/lib/finance-forms";

export const metadata: Metadata = { title: "Invoices" };

function statusVariant(status: InvoiceStatus): "default" | "secondary" | "destructive" | "outline" {
  if (status === "paid") return "default";
  if (status === "cancelled") return "destructive";
  if (status === "draft") return "outline";
  return "secondary";
}

async function getTermOptions() {
  const [terms, academicYears] = await Promise.all([getTerms(), getAcademicYears()]);
  if (!terms || !academicYears) return [];

  const yearNameById = new Map(academicYears.map((y) => [y.public_id, y.name]));
  return terms.map((term) => ({
    value: term.public_id,
    label: `${yearNameById.get(term.academic_year) ?? "Unknown year"} — ${term.name}`,
  }));
}

export default async function InvoicesPage() {
  const [invoices, students, termOptions] = await Promise.all([
    getInvoices(),
    getStudents(),
    getTermOptions(),
  ]);

  const studentOptions = (students ?? []).map((s) => ({
    value: s.public_id,
    label: `${s.first_name} ${s.last_name} (${s.admission_number})`,
  }));
  const studentNameById = new Map(
    (students ?? []).map((s) => [s.public_id, `${s.first_name} ${s.last_name}`])
  );

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Invoices</h1>
          <p className="text-sm text-muted-foreground">Bill students and track payments.</p>
        </div>
        {invoices !== null && studentOptions.length > 0 && termOptions.length > 0 && (
          <InvoiceCreateFormDialog
            trigger={
              <Button>
                <Plus className="h-4 w-4" />
                New invoice
              </Button>
            }
            title="New invoice"
            defaultValues={invoiceCreateDefaults}
            studentOptions={studentOptions}
            termOptions={termOptions}
            action={createInvoice}
          />
        )}
      </div>

      {invoices === null ? (
        <p className="text-sm text-muted-foreground">You don&apos;t have access to invoices.</p>
      ) : invoices.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed py-16 text-center">
          <Receipt className="h-8 w-8 text-muted-foreground" />
          <p className="font-medium">No invoices yet</p>
          <p className="text-sm text-muted-foreground">
            {studentOptions.length === 0 || termOptions.length === 0
              ? "Add a student and a term first, then create an invoice."
              : "Create your first invoice to get started."}
          </p>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Invoice #</TableHead>
              <TableHead>Student</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Due date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {invoices.map((invoice) => (
              <TableRow key={invoice.public_id}>
                <TableCell>
                  <Link
                    href={`/invoices/${invoice.public_id}`}
                    className="font-medium text-primary hover:underline"
                  >
                    {invoice.invoice_number}
                  </Link>
                </TableCell>
                <TableCell>{studentNameById.get(invoice.student) ?? "Unknown student"}</TableCell>
                <TableCell>{formatMoney(invoice.total_minor, invoice.currency_code)}</TableCell>
                <TableCell>
                  <Badge variant={statusVariant(invoice.status)}>{INVOICE_STATUS_LABELS[invoice.status]}</Badge>
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
