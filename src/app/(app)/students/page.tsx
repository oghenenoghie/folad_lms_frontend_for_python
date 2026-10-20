import type { Metadata } from "next";
import Link from "next/link";
import { GraduationCap, Plus, Upload } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StudentCreateFormDialog } from "@/components/students/student-form-dialog";
import { BulkImportDialog } from "@/components/schools/bulk-import-dialog";
import { getStudents } from "@/lib/students";
import { getSchools } from "@/lib/schools";
import { createStudent, bulkImportStudents } from "@/lib/actions/students";
import { studentCreateDefaults, enrollmentStatusLabel } from "@/lib/student-forms";

export const metadata: Metadata = { title: "Students" };

const STATUS_VARIANT: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  active: "default",
  inactive: "secondary",
  graduated: "outline",
  withdrawn: "destructive",
  suspended: "destructive",
};

export default async function StudentsPage() {
  const [students, schools] = await Promise.all([getStudents(), getSchools()]);
  const schoolNameById = new Map((schools ?? []).map((school) => [school.public_id, school.name]));
  const schoolOptions = (schools ?? []).map((school) => ({ value: school.public_id, label: school.name }));

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Students</h1>
          <p className="text-sm text-muted-foreground">Learners enrolled across your organization&apos;s schools</p>
        </div>
        {students !== null && schoolOptions.length > 0 && (
          <div className="flex items-center gap-2">
            <BulkImportDialog
              trigger={
                <Button variant="secondary">
                  <Upload className="h-4 w-4" />
                  Bulk import
                </Button>
              }
              title="Bulk import students"
              requiredColumns={["school_code", "first_name", "last_name", "date_of_birth"]}
              action={bulkImportStudents}
            />
            <StudentCreateFormDialog
              trigger={
                <Button>
                  <Plus className="h-4 w-4" />
                  New student
                </Button>
              }
              title="New student"
              defaultValues={studentCreateDefaults}
              schoolOptions={schoolOptions}
              action={createStudent}
            />
          </div>
        )}
      </div>

      {students === null ? (
        <p className="text-sm text-muted-foreground">You don&apos;t have access to students.</p>
      ) : students.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed py-16 text-center">
          <GraduationCap className="h-8 w-8 text-muted-foreground" />
          <p className="font-medium">No students yet</p>
          <p className="text-sm text-muted-foreground">
            {schoolOptions.length === 0
              ? "Create a school first, then add students to it."
              : "Add your first student to get started."}
          </p>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>School</TableHead>
              <TableHead>Admission #</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-1" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {students.map((student) => (
              <TableRow key={student.public_id}>
                <TableCell>
                  <Link href={`/students/${student.public_id}`} className="flex items-center gap-2 font-medium text-primary hover:underline">
                    <Avatar size="sm">
                      {student.photo_url && <AvatarImage src={student.photo_url} alt={`${student.first_name} ${student.last_name}`} />}
                      <AvatarFallback>
                        {student.first_name.slice(0, 1)}
                        {student.last_name.slice(0, 1)}
                      </AvatarFallback>
                    </Avatar>
                    {student.first_name} {student.last_name}
                  </Link>
                </TableCell>
                <TableCell>{schoolNameById.get(student.school) ?? "—"}</TableCell>
                <TableCell>{student.admission_number}</TableCell>
                <TableCell>
                  <Badge variant={STATUS_VARIANT[student.enrollment_status] ?? "secondary"}>
                    {enrollmentStatusLabel(student.enrollment_status)}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button asChild variant="ghost" size="icon-sm">
                    <Link href={`/students/${student.public_id}`}>View</Link>
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
