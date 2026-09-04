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

// `published_year` is a nullable PositiveIntegerField — an empty string
// from the optional number input has to become an actual `null`, same
// reasoning as actions/academics.ts's normalizeEffectiveTo.
function normalizeBookInput(input: Record<string, unknown>) {
  return { ...input, published_year: input.published_year || null };
}

// --- Books ---
export async function createBook(schoolId: string, input: Record<string, unknown>) {
  const result = await call("/api/v1/library-books", "POST", { ...normalizeBookInput(input), school: schoolId });
  if (result.success) revalidatePath(`/schools/${schoolId}`);
  return result;
}

export async function updateBook(schoolId: string, publicId: string, input: Record<string, unknown>) {
  const result = await call(`/api/v1/library-books/${publicId}`, "PATCH", normalizeBookInput(input));
  if (result.success) revalidatePath(`/schools/${schoolId}`);
  return result;
}

export async function deleteBook(schoolId: string, publicId: string) {
  const result = await call(`/api/v1/library-books/${publicId}`, "DELETE");
  if (result.success) revalidatePath(`/schools/${schoolId}`);
  return result;
}

// --- Copies ---
export async function createCopy(schoolId: string, bookId: string, input: Record<string, unknown>) {
  const result = await call("/api/v1/library-copies", "POST", { ...input, book: bookId });
  if (result.success) revalidatePath(`/schools/${schoolId}`);
  return result;
}

export async function updateCopy(schoolId: string, publicId: string, input: Record<string, unknown>) {
  const result = await call(`/api/v1/library-copies/${publicId}`, "PATCH", input);
  if (result.success) revalidatePath(`/schools/${schoolId}`);
  return result;
}

export async function deleteCopy(schoolId: string, publicId: string) {
  const result = await call(`/api/v1/library-copies/${publicId}`, "DELETE");
  if (result.success) revalidatePath(`/schools/${schoolId}`);
  return result;
}

// --- Members ---
// `membership_number` is auto-assigned server-side when blank (see
// LibraryMember.save()), same as LibraryCopy.copy_number. But DRF only
// treats a blank=True CharField as optional when the key is *present*
// with an empty value — an omitted key 400s as "required" even though the
// model would happily default it. The copy form dodges this by carrying
// a (blank-defaulted) copy_number field; the member forms don't have an
// equivalent field at all, so the empty string is added here instead.
export async function createStudentMember(schoolId: string, input: Record<string, unknown>) {
  const result = await call("/api/v1/library-members", "POST", {
    ...input,
    school: schoolId,
    member_type: "student",
    membership_number: "",
  });
  if (result.success) revalidatePath(`/schools/${schoolId}`);
  return result;
}

export async function createStaffMember(schoolId: string, input: Record<string, unknown>) {
  const result = await call("/api/v1/library-members", "POST", {
    ...input,
    school: schoolId,
    member_type: "staff",
    membership_number: "",
  });
  if (result.success) revalidatePath(`/schools/${schoolId}`);
  return result;
}

export async function updateMemberActive(schoolId: string, publicId: string, input: Record<string, unknown>) {
  const result = await call(`/api/v1/library-members/${publicId}`, "PATCH", input);
  if (result.success) revalidatePath(`/schools/${schoolId}`);
  return result;
}

export async function deleteMember(schoolId: string, publicId: string) {
  const result = await call(`/api/v1/library-members/${publicId}`, "DELETE");
  if (result.success) revalidatePath(`/schools/${schoolId}`);
  return result;
}

// --- Loans (circulation desk) ---
export async function checkoutBook(input: Record<string, unknown>) {
  const result = await call("/api/v1/library-loans", "POST", input);
  if (result.success) revalidatePath("/library-desk");
  return result;
}

export async function returnLoan(publicId: string) {
  const result = await call(`/api/v1/library-loans/${publicId}/return`, "POST");
  if (result.success) revalidatePath("/library-desk");
  return result;
}

export async function markLoanLost(publicId: string) {
  const result = await call(`/api/v1/library-loans/${publicId}/mark-lost`, "POST");
  if (result.success) revalidatePath("/library-desk");
  return result;
}

// --- Fines ---
export async function issueFine(loanId: string, input: Record<string, unknown>) {
  const result = await call("/api/v1/library-fines", "POST", { ...input, loan: loanId });
  if (result.success) revalidatePath("/library-desk");
  return result;
}

export async function payFine(publicId: string) {
  const result = await call(`/api/v1/library-fines/${publicId}/pay`, "POST");
  if (result.success) revalidatePath("/library-desk");
  return result;
}

export async function waiveFine(publicId: string) {
  const result = await call(`/api/v1/library-fines/${publicId}/waive`, "POST");
  if (result.success) revalidatePath("/library-desk");
  return result;
}
