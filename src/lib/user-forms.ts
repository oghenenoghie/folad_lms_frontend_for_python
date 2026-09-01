import { z } from "zod";
import type { FieldConfig } from "@/components/schools/entity-form-dialog";

// User has no field that's immutable after creation (even `email`, the
// login identifier, can be changed here — same as Django Admin's own
// UserChangeForm) — same schema for create and edit, only the `password`
// field's label differs (see userCreateFields/userEditFields below).
// Role assignment is a separate, dedicated section on the user detail
// page (RolesSection) rather than a field here, since it's a multi-value
// pick list EntityFormDialog's FieldConfig doesn't support.
export const userSchema = z.object({
  email: z.string().min(1, "Email is required").email("Enter a valid email"),
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  is_active: z.boolean(),
  is_staff: z.boolean(),
  is_superuser: z.boolean(),
  password: z.string().optional(),
});
export type UserFormValues = z.infer<typeof userSchema>;

export const userCreateFields: FieldConfig<UserFormValues>[] = [
  { name: "email", label: "Email", type: "email" },
  { name: "first_name", label: "First name", type: "text" },
  { name: "last_name", label: "Last name", type: "text" },
  { name: "password", label: "Password (leave blank to auto-generate)", type: "password" },
  { name: "is_active", label: "Active", type: "checkbox" },
  { name: "is_staff", label: "Django Admin access (is_staff)", type: "checkbox" },
  { name: "is_superuser", label: "Superuser", type: "checkbox" },
];

export const userEditFields: FieldConfig<UserFormValues>[] = [
  { name: "email", label: "Email", type: "email" },
  { name: "first_name", label: "First name", type: "text" },
  { name: "last_name", label: "Last name", type: "text" },
  { name: "password", label: "New password (leave blank to keep current)", type: "password" },
  { name: "is_active", label: "Active", type: "checkbox" },
  { name: "is_staff", label: "Django Admin access (is_staff)", type: "checkbox" },
  { name: "is_superuser", label: "Superuser", type: "checkbox" },
];

export const userCreateDefaults: UserFormValues = {
  email: "",
  first_name: "",
  last_name: "",
  is_active: true,
  is_staff: false,
  is_superuser: false,
  password: "",
};

// Role has no field that's immutable after creation either — one schema
// for create and edit. Permission assignment is its own dedicated section
// on the role detail page (PermissionsSection), same reasoning as roles
// on the user form above.
export const roleSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .regex(/^[A-Za-z0-9_]+$/, "Use letters, numbers, and underscores only"),
  label: z.string().min(1, "Label is required"),
});
export type RoleFormValues = z.infer<typeof roleSchema>;

export const roleFields: FieldConfig<RoleFormValues>[] = [
  { name: "name", label: "Name (unique identifier)", type: "text" },
  { name: "label", label: "Display label", type: "text" },
];

export const roleDefaults: RoleFormValues = { name: "", label: "" };
