import { Baby, Pencil, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  GuardianStudentLinkCreateFormDialog,
  GuardianStudentLinkEditFormDialog,
} from "@/components/guardians/guardian-student-link-form-dialog";
import { DeleteConfirmButton } from "@/components/schools/delete-confirm-button";
import { getGuardianStudentLinks } from "@/lib/guardians";
import { getStudents } from "@/lib/students";
import { linkGuardianStudent, updateGuardianStudentLink, unlinkGuardianStudent } from "@/lib/actions/guardians";
import { guardianStudentLinkCreateDefaults, relationshipTypeLabel } from "@/lib/guardian-forms";

export async function ChildrenSection({ guardianId }: { guardianId: string }) {
  const [links, students] = await Promise.all([getGuardianStudentLinks(guardianId), getStudents()]);
  if (links === null) return null;

  const studentById = new Map((students ?? []).map((student) => [student.public_id, student]));
  const linkedStudentIds = new Set(links.map((link) => link.student));
  const studentOptions = (students ?? [])
    .filter((student) => !linkedStudentIds.has(student.public_id))
    .map((student) => ({
      value: student.public_id,
      label: `${student.first_name} ${student.last_name} (${student.admission_number})`,
    }));

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Children</CardTitle>
        {studentOptions.length > 0 && (
          <GuardianStudentLinkCreateFormDialog
            trigger={
              <Button size="sm" variant="secondary">
                <Baby className="h-4 w-4" />
                Link a child
              </Button>
            }
            title="Link a child"
            defaultValues={guardianStudentLinkCreateDefaults}
            studentOptions={studentOptions}
            action={linkGuardianStudent.bind(null, guardianId)}
          />
        )}
      </CardHeader>
      <CardContent>
        {links.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-8 text-center">
            <Baby className="h-6 w-6 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">No children linked yet.</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Admission #</TableHead>
                <TableHead>Relationship</TableHead>
                <TableHead className="w-1" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {links.map((link) => {
                const student = studentById.get(link.student);
                return (
                  <TableRow key={link.public_id}>
                    <TableCell>
                      {student ? `${student.first_name} ${student.last_name}` : "Unknown student"}
                    </TableCell>
                    <TableCell>{student?.admission_number ?? "—"}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        {relationshipTypeLabel(link.relationship_type)}
                        {link.is_primary && (
                          <Badge variant="outline" className="gap-1">
                            <Star className="h-3 w-3" />
                            Primary
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="flex justify-end gap-1">
                      <GuardianStudentLinkEditFormDialog
                        trigger={
                          <Button variant="ghost" size="icon-sm">
                            <Pencil className="h-4 w-4" />
                          </Button>
                        }
                        title="Edit relationship"
                        defaultValues={{
                          relationship_type: link.relationship_type as
                            | "father"
                            | "mother"
                            | "guardian"
                            | "sibling"
                            | "other",
                          is_primary: link.is_primary,
                        }}
                        action={updateGuardianStudentLink.bind(null, guardianId, link.public_id)}
                      />
                      <DeleteConfirmButton
                        description={`Unlink ${student ? `${student.first_name} ${student.last_name}` : "this student"}? This cannot be undone.`}
                        action={unlinkGuardianStudent.bind(null, guardianId, link.public_id)}
                      />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
