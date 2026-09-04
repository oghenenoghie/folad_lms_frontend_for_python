import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { MessageSquare, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GuardianFormDialog } from "@/components/guardians/guardian-form-dialog";
import { DeleteConfirmButton } from "@/components/schools/delete-confirm-button";
import { ChildrenSection } from "@/components/guardians/children-section";
import { ComposeMessageDialog } from "@/components/messages/compose-message-dialog";
import { getGuardianResult } from "@/lib/guardians";
import { updateGuardian, deleteGuardian } from "@/lib/actions/guardians";

export async function generateMetadata({ params }: { params: Promise<{ publicId: string }> }): Promise<Metadata> {
  const { publicId } = await params;
  const result = await getGuardianResult(publicId);
  return { title: result.status === "ok" ? `${result.data.first_name} ${result.data.last_name}` : "Guardian" };
}

export default async function GuardianDetailPage({ params }: { params: Promise<{ publicId: string }> }) {
  const { publicId } = await params;
  const result = await getGuardianResult(publicId);
  if (result.status === "forbidden") {
    return (
      <div className="mx-auto max-w-5xl space-y-6 p-6">
        <p className="text-sm text-muted-foreground">You don&apos;t have access to this guardian.</p>
      </div>
    );
  }
  if (result.status === "not_found") notFound();
  const guardian = result.data;

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-semibold">
            {guardian.first_name} {guardian.last_name}
          </h1>
          <p className="text-sm text-muted-foreground">{guardian.occupation || "No occupation on file"}</p>
        </div>
        <div className="flex items-center gap-2">
          {guardian.user && (
            <ComposeMessageDialog
              trigger={
                <Button variant="secondary">
                  <MessageSquare className="h-4 w-4" />
                  Message
                </Button>
              }
              recipientPublicId={guardian.user}
              recipientName={`${guardian.first_name} ${guardian.last_name}`}
            />
          )}
          <GuardianFormDialog
            trigger={
              <Button variant="secondary">
                <Pencil className="h-4 w-4" />
                Edit
              </Button>
            }
            title="Edit guardian"
            defaultValues={{
              first_name: guardian.first_name,
              last_name: guardian.last_name,
              phone: guardian.phone,
              email: guardian.email,
              occupation: guardian.occupation,
            }}
            action={updateGuardian.bind(null, guardian.public_id)}
          />
          <DeleteConfirmButton
            description={`Delete ${guardian.first_name} ${guardian.last_name}? This cannot be undone.`}
            action={deleteGuardian.bind(null, guardian.public_id)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 rounded-lg border p-4 text-sm sm:grid-cols-3">
        <div>
          <p className="text-muted-foreground">Phone</p>
          <p>{guardian.phone || "—"}</p>
        </div>
        <div>
          <p className="text-muted-foreground">Email</p>
          <p>{guardian.email || "—"}</p>
        </div>
        <div>
          <p className="text-muted-foreground">Login</p>
          <p>{guardian.user ? "Linked" : "Not yet provisioned"}</p>
        </div>
      </div>

      <ChildrenSection guardianId={guardian.public_id} />
    </div>
  );
}
