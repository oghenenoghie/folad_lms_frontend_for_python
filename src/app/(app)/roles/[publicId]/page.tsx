import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Pencil } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RoleFormDialog } from "@/components/users/role-form-dialog";
import { DeleteConfirmButton } from "@/components/schools/delete-confirm-button";
import { PermissionsSection } from "@/components/users/permissions-section";
import { getRole, getPermissions } from "@/lib/users";
import { updateRole, deleteRole } from "@/lib/actions/roles";

export async function generateMetadata({ params }: { params: Promise<{ publicId: string }> }): Promise<Metadata> {
  const { publicId } = await params;
  const role = await getRole(publicId);
  return { title: role?.label ?? "Role" };
}

export default async function RoleDetailPage({ params }: { params: Promise<{ publicId: string }> }) {
  const { publicId } = await params;
  const [role, permissions] = await Promise.all([getRole(publicId), getPermissions()]);
  if (!role) notFound();

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-6">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-semibold">{role.label}</h1>
            {role.is_system ? <Badge variant="outline">System</Badge> : <Badge variant="secondary">Custom</Badge>}
          </div>
          <p className="font-mono text-sm text-muted-foreground">{role.name}</p>
        </div>
        {!role.is_system && (
          <div className="flex items-center gap-2">
            <RoleFormDialog
              trigger={
                <Button variant="secondary">
                  <Pencil className="h-4 w-4" />
                  Edit
                </Button>
              }
              title="Edit role"
              defaultValues={{ name: role.name, label: role.label }}
              action={updateRole.bind(null, role.public_id)}
            />
            <DeleteConfirmButton
              description={`Delete "${role.label}"? Users holding this role will lose it. This cannot be undone.`}
              action={deleteRole.bind(null, role.public_id)}
            />
          </div>
        )}
      </div>

      {permissions !== null && (
        <PermissionsSection
          roleId={role.public_id}
          isSystem={role.is_system}
          allPermissions={permissions}
          assignedCodes={role.permissions}
        />
      )}
    </div>
  );
}
