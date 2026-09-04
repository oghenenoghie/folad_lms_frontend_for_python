import "server-only";
import { djangoFetch } from "@/lib/session";
import type { Envelope, Paginated } from "@/lib/api-types";

export type LibraryBook = {
  public_id: string;
  school: string;
  isbn: string;
  title: string;
  author: string;
  publisher: string;
  category: string;
  published_year: number | null;
};

export type CopyStatus = "available" | "loaned" | "lost" | "damaged";

export type LibraryCopy = {
  public_id: string;
  book: string;
  copy_number: string;
  status: CopyStatus;
};

export type LibraryMember = {
  public_id: string;
  school: string;
  member_type: "student" | "staff";
  student: string | null;
  staff: string | null;
  membership_number: string;
  is_active: boolean;
};

export type LoanStatus = "borrowed" | "returned" | "overdue" | "lost";

export type LibraryLoan = {
  public_id: string;
  copy: string;
  member: string;
  borrowed_date: string;
  due_date: string;
  returned_date: string | null;
  status: LoanStatus;
};

export type FineStatus = "pending" | "paid" | "waived";

export type LibraryFine = {
  public_id: string;
  loan: string;
  amount_minor: number;
  currency_code: string;
  reason: string;
  status: FineStatus;
  paid_at: string | null;
};

export const LOAN_STATUS_LABELS: Record<LoanStatus, string> = {
  borrowed: "Borrowed",
  returned: "Returned",
  overdue: "Overdue",
  lost: "Lost",
};

export const FINE_STATUS_LABELS: Record<FineStatus, string> = {
  pending: "Pending",
  paid: "Paid",
  waived: "Waived",
};

/** null return means "not permitted to view" (403) — same convention as
 * lib/schools.ts's listOrNull. */
async function listOrNull<T>(path: string): Promise<T[] | null> {
  const res = await djangoFetch(path);
  if (!res.ok) return null;
  const body: Envelope<Paginated<T>> = await res.json();
  return body.success && body.data ? body.data.results : null;
}

export async function getLibraryMembers(): Promise<LibraryMember[] | null> {
  return listOrNull<LibraryMember>(`/api/v1/library-members?page_size=200`);
}

export async function getLibraryLoansForMember(memberId: string): Promise<LibraryLoan[] | null> {
  return listOrNull<LibraryLoan>(`/api/v1/library-loans?member_id=${memberId}&page_size=200`);
}

// `book_id` is an optional filter server-side — used by the book detail
// section's nested copies list; the circulation desk instead fetches every
// copy unfiltered to build its "available copies" checkout picker.
export async function getLibraryCopies(bookId?: string): Promise<LibraryCopy[] | null> {
  const query = bookId ? `book_id=${bookId}&` : "";
  return listOrNull<LibraryCopy>(`/api/v1/library-copies?${query}page_size=200`);
}

export async function getLibraryBooks(schoolId?: string): Promise<LibraryBook[] | null> {
  const query = schoolId ? `school_id=${schoolId}&` : "";
  return listOrNull<LibraryBook>(`/api/v1/library-books?${query}page_size=200`);
}

export async function getLibraryFinesForLoan(loanId: string): Promise<LibraryFine[] | null> {
  return listOrNull<LibraryFine>(`/api/v1/library-fines?loan_id=${loanId}&page_size=100`);
}

// --- Circulation desk (all loans, not scoped to one member) ---

export async function getLibraryLoans(): Promise<LibraryLoan[] | null> {
  return listOrNull<LibraryLoan>(`/api/v1/library-loans?page_size=200`);
}

export async function getLibraryMembersBySchool(schoolId: string): Promise<LibraryMember[] | null> {
  return listOrNull<LibraryMember>(`/api/v1/library-members?school_id=${schoolId}&page_size=200`);
}
