"use client";

import { useRouter } from "next/navigation";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { SelectOption } from "@/components/schools/entity-form-dialog";

export function TimetableClassArmFilter({
  classArmOptions,
  selectedClassArm,
}: {
  classArmOptions: SelectOption[];
  selectedClassArm: string | undefined;
}) {
  const router = useRouter();

  return (
    <Select
      value={selectedClassArm ?? ""}
      onValueChange={(value) => router.push(`/timetable?class_arm=${value}`)}
    >
      <SelectTrigger className="w-56">
        <SelectValue placeholder="Select a class" />
      </SelectTrigger>
      <SelectContent>
        {classArmOptions.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
