import type { Metadata } from "next";
import Link from "next/link";
import { Shield, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { UserCreateFormDialog } from "@/components/users/user-form-dialog";
import { getUsers } from "@/lib/users";
import { createUser } from "@/lib/actions/users";
import { userCreateDefaults } from "@/lib/user-forms";

export const metadata: Metadata = { title: "Users & Roles" };

export default async function UsersPage() {
  const users = await getUsers();

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Users & Roles</h1>
          <p className="text-sm text-muted-foreground">
            Platform accounts and access. Superuser-only —{" "}
            <Link href="/roles" className="text-primary hover:underline">
              manage roles
            </Link>
            .
          </p>
        </div>
        {users !== null && (
          <UserCreateFormDialog
            trigger={
              <Button>
                <Plus className="h-4 w-4" />
                New user
              </Button>
            }
            title="New user"
            defaultValues={userCreateDefaults}
            action={createUser}
          />
        )}
      </div>

      {users === null ? (
        <p className="text-sm text-muted-foreground">
          You don&apos;t have access to Users & Roles — this area is restricted to superusers.
        </p>
      ) : users.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed py-16 text-center">
          <Shield className="h-8 w-8 text-muted-foreground" />
          <p className="font-medium">No users yet</p>
          <p className="text-sm text-muted-foreground">Add the first platform user to get started.</p>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead className="hidden sm:table-cell">Email</TableHead>
              <TableHead className="hidden sm:table-cell">Roles</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-1" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.public_id}>
                <TableCell className="max-w-40 sm:max-w-none">
                  <Link href={`/users/${user.public_id}`} className="font-medium text-primary hover:underline">
                    {user.first_name} {user.last_name}
                  </Link>
                  {/* Email hides as its own column below sm — kept here
                      so it's not lost on a narrow screen. truncate so a
                      long address doesn't force the row wider than the
                      viewport and push Status/View off-screen. */}
                  <p className="truncate text-xs text-muted-foreground sm:hidden">{user.email}</p>
                </TableCell>
                <TableCell className="hidden sm:table-cell">{user.email}</TableCell>
                <TableCell className="hidden sm:table-cell">
                  <div className="flex flex-wrap gap-1">
                    {user.roles.length === 0 ? (
                      <span className="text-muted-foreground">—</span>
                    ) : (
                      user.roles.map((role) => (
                        <Badge key={role} variant="outline">
                          {role}
                        </Badge>
                      ))
                    )}
                    {user.is_superuser && <Badge>Superuser</Badge>}
                  </div>
                </TableCell>
                <TableCell>{user.is_active ? "Active" : "Inactive"}</TableCell>
                <TableCell className="text-right">
                  <Button asChild variant="ghost" size="icon-sm">
                    <Link href={`/users/${user.public_id}`}>View</Link>
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
