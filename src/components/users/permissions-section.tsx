"use client";

import { useMemo, useState, useTransition } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { setRolePermissions } from "@/lib/actions/roles";
import type { Permission } from "@/lib/users";

export function PermissionsSection({
  roleId,
  isSystem,
  allPermissions,
  assignedCodes,
}: {
  roleId: string;
  isSystem: boolean;
  allPermissions: Permission[];
  assignedCodes: string[];
}) {
  const [selected, setSelected] = useState<Set<string>>(new Set(assignedCodes));
  const [pending, startTransition] = useTransition();

  const byModule = useMemo(() => {
    const groups = new Map<string, Permission[]>();
    for (const permission of allPermissions) {
      const group = groups.get(permission.module) ?? [];
      group.push(permission);
      groups.set(permission.module, group);
    }
    return Array.from(groups.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [allPermissions]);

  function toggle(code: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(code)) next.delete(code);
      else next.add(code);
      return next;
    });
  }

  function toggleModule(modulePermissions: Permission[], checked: boolean) {
    setSelected((prev) => {
      const next = new Set(prev);
      for (const permission of modulePermissions) {
        if (checked) next.add(permission.code);
        else next.delete(permission.code);
      }
      return next;
    });
  }

  function handleSave() {
    startTransition(async () => {
      const result = await setRolePermissions(roleId, Array.from(selected));
      if (result.success) toast.success(result.message ?? "Permissions updated");
      else toast.error(result.message ?? "Could not update permissions");
    });
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Permissions</CardTitle>
        {!isSystem && (
          <Button size="sm" onClick={handleSave} disabled={pending}>
            {pending && <Loader2 className="h-4 w-4 animate-spin" />}
            Save
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {isSystem && (
          <p className="mb-3 text-sm text-muted-foreground">
            System roles ship with the platform and can&apos;t be edited here.
          </p>
        )}
        <div className="grid max-h-[28rem] grid-cols-1 gap-3 overflow-y-auto sm:grid-cols-2 lg:grid-cols-3">
          {byModule.map(([module, permissions]) => {
            const allChecked = permissions.every((permission) => selected.has(permission.code));
            return (
              <div key={module} className="rounded-md border p-3">
                <label className="mb-2 flex items-center gap-2 text-sm font-medium">
                  <Checkbox
                    checked={allChecked}
                    disabled={isSystem}
                    onCheckedChange={(checked) => toggleModule(permissions, checked === true)}
                  />
                  {module}
                </label>
                <div className="space-y-1 pl-1">
                  {permissions.map((permission) => (
                    <label key={permission.code} className="flex items-center gap-2 text-sm">
                      <Checkbox
                        checked={selected.has(permission.code)}
                        disabled={isSystem}
                        onCheckedChange={() => toggle(permission.code)}
                      />
                      {permission.action}
                    </label>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
