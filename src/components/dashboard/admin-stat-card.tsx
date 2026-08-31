import type { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

// Palette mirrored from https://hr-payroll-wagebook.vercel.app/ — "warn"
// (warm amber/terracotta tint) for the everyday stats, "primary" (strong
// forest green) for the one card meant to stand out, matching the
// Unfold dashboard's "3 warm accent + 1 strong accent" KPI row.
const TONE_CLASSES = {
  warn: "bg-[#ffe6ca] text-[#8a5410] dark:bg-[#ce871b]/15 dark:text-[#f0b158]",
  primary: "bg-[#104625] text-white",
  accent: "bg-[#ffe1cd] text-[#8a4a1f] dark:bg-[#bd7138]/15 dark:text-[#e0985c]",
  good: "bg-[#d0f2d8] text-[#155a30] dark:bg-[#22864a]/15 dark:text-[#4fbf7a]",
} as const;

const ICON_BADGE_CLASSES = {
  warn: "bg-[#ce871b]/20 text-[#8a5410] dark:text-[#f0b158]",
  primary: "bg-white/15 text-white",
  accent: "bg-[#bd7138]/20 text-[#8a4a1f] dark:text-[#e0985c]",
  good: "bg-[#22864a]/20 text-[#155a30] dark:text-[#4fbf7a]",
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
    <Card className={`border-[#e2ded0] ${TONE_CLASSES[tone]}`}>
      <CardContent className="flex items-center gap-4">
        <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${ICON_BADGE_CLASSES[tone]}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-2xl font-semibold leading-none">{value}</p>
          <p className={`mt-1 text-sm ${tone === "primary" ? "text-white/80" : "opacity-70"}`}>{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}
