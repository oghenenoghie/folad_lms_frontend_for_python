// Shared response shape for the students/staff bulk-import endpoints
// (apps.students/apps.staff's bulk_import_service) — no server-only
// dependency here so the client-side BulkImportDialog can import this
// type directly alongside the server actions that return it.
export type BulkImportResult = {
  created: number;
  errors: { row: number; error: string }[];
};
