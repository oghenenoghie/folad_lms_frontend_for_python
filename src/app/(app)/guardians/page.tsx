import type { Metadata } from "next";
import Link from "next/link";
import { HeartHandshake, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { GuardianFormDialog } from "@/components/guardians/guardian-form-dialog";
import { getGuardians } from "@/lib/guardians";
import { createGuardian } from "@/lib/actions/guardians";
import { guardianDefaults } from "@/lib/guardian-forms";

export const metadata: Metadata = { title: "Parents & Guardians" };

export default async function GuardiansPage() {
  const guardians = await getGuardians();

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Parents & Guardians</h1>
          <p className="text-sm text-muted-foreground">Guardians linked to your organization&apos;s students</p>
        </div>
        {guardians !== null && (
          <GuardianFormDialog
            trigger={
              <Button>
                <Plus className="h-4 w-4" />
                New guardian
              </Button>
            }
            title="New guardian"
            defaultValues={guardianDefaults}
            action={createGuardian}
          />
        )}
      </div>

      {guardians === null ? (
        <p className="text-sm text-muted-foreground">You don&apos;t have access to guardians.</p>
      ) : guardians.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed py-16 text-center">
          <HeartHandshake className="h-8 w-8 text-muted-foreground" />
          <p className="font-medium">No guardians yet</p>
          <p className="text-sm text-muted-foreground">Add your first parent or guardian to get started.</p>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Occupation</TableHead>
              <TableHead className="w-1" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {guardians.map((guardian) => (
              <TableRow key={guardian.public_id}>
                <TableCell>
                  <Link href={`/guardians/${guardian.public_id}`} className="font-medium text-primary hover:underline">
                    {guardian.first_name} {guardian.last_name}
                  </Link>
                </TableCell>
                <TableCell>{guardian.phone || "—"}</TableCell>
                <TableCell>{guardian.email || "—"}</TableCell>
                <TableCell>{guardian.occupation || "—"}</TableCell>
                <TableCell className="text-right">
                  <Button asChild variant="ghost" size="icon-sm">
                    <Link href={`/guardians/${guardian.public_id}`}>View</Link>
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
