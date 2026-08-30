import type { Metadata } from "next";
import { BookOpen } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getCurrentUser } from "@/lib/session";
import {
  getLibraryMembers,
  getLibraryLoansForMember,
  getLibraryCopies,
  getLibraryBooks,
  getLibraryFinesForLoan,
  LOAN_STATUS_LABELS,
  FINE_STATUS_LABELS,
  type LoanStatus,
  type FineStatus,
} from "@/lib/library";
import { formatMoney } from "@/lib/finance";

export const metadata: Metadata = { title: "My Library" };

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

export default async function MyLibraryPage() {
  const user = await getCurrentUser();
  const studentId = user?.student_public_id;

  if (!studentId) {
    return (
      <div className="mx-auto max-w-5xl space-y-6 p-6">
        <h1 className="text-xl font-semibold">My Library</h1>
        <p className="text-sm text-muted-foreground">
          This page is for students — your account isn&apos;t linked to a student profile.
        </p>
      </div>
    );
  }

  const members = await getLibraryMembers();
  if (members === null) {
    return (
      <div className="mx-auto max-w-5xl space-y-6 p-6">
        <h1 className="text-xl font-semibold">My Library</h1>
        <p className="text-sm text-muted-foreground">You don&apos;t have access to view library records.</p>
      </div>
    );
  }

  const member = members.find((m) => m.student === studentId) ?? null;
  const loans = member ? ((await getLibraryLoansForMember(member.public_id)) ?? []) : [];

  const [copies, books] = await Promise.all([getLibraryCopies(), getLibraryBooks()]);
  const bookById = new Map((books ?? []).map((b) => [b.public_id, b]));
  const copyById = new Map((copies ?? []).map((c) => [c.public_id, c]));

  const finesByLoan = new Map(
    await Promise.all(
      loans.map(async (loan) => [loan.public_id, (await getLibraryFinesForLoan(loan.public_id)) ?? []] as const)
    )
  );
  const allFines = loans.flatMap((loan) => finesByLoan.get(loan.public_id) ?? []);
  const outstandingMinor = allFines
    .filter((f) => f.status === "pending")
    .reduce((sum, f) => sum + f.amount_minor, 0);

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-6">
      <div>
        <h1 className="text-xl font-semibold">My Library</h1>
        <p className="text-sm text-muted-foreground">Books you&apos;ve borrowed and any outstanding fines.</p>
      </div>

      {!member ? (
        <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed py-16 text-center">
          <BookOpen className="h-8 w-8 text-muted-foreground" />
          <p className="font-medium">Not a library member yet</p>
          <p className="text-sm text-muted-foreground">
            Once your school registers you as a library member, your loans will show up here.
          </p>
        </div>
      ) : (
        <>
          {outstandingMinor > 0 && (
            <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm">
              Outstanding fines: <span className="font-medium">{formatMoney(outstandingMinor, allFines[0].currency_code)}</span>
            </div>
          )}

          {loans.length === 0 ? (
            <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed py-16 text-center">
              <BookOpen className="h-8 w-8 text-muted-foreground" />
              <p className="font-medium">No loans yet</p>
              <p className="text-sm text-muted-foreground">Books you borrow from the library will show up here.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Book</TableHead>
                  <TableHead>Borrowed</TableHead>
                  <TableHead>Due</TableHead>
                  <TableHead>Returned</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loans.map((loan) => {
                  const copy = copyById.get(loan.copy);
                  const book = copy ? bookById.get(copy.book) : undefined;
                  return (
                    <TableRow key={loan.public_id}>
                      <TableCell>
                        <div className="font-medium">{book?.title ?? "Unknown title"}</div>
                        {book?.author && <div className="text-xs text-muted-foreground">{book.author}</div>}
                      </TableCell>
                      <TableCell>{loan.borrowed_date}</TableCell>
                      <TableCell>{loan.due_date}</TableCell>
                      <TableCell>{loan.returned_date ?? "—"}</TableCell>
                      <TableCell>
                        <Badge variant={loanStatusVariant(loan.status)}>{LOAN_STATUS_LABELS[loan.status]}</Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}

          {allFines.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-sm font-semibold">Fines</h2>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Reason</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {allFines.map((fine) => (
                    <TableRow key={fine.public_id}>
                      <TableCell>{fine.reason}</TableCell>
                      <TableCell>{formatMoney(fine.amount_minor, fine.currency_code)}</TableCell>
                      <TableCell>
                        <Badge variant={fineStatusVariant(fine.status)}>{FINE_STATUS_LABELS[fine.status]}</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </>
      )}
    </div>
  );
}
