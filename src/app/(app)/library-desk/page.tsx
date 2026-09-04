import type { Metadata } from "next";
import { BookOpen, Undo2, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckoutFormDialog } from "@/components/library/checkout-form-dialog";
import { IssueFineFormDialog } from "@/components/library/issue-fine-form-dialog";
import { LibraryActionButton } from "@/components/library/action-button";
import {
  getLibraryLoans,
  getLibraryCopies,
  getLibraryBooks,
  getLibraryMembers,
  getLibraryFinesForLoan,
  LOAN_STATUS_LABELS,
  FINE_STATUS_LABELS,
  type LoanStatus,
  type FineStatus,
  type LibraryLoan,
} from "@/lib/library";
import { getStudents } from "@/lib/students";
import { getStaffList } from "@/lib/staff";
import { checkoutBook, returnLoan, markLoanLost, issueFine, payFine, waiveFine } from "@/lib/actions/library";
import { checkoutDefaults, issueFineDefaults } from "@/lib/library-forms";
import { formatMoney } from "@/lib/finance";

export const metadata: Metadata = { title: "Library Desk" };

function loanStatusVariant(status: LoanStatus): "default" | "secondary" | "destructive" | "outline" {
  if (status === "returned") return "outline";
  if (status === "overdue" || status === "lost") return "destructive";
  return "default";
}

function fineStatusVariant(status: FineStatus): "default" | "secondary" | "destructive" | "outline" {
  if (status === "paid") return "outline";
  if (status === "waived") return "secondary";
  return "destructive";
}

async function LoanRow({
  loan,
  bookLabel,
  memberLabel,
}: {
  loan: LibraryLoan;
  bookLabel: string;
  memberLabel: string;
}) {
  const fines = (await getLibraryFinesForLoan(loan.public_id)) ?? [];
  const isOpen = loan.status === "borrowed" || loan.status === "overdue";

  return (
    <div className="rounded-lg border">
      <div className="flex items-center justify-between gap-3 border-b px-4 py-3">
        <div>
          <p className="font-medium">{bookLabel}</p>
          <p className="text-sm text-muted-foreground">
            {memberLabel} · borrowed {loan.borrowed_date} · due {loan.due_date}
            {loan.returned_date && ` · returned ${loan.returned_date}`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={loanStatusVariant(loan.status)}>{LOAN_STATUS_LABELS[loan.status]}</Badge>
          {isOpen && (
            <>
              <LibraryActionButton
                label="Return"
                icon={<Undo2 className="h-4 w-4" />}
                action={returnLoan.bind(null, loan.public_id)}
              />
              <LibraryActionButton
                label="Mark lost"
                icon={<AlertTriangle className="h-4 w-4" />}
                variant="destructive"
                action={markLoanLost.bind(null, loan.public_id)}
              />
            </>
          )}
        </div>
      </div>

      <div className="px-4 py-3">
        <div className="mb-2 flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Fines</p>
          <IssueFineFormDialog
            trigger={
              <button type="button" className="text-xs font-medium text-primary hover:underline">
                + Issue fine
              </button>
            }
            title="Issue a fine"
            defaultValues={issueFineDefaults}
            action={issueFine.bind(null, loan.public_id)}
          />
        </div>
        {fines.length === 0 ? (
          <p className="text-sm text-muted-foreground">No fines on this loan.</p>
        ) : (
          <div className="space-y-1.5">
            {fines.map((fine) => (
              <div
                key={fine.public_id}
                className="flex items-center justify-between rounded-md bg-muted/50 px-3 py-1.5 text-sm"
              >
                <span>
                  {fine.reason} — {formatMoney(fine.amount_minor, fine.currency_code)}
                </span>
                <div className="flex items-center gap-2">
                  <Badge variant={fineStatusVariant(fine.status)}>{FINE_STATUS_LABELS[fine.status]}</Badge>
                  {fine.status === "pending" && (
                    <>
                      <LibraryActionButton label="Pay" action={payFine.bind(null, fine.public_id)} />
                      <LibraryActionButton
                        label="Waive"
                        variant="outline"
                        action={waiveFine.bind(null, fine.public_id)}
                      />
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default async function LibraryDeskPage() {
  const [loans, copies, books, members, students, staffList] = await Promise.all([
    getLibraryLoans(),
    getLibraryCopies(),
    getLibraryBooks(),
    getLibraryMembers(),
    getStudents(),
    getStaffList(),
  ]);

  const bookById = new Map((books ?? []).map((b) => [b.public_id, b]));
  const copyById = new Map((copies ?? []).map((c) => [c.public_id, c]));
  const studentNameById = new Map(
    (students ?? []).map((s) => [s.public_id, `${s.first_name} ${s.last_name}`])
  );
  const staffNameById = new Map((staffList ?? []).map((s) => [s.public_id, `${s.first_name} ${s.last_name}`]));

  function bookLabelForCopy(copyId: string): string {
    const copy = copyById.get(copyId);
    const book = copy ? bookById.get(copy.book) : undefined;
    return book ? `${book.title} #${copy?.copy_number}` : "Unknown book";
  }

  function memberLabel(memberId: string): string {
    const member = (members ?? []).find((m) => m.public_id === memberId);
    if (!member) return "Unknown member";
    return member.member_type === "student"
      ? (studentNameById.get(member.student ?? "") ?? "Unknown student")
      : (staffNameById.get(member.staff ?? "") ?? "Unknown staff");
  }

  const copyOptions = (copies ?? [])
    .filter((c) => c.status === "available")
    .map((c) => ({ value: c.public_id, label: bookLabelForCopy(c.public_id) }));
  const memberOptions = (members ?? [])
    .filter((m) => m.is_active)
    .map((m) => ({ value: m.public_id, label: memberLabel(m.public_id) }));

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Library Desk</h1>
          <p className="text-sm text-muted-foreground">Check books out, take returns, and manage fines.</p>
        </div>
        {loans !== null && copyOptions.length > 0 && memberOptions.length > 0 && (
          <CheckoutFormDialog
            trigger={
              <Button>
                <BookOpen className="h-4 w-4" />
                Check out a book
              </Button>
            }
            title="Check out a book"
            defaultValues={checkoutDefaults}
            copyOptions={copyOptions}
            memberOptions={memberOptions}
            action={checkoutBook}
          />
        )}
      </div>

      {loans === null ? (
        <p className="text-sm text-muted-foreground">You don&apos;t have access to the library desk.</p>
      ) : loans.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed py-16 text-center">
          <BookOpen className="h-8 w-8 text-muted-foreground" />
          <p className="font-medium">No loans yet</p>
          <p className="text-sm text-muted-foreground">
            {copyOptions.length === 0 || memberOptions.length === 0
              ? "Add a book copy and a library member first, then check out a book."
              : "Check out your first book to get started."}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {loans.map((loan) => (
            <LoanRow
              key={loan.public_id}
              loan={loan}
              bookLabel={bookLabelForCopy(loan.copy)}
              memberLabel={memberLabel(loan.member)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
