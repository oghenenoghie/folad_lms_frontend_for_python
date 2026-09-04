import "server-only";
import { cache } from "react";
import { djangoFetch } from "@/lib/session";
import type { Envelope, Paginated } from "@/lib/api-types";

export type AdminUser = {
  public_id: string;
  email: string;
  first_name: string;
  last_name: string;
  organization: string | null;
  is_active: boolean;
  is_staff: boolean;
  is_superuser: boolean;
  roles: string[];
  generated_password: string | null;
};

export type Role = {
  public_id: string;
  name: string;
  label: string;
  is_system: boolean;
  organization: string | null;
  permissions: string[];
};

export type Permission = {
  code: string;
  module: string;
  action: string;
  description: string;
};

/** null return means "not permitted to view" (403/other error) — same
 * convention as lib/schools.ts's listOrNull. This whole module is
 * superuser-gated on the backend (IsSuperUser, not RBAC), so a 403 here
 * just means the signed-in user isn't a superuser. */
async function listOrNull<T>(path: string): Promise<T[] | null> {
  const res = await djangoFetch(path);
  if (!res.ok) return null;
  const body: Envelope<Paginated<T>> = await res.json();
  return body.success && body.data ? body.data.results : null;
}

export async function getUsers(): Promise<AdminUser[] | null> {
  return listOrNull<AdminUser>("/api/v1/admin/users?page_size=100");
}

// Wrapped in cache(): the detail page's generateMetadata() and page body
// both call this with the same publicId per request.
export const getUser = cache(async (publicId: string): Promise<AdminUser | null> => {
  const res = await djangoFetch(`/api/v1/admin/users/${publicId}`);
  if (!res.ok) return null;
  const body: Envelope<AdminUser> = await res.json();
  return body.success ? body.data : null;
});

export async function getRoles(): Promise<Role[] | null> {
  return listOrNull<Role>("/api/v1/admin/roles?page_size=100");
}

// Wrapped in cache(): the detail page's generateMetadata() and page body
// both call this with the same publicId per request.
export const getRole = cache(async (publicId: string): Promise<Role | null> => {
  const res = await djangoFetch(`/api/v1/admin/roles/${publicId}`);
  if (!res.ok) return null;
  const body: Envelope<Role> = await res.json();
  return body.success ? body.data : null;
});

export async function getPermissions(): Promise<Permission[] | null> {
  // Unpaginated on the backend (see apps.accounts.admin_views.PermissionListView) —
  // the whole ~250-row catalog is exactly what a permission-picker UI needs at once.
  const res = await djangoFetch("/api/v1/admin/permissions");
  if (!res.ok) return null;
  const body: Envelope<Paginated<Permission>> = await res.json();
  return body.success && body.data ? body.data.results : null;
}
