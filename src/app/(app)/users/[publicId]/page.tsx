import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UserEditFormDialog } from "@/components/users/user-form-dialog";
import { DeleteConfirmButton } from "@/components/schools/delete-confirm-button";
import { RolesSection } from "@/components/users/roles-section";
import { getUser, getRoles } from "@/lib/users";
import { updateUser, deleteUser } from "@/lib/actions/users";

export async function generateMetadata({ params }: { params: Promise<{ publicId: string }> }): Promise<Metadata> {
  const { publicId } = await params;
  const user = await getUser(publicId);
  return { title: user ? `${user.first_name} ${user.last_name}` : "User" };
}

export default async function UserDetailPage({ params }: { params: Promise<{ publicId: string }> }) {
  const { publicId } = await params;
  const [user, roles] = await Promise.all([getUser(publicId), getRoles()]);
  if (!user) notFound();

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-semibold">
            {user.first_name} {user.last_name}
          </h1>
          <p className="text-sm text-muted-foreground">{user.email}</p>
        </div>
        <div className="flex items-center gap-2">
          <UserEditFormDialog
            trigger={
              <Button variant="secondary">
                <Pencil className="h-4 w-4" />
                Edit
              </Button>
            }
            title="Edit user"
            defaultValues={{
              email: user.email,
              first_name: user.first_name,
              last_name: user.last_name,
              is_active: user.is_active,
              is_staff: user.is_staff,
              is_superuser: user.is_superuser,
              password: "",
            }}
            action={updateUser.bind(null, user.public_id)}
          />
          <DeleteConfirmButton
            description={`Delete ${user.first_name} ${user.last_name}? This cannot be undone.`}
            action={deleteUser.bind(null, user.public_id)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 rounded-lg border p-4 text-sm sm:grid-cols-3">
        <div>
          <p className="text-muted-foreground">Status</p>
          <p>{user.is_active ? "Active" : "Inactive"}</p>
        </div>
        <div>
          <p className="text-muted-foreground">Django Admin access</p>
          <p>{user.is_staff ? "Yes" : "No"}</p>
        </div>
        <div>
          <p className="text-muted-foreground">Superuser</p>
          <p>{user.is_superuser ? "Yes" : "No"}</p>
        </div>
      </div>

      {roles !== null && <RolesSection userId={user.public_id} allRoles={roles} assignedRoleNames={user.roles} />}
    </div>
  );
}
