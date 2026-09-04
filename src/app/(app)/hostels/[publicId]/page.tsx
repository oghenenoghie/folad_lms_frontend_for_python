import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Pencil } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { HostelFormDialog } from "@/components/hostel/hostel-form-dialog";
import { HostelStructure } from "@/components/hostel/hostel-structure";
import { DeleteConfirmButton } from "@/components/schools/delete-confirm-button";
import { getHostelResult } from "@/lib/hostel";
import { getStaffList } from "@/lib/staff";
import { updateHostel, deleteHostel } from "@/lib/actions/hostel";
import { hostelTypeLabel } from "@/lib/hostel-forms";

export async function generateMetadata({ params }: { params: Promise<{ publicId: string }> }): Promise<Metadata> {
  const { publicId } = await params;
  const result = await getHostelResult(publicId);
  return { title: result.status === "ok" ? result.data.name : "Hostel" };
}

export default async function HostelDetailPage({ params }: { params: Promise<{ publicId: string }> }) {
  const { publicId } = await params;
  const result = await getHostelResult(publicId);
  if (result.status === "forbidden") {
    return (
      <div className="mx-auto max-w-5xl space-y-6 p-6">
        <p className="text-sm text-muted-foreground">You don&apos;t have access to this hostel.</p>
      </div>
    );
  }
  if (result.status === "not_found") notFound();
  const hostel = result.data;

  const staff = await getStaffList(hostel.school);
  const wardenOptions = (staff ?? []).map((s) => ({ value: s.public_id, label: `${s.first_name} ${s.last_name}` }));
  const wardenName = hostel.warden ? wardenOptions.find((o) => o.value === hostel.warden)?.label : null;

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-semibold">{hostel.name}</h1>
          <p className="text-sm text-muted-foreground">
            <Badge variant="secondary">{hostelTypeLabel(hostel.hostel_type)}</Badge>
            {wardenName && <span className="ml-2">Warden: {wardenName}</span>}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <HostelFormDialog
            trigger={
              <Button variant="secondary">
                <Pencil className="h-4 w-4" />
                Edit
              </Button>
            }
            title="Edit hostel"
            defaultValues={{
              name: hostel.name,
              hostel_type: hostel.hostel_type,
              warden: hostel.warden ?? "",
            }}
            wardenOptions={wardenOptions}
            action={updateHostel.bind(null, hostel.school, hostel.public_id)}
          />
          <DeleteConfirmButton
            description={`Delete ${hostel.name}? This cannot be undone.`}
            action={deleteHostel.bind(null, hostel.school, hostel.public_id)}
          />
        </div>
      </div>

      <HostelStructure hostelId={hostel.public_id} />
    </div>
  );
}
