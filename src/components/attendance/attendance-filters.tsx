"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { SelectOption } from "@/components/schools/entity-form-dialog";

export function AttendanceFilters({
  classLevelOptions,
  selectedClassLevel,
  selectedDate,
}: {
  classLevelOptions: SelectOption[];
  selectedClassLevel: string | undefined;
  selectedDate: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    router.push(`/attendance?${params.toString()}`);
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <Select value={selectedClassLevel ?? ""} onValueChange={(value) => updateParam("class_level", value)}>
        <SelectTrigger className="w-48">
          <SelectValue placeholder="Select class" />
        </SelectTrigger>
        <SelectContent>
          {classLevelOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Input
        type="date"
        value={selectedDate}
        onChange={(event) => updateParam("date", event.target.value)}
        className="w-40"
      />
    </div>
  );
}
