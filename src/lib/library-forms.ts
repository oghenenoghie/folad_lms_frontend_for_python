import { z } from "zod";
import type { FieldConfig, SelectOption } from "@/components/schools/entity-form-dialog";

export const bookSchema = z.object({
  title: z.string().min(1, "Title is required"),
  isbn: z.string().optional(),
  author: z.string().optional(),
  publisher: z.string().optional(),
  category: z.string().optional(),
  published_year: z.string().optional(),
});
export type BookFormValues = z.infer<typeof bookSchema>;

export const bookFields: FieldConfig<BookFormValues>[] = [
  { name: "title", label: "Title", type: "text" },
  { name: "isbn", label: "ISBN", type: "text" },
  { name: "author", label: "Author", type: "text" },
  { name: "publisher", label: "Publisher", type: "text" },
  { name: "category", label: "Category", type: "text" },
  { name: "published_year", label: "Published year", type: "number" },
];

export const bookDefaults: BookFormValues = {
  title: "",
  isbn: "",
  author: "",
  publisher: "",
  category: "",
  published_year: "",
};

export const copySchema = z.object({
  copy_number: z.string().optional(),
});
export type CopyFormValues = z.infer<typeof copySchema>;

export const copyFields: FieldConfig<CopyFormValues>[] = [
  { name: "copy_number", label: "Copy number (leave blank to auto-assign)", type: "text" },
];

export const copyDefaults: CopyFormValues = { copy_number: "" };

// One form per member type rather than a single form with a conditional
// field — EntityFormDialog's fields are a fixed list, so "student member"
// and "staff member" are two dialogs each with just the one relevant
// picker; member_type itself is bound via the server action, not a field.
export const studentMemberSchema = z.object({
  student: z.string().min(1, "Student is required"),
  is_active: z.boolean(),
});
export type StudentMemberFormValues = z.infer<typeof studentMemberSchema>;

export function studentMemberFields(studentOptions: SelectOption[]): FieldConfig<StudentMemberFormValues>[] {
  return [
    {
      name: "student",
      label: "Student",
      type: "select",
      options: studentOptions,
      placeholder: "Select a student",
    },
    { name: "is_active", label: "Active", type: "checkbox" },
  ];
}

export const studentMemberDefaults: StudentMemberFormValues = { student: "", is_active: true };

export const staffMemberSchema = z.object({
  staff: z.string().min(1, "Staff member is required"),
  is_active: z.boolean(),
});
export type StaffMemberFormValues = z.infer<typeof staffMemberSchema>;

export function staffMemberFields(staffOptions: SelectOption[]): FieldConfig<StaffMemberFormValues>[] {
  return [
    { name: "staff", label: "Staff member", type: "select", options: staffOptions, placeholder: "Select a staff member" },
    { name: "is_active", label: "Active", type: "checkbox" },
  ];
}

export const staffMemberDefaults: StaffMemberFormValues = { staff: "", is_active: true };

// Membership type/link aren't editable once created (see the school page's
// member list) — only whether the membership is active.
export const memberActiveSchema = z.object({ is_active: z.boolean() });
export type MemberActiveFormValues = z.infer<typeof memberActiveSchema>;

export const memberActiveFields: FieldConfig<MemberActiveFormValues>[] = [
  { name: "is_active", label: "Active", type: "checkbox" },
];

export const checkoutSchema = z.object({
  copy: z.string().min(1, "A copy is required"),
  member: z.string().min(1, "A member is required"),
  due_date: z.string().min(1, "Due date is required"),
});
export type CheckoutFormValues = z.infer<typeof checkoutSchema>;

export function checkoutFields(
  copyOptions: SelectOption[],
  memberOptions: SelectOption[]
): FieldConfig<CheckoutFormValues>[] {
  return [
    { name: "copy", label: "Copy", type: "select", options: copyOptions, placeholder: "Select an available copy" },
    { name: "member", label: "Member", type: "select", options: memberOptions, placeholder: "Select a member" },
    { name: "due_date", label: "Due date", type: "date" },
  ];
}

export const checkoutDefaults: CheckoutFormValues = { copy: "", member: "", due_date: "" };

// amount_minor: the backend stores currency in minor units (e.g. cents) —
// same convention as apps.finance — so the label spells that out rather
// than silently expecting "500" to mean 5.00.
export const issueFineSchema = z.object({
  amount_minor: z.coerce.number().int().min(1, "Amount must be at least 1"),
  reason: z.string().min(1, "Reason is required"),
});
export type IssueFineFormValues = z.infer<typeof issueFineSchema>;

export const issueFineFields: FieldConfig<IssueFineFormValues>[] = [
  { name: "amount_minor", label: "Amount (in minor units, e.g. cents)", type: "number" },
  { name: "reason", label: "Reason", type: "text" },
];

export const issueFineDefaults: IssueFineFormValues = { amount_minor: 0, reason: "" };
