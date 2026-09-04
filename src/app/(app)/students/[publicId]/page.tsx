import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Pencil } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StudentEditFormDialog } from "@/components/students/student-form-dialog";
import { DeleteConfirmButton } from "@/components/schools/delete-confirm-button";
import { EnrollmentSection } from "@/components/academics/enrollment-section";
import { ScholarshipsSection } from "@/components/finance/scholarships-section";
import { getStudentResult } from "@/lib/students";
import { getSchool } from "@/lib/schools";
import { updateStudent, deleteStudent } from "@/lib/actions/students";
import { enrollmentStatusLabel, genderLabel, NO_GENDER } from "@/lib/student-forms";

const STATUS_VARIANT: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  active: "default",
  inactive: "secondary",
  graduated: "outline",
  withdrawn: "destructive",
  suspended: "destructive",
};

export async function generateMetadata({ params }: { params: Promise<{ publicId: string }> }): Promise<Metadata> {
  const { publicId } = await params;
  const result = await getStudentResult(publicId);
  return { title: result.status === "ok" ? `${result.data.first_name} ${result.data.last_name}` : "Student" };
}

export default async function StudentDetailPage({ params }: { params: Promise<{ publicId: string }> }) {
  const { publicId } = await params;
  const result = await getStudentResult(publicId);
  if (result.status === "forbidden") {
    return (
      <div className="mx-auto max-w-5xl space-y-6 p-6">
        <p className="text-sm text-muted-foreground">You don&apos;t have access to this student.</p>
      </div>
    );
  }
  if (result.status === "not_found") notFound();
  const student = result.data;

  const school = await getSchool(student.school);

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-6">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <Avatar size="lg">
            {student.photo_url && <AvatarImage src={student.photo_url} alt={`${student.first_name} ${student.last_name}`} />}
            <AvatarFallback>
              {student.first_name.slice(0, 1)}
              {student.last_name.slice(0, 1)}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-xl font-semibold">
              {student.first_name} {student.last_name}
            </h1>
            <p className="text-sm text-muted-foreground">
              {student.admission_number} · {school?.name ?? "Unknown school"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <StudentEditFormDialog
            trigger={
              <Button variant="secondary">
                <Pencil className="h-4 w-4" />
                Edit
              </Button>
            }
            title="Edit student"
            defaultValues={{
              admission_number: student.admission_number,
              first_name: student.first_name,
              last_name: student.last_name,
              email: student.email,
              date_of_birth: student.date_of_birth,
              gender: student.gender || NO_GENDER,
              enrollment_status: student.enrollment_status as
                | "active"
                | "inactive"
                | "graduated"
                | "withdrawn"
                | "suspended",
            }}
            action={updateStudent.bind(null, student.public_id)}
          />
          <DeleteConfirmButton
            description={`Delete ${student.first_name} ${student.last_name}? This cannot be undone.`}
            action={deleteStudent.bind(null, student.public_id)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 rounded-lg border p-4 text-sm sm:grid-cols-4">
        <div>
          <p className="text-muted-foreground">Date of birth</p>
          <p>{student.date_of_birth}</p>
        </div>
        <div>
          <p className="text-muted-foreground">Gender</p>
          <p>{genderLabel(student.gender)}</p>
        </div>
        <div>
          <p className="text-muted-foreground">Status</p>
          <Badge variant={STATUS_VARIANT[student.enrollment_status] ?? "secondary"}>
            {enrollmentStatusLabel(student.enrollment_status)}
          </Badge>
        </div>
        <div>
          <p className="text-muted-foreground">Login</p>
          {/* `email` is blank whenever a login was auto-provisioned with a
              synthetic placeholder address (see student_service.py) — that
              address lives on the linked User, not this Student record, and
              there's no /api/v1/users/{id} endpoint to look it up from here. */}
          <p>{student.user ? student.email || "Provisioned (system-generated address)" : "Not yet provisioned"}</p>
        </div>
      </div>

      <EnrollmentSection studentId={student.public_id} schoolId={student.school} />
      <ScholarshipsSection studentId={student.public_id} schoolId={student.school} />
    </div>
  );
}
