import { Percent, Pencil, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  PercentageDiscountFormDialog,
  FixedDiscountFormDialog,
} from "@/components/finance/discount-form-dialogs";
import { DeleteConfirmButton } from "@/components/schools/delete-confirm-button";
import { getDiscounts, type Discount } from "@/lib/finance";
import {
  createPercentageDiscount,
  createFixedDiscount,
  updateDiscount,
  deleteDiscount,
} from "@/lib/actions/finance";
import { percentageDiscountDefaults, fixedDiscountDefaults } from "@/lib/finance-forms";

function DiscountValue({ discount }: { discount: Discount }) {
  if (discount.discount_type === "percentage") {
    return <span>{discount.percentage}% off</span>;
  }
  // Discount has no currency_code of its own (see the model) — unlike
  // Payment/Refund/FeeItem, which each denormalize the org's currency, a
  // Discount can apply to lines in any currency, so this shows the raw
  // minor-unit amount rather than guessing a currency symbol.
  return <span>{((discount.fixed_amount_minor ?? 0) / 100).toFixed(2)} off</span>;
}

function EditDiscountButton({ schoolId, discount }: { schoolId: string; discount: Discount }) {
  const trigger = (
    <Button variant="ghost" size="icon-sm">
      <Pencil className="h-4 w-4" />
    </Button>
  );
  const action = updateDiscount.bind(null, schoolId, discount.public_id);

  if (discount.discount_type === "percentage") {
    return (
      <PercentageDiscountFormDialog
        trigger={trigger}
        title="Edit discount"
        defaultValues={{
          name: discount.name,
          percentage: Number(discount.percentage ?? 0),
          is_active: discount.is_active,
        }}
        action={action}
      />
    );
  }
  return (
    <FixedDiscountFormDialog
      trigger={trigger}
      title="Edit discount"
      defaultValues={{
        name: discount.name,
        fixed_amount_minor: discount.fixed_amount_minor ?? 0,
        is_active: discount.is_active,
      }}
      action={action}
    />
  );
}

export async function DiscountsSection({ schoolId }: { schoolId: string }) {
  const discounts = await getDiscounts(schoolId);
  if (discounts === null) return null;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Discounts</CardTitle>
        <div className="flex items-center gap-2">
          <PercentageDiscountFormDialog
            trigger={
              <Button size="sm" variant="secondary">
                <Plus className="h-4 w-4" />
                New percentage discount
              </Button>
            }
            title="New percentage discount"
            defaultValues={percentageDiscountDefaults}
            action={createPercentageDiscount.bind(null, schoolId)}
          />
          <FixedDiscountFormDialog
            trigger={
              <Button size="sm" variant="secondary">
                <Plus className="h-4 w-4" />
                New fixed discount
              </Button>
            }
            title="New fixed discount"
            defaultValues={fixedDiscountDefaults}
            action={createFixedDiscount.bind(null, schoolId)}
          />
        </div>
      </CardHeader>
      <CardContent>
        {discounts.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-8 text-center">
            <Percent className="h-6 w-6 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">No discounts yet.</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Value</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-1" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {discounts.map((discount) => (
                <TableRow key={discount.public_id}>
                  <TableCell>{discount.name}</TableCell>
                  <TableCell>
                    <DiscountValue discount={discount} />
                  </TableCell>
                  <TableCell>
                    <Badge variant={discount.is_active ? "default" : "secondary"}>
                      {discount.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell className="flex justify-end gap-1">
                    <EditDiscountButton schoolId={schoolId} discount={discount} />
                    <DeleteConfirmButton
                      description={`Delete discount ${discount.name}?`}
                      action={deleteDiscount.bind(null, schoolId, discount.public_id)}
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
