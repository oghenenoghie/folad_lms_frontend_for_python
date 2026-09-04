import { BookOpen, Pencil, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { SubjectFormDialog } from "@/components/academics/subject-form-dialog";
import { DeleteConfirmButton } from "@/components/schools/delete-confirm-button";
import { getSubjects } from "@/lib/academics";
import { createSubject, updateSubject, deleteSubject } from "@/lib/actions/academics";
import { subjectDefaults } from "@/lib/academics-forms";

export async function SubjectsSection({ schoolId }: { schoolId: string }) {
  const subjects = await getSubjects(schoolId);
  if (subjects === null) return null;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Subjects</CardTitle>
        <SubjectFormDialog
          trigger={
            <Button size="sm" variant="secondary">
              <Plus className="h-4 w-4" />
              New subject
            </Button>
          }
          title="New subject"
          defaultValues={subjectDefaults}
          action={createSubject.bind(null, schoolId)}
        />
      </CardHeader>
      <CardContent>
        {subjects.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-8 text-center">
            <BookOpen className="h-6 w-6 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">No subjects yet</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Code</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-1" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {subjects.map((subject) => (
                <TableRow key={subject.public_id}>
                  <TableCell>{subject.name}</TableCell>
                  <TableCell>{subject.code}</TableCell>
                  <TableCell>
                    <Badge variant={subject.is_active ? "default" : "secondary"}>
                      {subject.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell className="flex justify-end gap-1">
                    <SubjectFormDialog
                      trigger={
                        <Button variant="ghost" size="icon-sm">
                          <Pencil className="h-4 w-4" />
                        </Button>
                      }
                      title="Edit subject"
                      defaultValues={{ name: subject.name, code: subject.code, is_active: subject.is_active }}
                      action={updateSubject.bind(null, schoolId, subject.public_id)}
                    />
                    <DeleteConfirmButton
                      description={`Delete subject ${subject.name}?`}
                      action={deleteSubject.bind(null, schoolId, subject.public_id)}
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
