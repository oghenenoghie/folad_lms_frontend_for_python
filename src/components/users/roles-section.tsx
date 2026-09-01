"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { setUserRoles } from "@/lib/actions/users";
import type { Role } from "@/lib/users";

export function RolesSection({
  userId,
  allRoles,
  assignedRoleNames,
}: {
  userId: string;
  allRoles: Role[];
  assignedRoleNames: string[];
}) {
  const [selected, setSelected] = useState<Set<string>>(new Set(assignedRoleNames));
  const [pending, startTransition] = useTransition();

  function toggle(name: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  }

  function handleSave() {
    startTransition(async () => {
      const result = await setUserRoles(userId, Array.from(selected));
      if (result.success) toast.success(result.message ?? "Roles updated");
      else toast.error(result.message ?? "Could not update roles");
    });
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Roles</CardTitle>
        <Button size="sm" onClick={handleSave} disabled={pending}>
          {pending && <Loader2 className="h-4 w-4 animate-spin" />}
          Save
        </Button>
      </CardHeader>
      <CardContent>
        {allRoles.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No roles defined yet — create one under Roles first.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {allRoles.map((role) => (
              <label
                key={role.name}
                className="flex items-center gap-2 rounded-md border p-2 text-sm"
              >
                <Checkbox checked={selected.has(role.name)} onCheckedChange={() => toggle(role.name)} />
                <span className="flex-1">{role.label}</span>
                {role.is_system && (
                  <Badge variant="outline" className="text-xs">
                    System
                  </Badge>
                )}
              </label>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
