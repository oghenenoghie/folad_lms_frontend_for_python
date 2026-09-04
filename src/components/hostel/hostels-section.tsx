import Link from "next/link";
import { Building, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { HostelFormDialog } from "@/components/hostel/hostel-form-dialog";
import { getHostels } from "@/lib/hostel";
import { getStaffList } from "@/lib/staff";
import { createHostel } from "@/lib/actions/hostel";
import { hostelDefaults, hostelTypeLabel } from "@/lib/hostel-forms";

export async function HostelsSection({ schoolId }: { schoolId: string }) {
  const [hostels, staff] = await Promise.all([getHostels(schoolId), getStaffList(schoolId)]);
  if (hostels === null) return null;

  const wardenOptions = (staff ?? []).map((s) => ({ value: s.public_id, label: `${s.first_name} ${s.last_name}` }));
  const wardenNameById = new Map(wardenOptions.map((o) => [o.value, o.label]));

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Hostels</CardTitle>
        <HostelFormDialog
          trigger={
            <Button size="sm" variant="secondary">
              <Plus className="h-4 w-4" />
              New hostel
            </Button>
          }
          title="New hostel"
          defaultValues={hostelDefaults}
          wardenOptions={wardenOptions}
          action={createHostel.bind(null, schoolId)}
        />
      </CardHeader>
      <CardContent>
        {hostels.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-8 text-center">
            <Building className="h-6 w-6 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">No hostels yet.</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Warden</TableHead>
                <TableHead className="w-1" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {hostels.map((hostel) => (
                <TableRow key={hostel.public_id}>
                  <TableCell>
                    <Link
                      href={`/hostels/${hostel.public_id}`}
                      className="font-medium text-primary hover:underline"
                    >
                      {hostel.name}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{hostelTypeLabel(hostel.hostel_type)}</Badge>
                  </TableCell>
                  <TableCell>{hostel.warden ? (wardenNameById.get(hostel.warden) ?? "Unknown staff") : "—"}</TableCell>
                  <TableCell className="text-right">
                    <Button asChild variant="ghost" size="icon-sm">
                      <Link href={`/hostels/${hostel.public_id}`}>View</Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
