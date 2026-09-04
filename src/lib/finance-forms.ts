import { z } from "zod";
import type { FieldConfig, SelectOption } from "@/components/schools/entity-form-dialog";
import type { PaymentMethod } from "@/lib/finance";

// discount_type isn't a form field — see PercentageDiscountFormDialog /
// FixedDiscountFormDialog. The model's CheckConstraint requires exactly
// one of percentage/fixed_amount_minor depending on discount_type, so each
// type gets its own dialog (fixed type, one relevant amount field) rather
// than one form with a conditional field EntityFormDialog can't express.
export const percentageDiscountSchema = z.object({
  name: z.string().min(1, "Name is required"),
  percentage: z.coerce.number().min(0.01, "Must be greater than 0").max(100, "Cannot exceed 100"),
  is_active: z.boolean(),
});
export type PercentageDiscountFormValues = z.infer<typeof percentageDiscountSchema>;

export const percentageDiscountFields: FieldConfig<PercentageDiscountFormValues>[] = [
  { name: "name", label: "Name", type: "text" },
  { name: "percentage", label: "Percentage off", type: "number" },
  { name: "is_active", label: "Active", type: "checkbox" },
];

export const percentageDiscountDefaults: PercentageDiscountFormValues = {
  name: "",
  percentage: 0,
  is_active: true,
};

export const fixedDiscountSchema = z.object({
  name: z.string().min(1, "Name is required"),
  fixed_amount_minor: z.coerce.number().int().min(1, "Amount must be at least 1"),
  is_active: z.boolean(),
});
export type FixedDiscountFormValues = z.infer<typeof fixedDiscountSchema>;

export const fixedDiscountFields: FieldConfig<FixedDiscountFormValues>[] = [
  { name: "name", label: "Name", type: "text" },
  { name: "fixed_amount_minor", label: "Amount off (in minor units, e.g. cents)", type: "number" },
  { name: "is_active", label: "Active", type: "checkbox" },
];

export const fixedDiscountDefaults: FixedDiscountFormValues = {
  name: "",
  fixed_amount_minor: 0,
  is_active: true,
};

export const scholarshipSchema = z.object({
  discount: z.string().min(1, "Discount is required"),
  academic_year: z.string().min(1, "Academic year is required"),
  is_active: z.boolean(),
});
export type ScholarshipFormValues = z.infer<typeof scholarshipSchema>;

export function scholarshipFields(
  discountOptions: SelectOption[],
  academicYearOptions: SelectOption[]
): FieldConfig<ScholarshipFormValues>[] {
  return [
    {
      name: "discount",
      label: "Discount",
      type: "select",
      options: discountOptions,
      placeholder: "Select a discount",
    },
    {
      name: "academic_year",
      label: "Academic year",
      type: "select",
      options: academicYearOptions,
      placeholder: "Select an academic year",
    },
    { name: "is_active", label: "Active", type: "checkbox" },
  ];
}

export const scholarshipDefaults: ScholarshipFormValues = {
  discount: "",
  academic_year: "",
  is_active: true,
};

// discount/academic_year aren't editable server-side (perform_update on
// ScholarshipDetailView doesn't drop them explicitly, but reassigning a
// scholarship to a different discount/year is conceptually a new award,
// not an edit) — the edit form only covers whether it's still active.
export const scholarshipActiveSchema = z.object({ is_active: z.boolean() });
export type ScholarshipActiveFormValues = z.infer<typeof scholarshipActiveSchema>;

export const scholarshipActiveFields: FieldConfig<ScholarshipActiveFormValues>[] = [
  { name: "is_active", label: "Active", type: "checkbox" },
];

export const feeStructureCreateSchema = z.object({
  term: z.string().min(1, "Term is required"),
  name: z.string().min(1, "Name is required"),
});
export type FeeStructureCreateFormValues = z.infer<typeof feeStructureCreateSchema>;

export function feeStructureCreateFields(
  termOptions: SelectOption[]
): FieldConfig<FeeStructureCreateFormValues>[] {
  return [
    { name: "term", label: "Term", type: "select", options: termOptions, placeholder: "Select a term" },
    { name: "name", label: "Name", type: "text" },
  ];
}

export const feeStructureCreateDefaults: FeeStructureCreateFormValues = { term: "", name: "" };

export const feeStructureEditSchema = z.object({
  name: z.string().min(1, "Name is required"),
  is_active: z.boolean(),
});
export type FeeStructureEditFormValues = z.infer<typeof feeStructureEditSchema>;

export const feeStructureEditFields: FieldConfig<FeeStructureEditFormValues>[] = [
  { name: "name", label: "Name", type: "text" },
  { name: "is_active", label: "Active", type: "checkbox" },
];

export const feeItemSchema = z.object({
  name: z.string().min(1, "Name is required"),
  amount_minor: z.coerce.number().int().min(1, "Amount must be at least 1"),
  is_mandatory: z.boolean(),
});
export type FeeItemFormValues = z.infer<typeof feeItemSchema>;

export const feeItemFields: FieldConfig<FeeItemFormValues>[] = [
  { name: "name", label: "Name", type: "text" },
  { name: "amount_minor", label: "Amount (in minor units, e.g. cents)", type: "number" },
  { name: "is_mandatory", label: "Mandatory", type: "checkbox" },
];

export const feeItemDefaults: FeeItemFormValues = { name: "", amount_minor: 0, is_mandatory: true };

export const invoiceCreateSchema = z.object({
  student: z.string().min(1, "Student is required"),
  term: z.string().min(1, "Term is required"),
  due_date: z.string().optional(),
});
export type InvoiceCreateFormValues = z.infer<typeof invoiceCreateSchema>;

export function invoiceCreateFields(
  studentOptions: SelectOption[],
  termOptions: SelectOption[]
): FieldConfig<InvoiceCreateFormValues>[] {
  return [
    {
      name: "student",
      label: "Student",
      type: "select",
      options: studentOptions,
      placeholder: "Select a student",
    },
    { name: "term", label: "Term", type: "select", options: termOptions, placeholder: "Select a term" },
    { name: "due_date", label: "Due date (optional)", type: "date" },
  ];
}

export const invoiceCreateDefaults: InvoiceCreateFormValues = { student: "", term: "", due_date: "" };

// unit_amount_minor/description are both optional here — when a fee_item
// is picked they're derived server-side from it (see
// apps.finance.services.invoice_line_service.add_line); leave them blank
// to bill straight off the fee item's own name/price, or fill them in for
// a one-off custom charge with no backing fee item.
export const invoiceLineSchema = z.object({
  fee_item: z.string().optional(),
  description: z.string().optional(),
  quantity: z.coerce.number().int().min(1, "Quantity must be at least 1"),
  unit_amount_minor: z.string().optional(),
});
export type InvoiceLineFormValues = z.infer<typeof invoiceLineSchema>;

export function invoiceLineFields(feeItemOptions: SelectOption[]): FieldConfig<InvoiceLineFormValues>[] {
  return [
    {
      name: "fee_item",
      label: "Fee item (optional)",
      type: "select",
      options: feeItemOptions,
      placeholder: "Custom charge (no fee item)",
    },
    { name: "description", label: "Description (defaults to the fee item's name)", type: "text" },
    { name: "quantity", label: "Quantity", type: "number" },
    {
      name: "unit_amount_minor",
      label: "Unit amount in minor units (defaults to the fee item's price)",
      type: "text",
    },
  ];
}

export const invoiceLineDefaults: InvoiceLineFormValues = {
  fee_item: "",
  description: "",
  quantity: 1,
  unit_amount_minor: "",
};

export const paymentMethodOptions: SelectOption[] = [
  { value: "cash", label: "Cash" },
  { value: "bank_transfer", label: "Bank transfer" },
  { value: "card", label: "Card" },
  { value: "ussd", label: "USSD" },
  { value: "cheque", label: "Cheque" },
];

export function paymentMethodLabel(method: PaymentMethod | string): string {
  return paymentMethodOptions.find((option) => option.value === method)?.label ?? method;
}

export const paymentSchema = z.object({
  reference: z.string().min(1, "Reference is required"),
  amount_minor: z.coerce.number().int().min(1, "Amount must be at least 1"),
  method: z.enum(["cash", "bank_transfer", "card", "ussd", "cheque"]),
});
export type PaymentFormValues = z.infer<typeof paymentSchema>;

export const paymentFields: FieldConfig<PaymentFormValues>[] = [
  { name: "reference", label: "Reference (idempotency key)", type: "text" },
  { name: "amount_minor", label: "Amount (in minor units, e.g. cents)", type: "number" },
  { name: "method", label: "Method", type: "select", options: paymentMethodOptions },
];

export const paymentDefaults: PaymentFormValues = { reference: "", amount_minor: 0, method: "cash" };

export const refundSchema = z.object({
  amount_minor: z.coerce.number().int().min(1, "Amount must be at least 1"),
  reason: z.string().optional(),
});
export type RefundFormValues = z.infer<typeof refundSchema>;

export const refundFields: FieldConfig<RefundFormValues>[] = [
  { name: "amount_minor", label: "Amount (in minor units, e.g. cents)", type: "number" },
  { name: "reason", label: "Reason", type: "text" },
];

export const refundDefaults: RefundFormValues = { amount_minor: 0, reason: "" };
