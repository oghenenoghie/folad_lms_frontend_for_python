import type { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const TONE_CLASSES = {
  emerald: "bg-emerald-100 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400",
  blue: "bg-blue-100 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400",
  violet: "bg-violet-100 text-violet-600 dark:bg-violet-500/10 dark:text-violet-400",
  amber: "bg-amber-100 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400",
} as const;

export type StatTone = keyof typeof TONE_CLASSES;

export function AdminStatCard({
  label,
  value,
  icon: Icon,
  tone,
}: {
  label: string;
  value: string;
  icon: LucideIcon;
  tone: StatTone;
}) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4">
        <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${TONE_CLASSES[tone]}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-2xl font-semibold leading-none">{value}</p>
          <p className="mt-1 text-sm text-muted-foreground">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}
