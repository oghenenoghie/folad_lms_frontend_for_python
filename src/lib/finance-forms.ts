import { z } from "zod";
import type { FieldConfig, SelectOption } from "@/components/schools/entity-form-dialog";

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
