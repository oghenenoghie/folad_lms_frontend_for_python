import Link from "next/link";
import { GraduationCap } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getStudentsBySchool } from "@/lib/students";
import { enrollmentStatusLabel } from "@/lib/student-forms";

const STATUS_VARIANT: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  active: "default",
  inactive: "secondary",
  graduated: "outline",
  withdrawn: "destructive",
  suspended: "destructive",
};

// A read-only roster on the school's own "profile" page — full student
// CRUD already lives on /students (org-wide, with a School column); this
// is the reverse view, scoped to just this school, so an admin looking at
// one school can see who's enrolled without filtering the global list.
export async function SchoolStudentsSection({ schoolId }: { schoolId: string }) {
  const students = await getStudentsBySchool(schoolId);
  if (students === null) return null;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Students</CardTitle>
        <Button asChild size="sm" variant="secondary">
          <Link href="/students">Manage students</Link>
        </Button>
      </CardHeader>
      <CardContent>
        {students.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-8 text-center">
            <GraduationCap className="h-6 w-6 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">No students enrolled at this school yet</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Admission #</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-1" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {students.map((student) => (
                <TableRow key={student.public_id}>
                  <TableCell>
                    <Link
                      href={`/students/${student.public_id}`}
                      className="flex items-center gap-2 font-medium text-primary hover:underline"
                    >
                      <Avatar size="sm">
                        {student.photo_url && (
                          <AvatarImage src={student.photo_url} alt={`${student.first_name} ${student.last_name}`} />
                        )}
                        <AvatarFallback>
                          {student.first_name.slice(0, 1)}
                          {student.last_name.slice(0, 1)}
                        </AvatarFallback>
                      </Avatar>
                      {student.first_name} {student.last_name}
                    </Link>
                  </TableCell>
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
      </CardContent>
    </Card>
  );
}
