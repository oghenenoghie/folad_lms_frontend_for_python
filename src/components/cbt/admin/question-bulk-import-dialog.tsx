"use client";

import { useState, type ReactNode } from "react";
import { toast } from "sonner";
import { Loader2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { SelectOption } from "@/components/schools/entity-form-dialog";
import type { ActionResult } from "@/lib/action-result";
import type { CBTBulkImportResult } from "@/lib/cbt-types";

const REQUIRED_COLUMNS = [
  "question_type (single_choice/multiple_choice/true_false)",
  "text",
  "option_a..option_f",
  "correct",
  "topic (optional)",
  "difficulty (optional)",
  "marks (optional)",
  "negative_marks (optional)",
];

export function QuestionBulkImportDialog({
  trigger,
  subjectOptions,
  classLevelOptions,
  action,
}: {
  trigger: ReactNode;
  subjectOptions: SelectOption[];
  classLevelOptions: SelectOption[];
  action: (formData: FormData) => Promise<ActionResult<CBTBulkImportResult>>;
}) {
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [subject, setSubject] = useState("");
  const [classLevel, setClassLevel] = useState("");
  const [pending, setPending] = useState(false);
  const [result, setResult] = useState<CBTBulkImportResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  function reset() {
    setFile(null);
    setSubject("");
    setClassLevel("");
    setResult(null);
    setErrorMessage(null);
  }

  async function handleImport() {
    if (!file || !subject || !classLevel) return;
    setPending(true);
    setErrorMessage(null);
    const formData = new FormData();
    formData.set("file", file);
    formData.set("subject", subject);
    formData.set("class_level", classLevel);
    const response = await action(formData);
    setPending(false);
    if (response.success && response.data) {
      setResult(response.data);
      if (response.data.error_count === 0) toast.success(`${response.data.created_count} question(s) imported`);
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
          <DialogTitle>Bulk import questions</DialogTitle>
          <DialogDescription>
            Upload a UTF-8 CSV. Single/multiple choice and true/false questions only — required columns:{" "}
            {REQUIRED_COLUMNS.join(", ")}.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label>Subject</Label>
            <Select value={subject} onValueChange={setSubject}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a subject" />
              </SelectTrigger>
              <SelectContent>
                {subjectOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Class level</Label>
            <Select value={classLevel} onValueChange={setClassLevel}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a class level" />
              </SelectTrigger>
              <SelectContent>
                {classLevelOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>CSV file</Label>
            <Input
              type="file"
              accept=".csv"
              onChange={(e) => {
                setFile(e.target.files?.[0] ?? null);
                setResult(null);
                setErrorMessage(null);
              }}
            />
          </div>
        </div>

        {errorMessage && (
          <Alert variant="destructive">
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        )}

        {result && (
          <div className="space-y-2">
            <p className="text-sm">
              <span className="font-medium">{result.created_count}</span> question(s) imported successfully
              {result.error_count > 0 && (
                <>
                  , <span className="font-medium text-destructive">{result.error_count}</span> row(s) failed
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
          <Button type="button" onClick={handleImport} disabled={!file || !subject || !classLevel || pending}>
            {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
            Import
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
