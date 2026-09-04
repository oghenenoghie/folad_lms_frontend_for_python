"use client";

import { useState, type ReactNode } from "react";
import { toast } from "sonner";
import { Loader2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { ActionResult } from "@/lib/action-result";
import type { BulkImportResult } from "@/lib/bulk-import";

// Shared by /students and /staff — the two bulk-import endpoints return
// the same {created, errors} shape (see apps.students/apps.staff's
// bulk_import_service), so one dialog covers both; only the trigger,
// title, and which server action to call differ per caller.
export function BulkImportDialog({
  trigger,
  title,
  requiredColumns,
  action,
}: {
  trigger: ReactNode;
  title: string;
  requiredColumns: string[];
  action: (formData: FormData) => Promise<ActionResult<BulkImportResult>>;
}) {
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [pending, setPending] = useState(false);
  const [result, setResult] = useState<BulkImportResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  function reset() {
    setFile(null);
    setResult(null);
    setErrorMessage(null);
  }

  async function handleImport() {
    if (!file) return;
    setPending(true);
    setErrorMessage(null);
    const formData = new FormData();
    formData.set("file", file);
    const response = await action(formData);
    setPending(false);
    if (response.success && response.data) {
      setResult(response.data);
      if (response.data.errors.length === 0) toast.success(`${response.data.created} row(s) imported`);
    } else {
      setErrorMessage(response.errors?.join(" ") || response.message || "Import failed");
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) reset();
      }}
    >
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            Upload a .csv or .xlsx file. Required columns: {requiredColumns.join(", ")}.
          </DialogDescription>
        </DialogHeader>

        <Input
          type="file"
          accept=".csv,.xlsx"
          onChange={(e) => {
            setFile(e.target.files?.[0] ?? null);
            setResult(null);
            setErrorMessage(null);
          }}
        />

        {errorMessage && (
          <Alert variant="destructive">
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        )}

        {result && (
          <div className="space-y-2">
            <p className="text-sm">
              <span className="font-medium">{result.created}</span> row(s) imported successfully
              {result.errors.length > 0 && (
                <>
                  , <span className="font-medium text-destructive">{result.errors.length}</span> row(s) failed
                </>
              )}
              .
            </p>
            {result.errors.length > 0 && (
              <div className="max-h-48 overflow-y-auto rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-16">Row</TableHead>
                      <TableHead>Error</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {result.errors.map((rowError) => (
                      <TableRow key={rowError.row}>
                        <TableCell>{rowError.row}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{rowError.error}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        )}

        <DialogFooter>
          <Button type="button" onClick={handleImport} disabled={!file || pending}>
            {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
            Import
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
