import type { Metadata } from "next";
import Link from "next/link";
import { Shield, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { RoleFormDialog } from "@/components/users/role-form-dialog";
import { getRoles } from "@/lib/users";
import { createRole } from "@/lib/actions/roles";
import { roleDefaults } from "@/lib/user-forms";

export const metadata: Metadata = { title: "Roles" };

export default async function RolesPage() {
  const roles = await getRoles();

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Roles</h1>
          <p className="text-sm text-muted-foreground">
            Permission bundles assignable to users. Superuser-only —{" "}
            <Link href="/users" className="text-primary hover:underline">
              manage users
            </Link>
            .
          </p>
        </div>
        {roles !== null && (
          <RoleFormDialog
            trigger={
              <Button>
                <Plus className="h-4 w-4" />
                New role
              </Button>
            }
            title="New role"
            defaultValues={roleDefaults}
            action={createRole}
          />
        )}
      </div>

      {roles === null ? (
        <p className="text-sm text-muted-foreground">
          You don&apos;t have access to Roles — this area is restricted to superusers.
        </p>
      ) : roles.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed py-16 text-center">
          <Shield className="h-8 w-8 text-muted-foreground" />
          <p className="font-medium">No roles yet</p>
          <p className="text-sm text-muted-foreground">Create your first custom role to get started.</p>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Label</TableHead>
              <TableHead className="hidden sm:table-cell">Name</TableHead>
              <TableHead className="hidden sm:table-cell">Permissions</TableHead>
              <TableHead className="hidden sm:table-cell">Type</TableHead>
              <TableHead className="w-1" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {roles.map((role) => (
              <TableRow key={role.public_id}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Link href={`/roles/${role.public_id}`} className="font-medium text-primary hover:underline">
                      {role.label}
                    </Link>
                    {/* Type hides as its own column below sm — shown
                        inline here instead so it's not lost. */}
                    <span className="sm:hidden">
                      {role.is_system ? <Badge variant="outline">System</Badge> : <Badge variant="secondary">Custom</Badge>}
                    </span>
                  </div>
                  {/* Name/permission count hide as their own columns below
                      sm — kept here so they're not lost on a narrow screen. */}
                  <p className="font-mono text-xs text-muted-foreground sm:hidden">
                    {role.name} · {role.permissions.length} permission{role.permissions.length === 1 ? "" : "s"}
                  </p>
                </TableCell>
                <TableCell className="hidden font-mono text-xs sm:table-cell">{role.name}</TableCell>
                <TableCell className="hidden sm:table-cell">{role.permissions.length}</TableCell>
                <TableCell className="hidden sm:table-cell">
                  {role.is_system ? <Badge variant="outline">System</Badge> : <Badge variant="secondary">Custom</Badge>}
                </TableCell>
                <TableCell className="text-right">
                  <Button asChild variant="ghost" size="icon-sm">
                    <Link href={`/roles/${role.public_id}`}>View</Link>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
