import { Receipt, Pencil, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  FeeStructureCreateFormDialog,
  FeeStructureEditFormDialog,
} from "@/components/finance/fee-structure-form-dialog";
import { FeeItemFormDialog } from "@/components/finance/fee-item-form-dialog";
import { DeleteConfirmButton } from "@/components/schools/delete-confirm-button";
import { formatMoney, getFeeStructures, getFeeItems, type FeeStructure, type FeeItem } from "@/lib/finance";
import { getTerms, getAcademicYears } from "@/lib/schools";
import {
  createFeeStructure,
  updateFeeStructure,
  deleteFeeStructure,
  createFeeItem,
  updateFeeItem,
  deleteFeeItem,
} from "@/lib/actions/finance";
import { feeStructureCreateDefaults, feeItemDefaults } from "@/lib/finance-forms";

function FeeItemRow({ schoolId, item }: { schoolId: string; item: FeeItem }) {
  return (
    <div className="flex items-center justify-between rounded-md bg-muted/50 px-3 py-1.5 text-sm">
      <span className="flex items-center gap-2">
        {item.name} — {formatMoney(item.amount_minor, item.currency_code)}
        {!item.is_mandatory && <Badge variant="outline">Optional</Badge>}
      </span>
      <div className="flex items-center gap-1">
        <FeeItemFormDialog
          trigger={
            <Button variant="ghost" size="icon-sm">
              <Pencil className="h-3.5 w-3.5" />
            </Button>
          }
          title="Edit fee item"
          defaultValues={{
            name: item.name,
            amount_minor: item.amount_minor,
            is_mandatory: item.is_mandatory,
          }}
          action={updateFeeItem.bind(null, schoolId, item.public_id)}
        />
        <DeleteConfirmButton
          description={`Delete fee item ${item.name}?`}
          action={deleteFeeItem.bind(null, schoolId, item.public_id)}
        />
      </div>
    </div>
  );
}

async function FeeStructureCard({ schoolId, structure }: { schoolId: string; structure: FeeStructure }) {
  const items = await getFeeItems(structure.public_id);

  return (
    <div className="rounded-lg border">
      <div className="flex items-center justify-between gap-3 border-b px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="font-medium">{structure.name}</span>
          {!structure.is_active && <Badge variant="secondary">Inactive</Badge>}
        </div>
        <div className="flex items-center gap-1">
          <FeeStructureEditFormDialog
            trigger={
              <Button variant="ghost" size="icon-sm">
                <Pencil className="h-4 w-4" />
              </Button>
            }
            title="Edit fee structure"
            defaultValues={{ name: structure.name, is_active: structure.is_active }}
            action={updateFeeStructure.bind(null, schoolId, structure.public_id)}
          />
          <DeleteConfirmButton
            description={`Delete fee structure ${structure.name}? Its fee items go with it.`}
            action={deleteFeeStructure.bind(null, schoolId, structure.public_id)}
          />
        </div>
      </div>

      {items !== null && (
        <div className="px-4 py-3">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Fee items</p>
            <FeeItemFormDialog
              trigger={
                <button type="button" className="text-xs font-medium text-primary hover:underline">
                  + Add fee item
                </button>
              }
              title="New fee item"
              defaultValues={feeItemDefaults}
              action={createFeeItem.bind(null, schoolId, structure.public_id)}
            />
          </div>
          {items.length === 0 ? (
            <p className="text-sm text-muted-foreground">No fee items yet.</p>
          ) : (
            <div className="space-y-1.5">
              {items.map((item) => (
                <FeeItemRow key={item.public_id} schoolId={schoolId} item={item} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

async function getTermOptions() {
  const [terms, academicYears] = await Promise.all([getTerms(), getAcademicYears()]);
  if (!terms || !academicYears) return [];

  const yearNameById = new Map(academicYears.map((y) => [y.public_id, y.name]));
  return terms.map((term) => ({
    value: term.public_id,
    label: `${yearNameById.get(term.academic_year) ?? "Unknown year"} — ${term.name}`,
  }));
}

export async function FeeStructuresSection({ schoolId }: { schoolId: string }) {
  const [structures, termOptions] = await Promise.all([getFeeStructures(), getTermOptions()]);
  if (structures === null) return null;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Fee structures</CardTitle>
        {termOptions.length > 0 && (
          <FeeStructureCreateFormDialog
            trigger={
              <Button size="sm" variant="secondary">
                <Plus className="h-4 w-4" />
                New fee structure
              </Button>
            }
            title="New fee structure"
            defaultValues={feeStructureCreateDefaults}
            termOptions={termOptions}
            action={createFeeStructure.bind(null, schoolId)}
          />
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {structures.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-8 text-center">
            <Receipt className="h-6 w-6 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              {termOptions.length === 0
                ? "Create an academic year and term first, then set up fee structures."
                : "No fee structures yet."}
            </p>
          </div>
        ) : (
          structures.map((structure) => (
            <FeeStructureCard key={structure.public_id} schoolId={schoolId} structure={structure} />
          ))
        )}
      </CardContent>
    </Card>
  );
}
