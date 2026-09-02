// Mirrors apps.core.responses.envelope / error_envelope — the DRF API's
// response shape everywhere in this project.
export type Envelope<T> = {
  success: boolean;
  data: T | null;
  message: string | null;
  errors: string[] | null;
};

export type Paginated<T> = {
  results: T[];
  pagination: {
    page: number;
    page_size: number;
    total_pages: number;
    total_count: number;
    next: string | null;
    previous: string | null;
  };
};

// A detail fetch's outcome, distinguishing "forbidden" (403 — the caller
// lacks the RBAC permission to view this record, e.g. a student account
// with no granted role hitting a staff-only /students/{id}) from
// "not_found" (the record genuinely doesn't exist, or any other non-2xx).
// Conflating the two into a single null used to trigger Next.js's
// notFound() for a plain 403, rendering "this doesn't exist" when the
// real story is "you can't see it".
export type DetailResult<T> =
  | { status: "ok"; data: T }
  | { status: "forbidden" }
  | { status: "not_found" };

export type CurrentUser = {
  public_id: string;
  email: string;
  first_name: string;
  last_name: string;
  organization_id: number | null;
  mfa_enabled: boolean;
  roles: string[];
  // Nullable: a user has at most one of these linked profiles. Used to
  // address "my own" Student/Staff/Guardian record directly, e.g. a
  // student submitting their own exam answers.
  student_public_id: string | null;
  staff_public_id: string | null;
  guardian_public_id: string | null;
};
