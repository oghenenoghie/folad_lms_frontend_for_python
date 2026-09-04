import { Users, Pencil, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  StudentMemberFormDialog,
  StaffMemberFormDialog,
  MemberActiveFormDialog,
} from "@/components/library/member-form-dialogs";
import { DeleteConfirmButton } from "@/components/schools/delete-confirm-button";
import { getLibraryMembersBySchool } from "@/lib/library";
import { getStudentsBySchool } from "@/lib/students";
import { getStaffList } from "@/lib/staff";
import {
  createStudentMember,
  createStaffMember,
  updateMemberActive,
  deleteMember,
} from "@/lib/actions/library";
import { studentMemberDefaults, staffMemberDefaults } from "@/lib/library-forms";

export async function LibraryMembersSection({ schoolId }: { schoolId: string }) {
  const members = await getLibraryMembersBySchool(schoolId);
  if (members === null) return null;

  const [students, staffList] = await Promise.all([getStudentsBySchool(schoolId), getStaffList()]);

  const enrolledStudentIds = new Set(members.filter((m) => m.student).map((m) => m.student));
  const enrolledStaffIds = new Set(members.filter((m) => m.staff).map((m) => m.staff));

  const studentOptions = (students ?? [])
    .filter((s) => !enrolledStudentIds.has(s.public_id))
    .map((s) => ({ value: s.public_id, label: `${s.first_name} ${s.last_name}` }));
  const staffOptions = (staffList ?? [])
    .filter((s) => !enrolledStaffIds.has(s.public_id))
    .map((s) => ({ value: s.public_id, label: `${s.first_name} ${s.last_name}` }));

  const studentNameById = new Map(
    (students ?? []).map((s) => [s.public_id, `${s.first_name} ${s.last_name}`])
  );
  const staffNameById = new Map((staffList ?? []).map((s) => [s.public_id, `${s.first_name} ${s.last_name}`]));

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Library members</CardTitle>
        <div className="flex items-center gap-2">
          {studentOptions.length > 0 && (
            <StudentMemberFormDialog
              trigger={
                <Button size="sm" variant="secondary">
                  <Plus className="h-4 w-4" />
                  New student member
                </Button>
              }
              title="Enroll student as library member"
              defaultValues={studentMemberDefaults}
              studentOptions={studentOptions}
              action={createStudentMember.bind(null, schoolId)}
            />
          )}
          {staffOptions.length > 0 && (
            <StaffMemberFormDialog
              trigger={
                <Button size="sm" variant="secondary">
                  <Plus className="h-4 w-4" />
                  New staff member
                </Button>
              }
              title="Enroll staff as library member"
              defaultValues={staffMemberDefaults}
              staffOptions={staffOptions}
              action={createStaffMember.bind(null, schoolId)}
            />
          )}
        </div>
      </CardHeader>
      <CardContent>
        {members.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-8 text-center">
            <Users className="h-6 w-6 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">No library members yet.</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Member #</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-1" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {members.map((member) => (
                <TableRow key={member.public_id}>
                  <TableCell className="font-mono text-xs">{member.membership_number}</TableCell>
                  <TableCell>
                    {member.member_type === "student"
                      ? (studentNameById.get(member.student ?? "") ?? "Unknown student")
                      : (staffNameById.get(member.staff ?? "") ?? "Unknown staff")}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{member.member_type}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={member.is_active ? "default" : "secondary"}>
                      {member.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell className="flex justify-end gap-1">
                    <MemberActiveFormDialog
                      trigger={
                        <Button variant="ghost" size="icon-sm">
                          <Pencil className="h-4 w-4" />
                        </Button>
                      }
                      title="Edit membership"
                      defaultValues={{ is_active: member.is_active }}
                      action={updateMemberActive.bind(null, schoolId, member.public_id)}
                    />
                    <DeleteConfirmButton
                      description={`Remove membership ${member.membership_number}?`}
                      action={deleteMember.bind(null, schoolId, member.public_id)}
                    />
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
