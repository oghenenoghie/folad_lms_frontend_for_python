"use client";

import { useState, type ReactNode } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { SelectOption } from "@/components/schools/entity-form-dialog";
import {
  reportTypeOptions,
  reportFormatOptions,
  REPORT_TYPE_PARAMETER_FIELDS,
  reportRequestDefaults,
  type ReportRequestDraft,
} from "@/lib/reports-forms";
import type { ReportType } from "@/lib/reports";
import type { ActionResult } from "@/lib/action-result";

// A plain (non react-hook-form) dialog, since which `parameters` inputs
// apply depends on the live value of `report_type` — EntityFormDialog's
// FieldConfig list is static per call and can't express that, same
// reasoning as DocumentUploadDialog for a file field.
export function ReportRequestDialog({
  trigger,
  schoolOptions,
  classArmOptions,
  termOptions,
  action,
}: {
  trigger: ReactNode;
  schoolOptions: SelectOption[];
  classArmOptions: SelectOption[];
  termOptions: SelectOption[];
  action: (input: Record<string, unknown>) => Promise<ActionResult<unknown>>;
}) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<ReportRequestDraft>(reportRequestDefaults);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function set<K extends keyof ReportRequestDraft>(key: K, value: ReportRequestDraft[K]) {
    setDraft((prev) => ({ ...prev, [key]: value }));
  }

  const paramFields = draft.report_type ? REPORT_TYPE_PARAMETER_FIELDS[draft.report_type] : [];

  async function handleSubmit() {
    if (!draft.school || !draft.report_type || !draft.format) {
      setError("School, report type, and format are all required");
      return;
    }
    setError(null);
    setPending(true);

    const parameters: Record<string, unknown> = {};
    if (paramFields.includes("class_arm") && draft.class_arm) parameters.class_arm_id = draft.class_arm;
    if (paramFields.includes("term") && draft.term) parameters.term_id = draft.term;
    if (paramFields.includes("date_range")) {
      if (draft.date_from) parameters.date_from = draft.date_from;
      if (draft.date_to) parameters.date_to = draft.date_to;
    }

    const result = await action({
      school: draft.school,
      report_type: draft.report_type,
      format: draft.format,
      parameters,
    });
    setPending(false);
    if (result.success) {
      toast.success(result.message ?? "Report requested");
      setOpen(false);
      setDraft(reportRequestDefaults);
    } else {
      setError(result.errors?.join(" ") || result.message || "Could not request report");
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (next) {
          setDraft(reportRequestDefaults);
          setError(null);
        }
      }}
    >
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Request a report</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label>School</Label>
            <Select value={draft.school} onValueChange={(value) => set("school", value)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a school" />
              </SelectTrigger>
              <SelectContent>
                {schoolOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Report type</Label>
            <Select
              value={draft.report_type}
              onValueChange={(value) => set("report_type", value as ReportType)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a report type" />
              </SelectTrigger>
              <SelectContent>
                {reportTypeOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Format</Label>
            <Select
              value={draft.format}
              onValueChange={(value) => set("format", value as ReportRequestDraft["format"])}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a format" />
              </SelectTrigger>
              <SelectContent>
                {reportFormatOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {paramFields.includes("class_arm") && (
            <div className="space-y-2">
              <Label>Class arm (optional — leave unset for every student)</Label>
              <Select value={draft.class_arm} onValueChange={(value) => set("class_arm", value)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="All class arms" />
                </SelectTrigger>
                <SelectContent>
                  {classArmOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {paramFields.includes("term") && (
            <div className="space-y-2">
              <Label>Term (optional — leave unset for every term)</Label>
              <Select value={draft.term} onValueChange={(value) => set("term", value)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="All terms" />
                </SelectTrigger>
                <SelectContent>
                  {termOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {paramFields.includes("date_range") && (
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="date_from">From (optional)</Label>
                <Input
                  id="date_from"
                  type="date"
                  value={draft.date_from}
                  onChange={(e) => set("date_from", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="date_to">To (optional)</Label>
                <Input
                  id="date_to"
                  type="date"
                  value={draft.date_to}
                  onChange={(e) => set("date_to", e.target.value)}
                />
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button type="button" variant="secondary" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button type="button" onClick={handleSubmit} disabled={pending}>
            {pending && <Loader2 className="h-4 w-4 animate-spin" />}
            Request
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
