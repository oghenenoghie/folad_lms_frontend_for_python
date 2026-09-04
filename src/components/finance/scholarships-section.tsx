import { Award, Pencil, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  ScholarshipFormDialog,
  ScholarshipActiveFormDialog,
} from "@/components/finance/scholarship-form-dialogs";
import { DeleteConfirmButton } from "@/components/schools/delete-confirm-button";
import { getScholarshipsForStudent, getDiscounts } from "@/lib/finance";
import { getAcademicYears } from "@/lib/schools";
import { createScholarship, updateScholarshipActive, revokeScholarship } from "@/lib/actions/finance";
import { scholarshipDefaults } from "@/lib/finance-forms";

export async function ScholarshipsSection({
  studentId,
  schoolId,
}: {
  studentId: string;
  schoolId: string;
}) {
  const scholarships = await getScholarshipsForStudent(studentId);
  if (scholarships === null) return null;

  const [discounts, academicYears] = await Promise.all([getDiscounts(schoolId), getAcademicYears(schoolId)]);
  const discountOptions = (discounts ?? []).map((d) => ({ value: d.public_id, label: d.name }));
  const academicYearOptions = (academicYears ?? []).map((y) => ({ value: y.public_id, label: y.name }));
  const discountNameById = new Map(discountOptions.map((o) => [o.value, o.label]));
  const yearNameById = new Map(academicYearOptions.map((o) => [o.value, o.label]));

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Scholarships</CardTitle>
        {discountOptions.length > 0 && academicYearOptions.length > 0 && (
          <ScholarshipFormDialog
            trigger={
              <Button size="sm" variant="secondary">
                <Plus className="h-4 w-4" />
                Award scholarship
              </Button>
            }
            title="Award a scholarship"
            defaultValues={scholarshipDefaults}
            discountOptions={discountOptions}
            academicYearOptions={academicYearOptions}
            action={createScholarship.bind(null, studentId)}
          />
        )}
      </CardHeader>
      <CardContent>
        {scholarships.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-8 text-center">
            <Award className="h-6 w-6 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              {discountOptions.length === 0
                ? "Set up a discount for this school first, then award a scholarship."
                : "No scholarships awarded yet."}
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Discount</TableHead>
                <TableHead>Academic year</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-1" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {scholarships.map((scholarship) => (
                <TableRow key={scholarship.public_id}>
                  <TableCell>{discountNameById.get(scholarship.discount) ?? "Unknown discount"}</TableCell>
                  <TableCell>{yearNameById.get(scholarship.academic_year) ?? "Unknown year"}</TableCell>
                  <TableCell>
                    <Badge variant={scholarship.is_active ? "default" : "secondary"}>
                      {scholarship.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell className="flex justify-end gap-1">
                    <ScholarshipActiveFormDialog
                      trigger={
                        <Button variant="ghost" size="icon-sm">
                          <Pencil className="h-4 w-4" />
                        </Button>
                      }
                      title="Edit scholarship"
                      defaultValues={{ is_active: scholarship.is_active }}
                      action={updateScholarshipActive.bind(null, studentId, scholarship.public_id)}
                    />
                    <DeleteConfirmButton
                      description="Revoke this scholarship? This cannot be undone."
                      action={revokeScholarship.bind(null, studentId, scholarship.public_id)}
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
