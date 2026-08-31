"use client";

import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip } from "chart.js";
import { useTheme } from "next-themes";
import { EDUPORTAL_COLORS } from "@/lib/eduportal-theme";
import type { GenderBreakdown } from "@/lib/dashboard";

ChartJS.register(ArcElement, Tooltip);

const SEGMENTS: { key: keyof GenderBreakdown; label: string; color: string }[] = [
  { key: "male", label: "Male", color: EDUPORTAL_COLORS.primary },
  { key: "female", label: "Female", color: EDUPORTAL_COLORS.accent },
  { key: "other", label: "Other", color: EDUPORTAL_COLORS.warn },
  { key: "unspecified", label: "Unspecified", color: EDUPORTAL_COLORS.border },
];

export function StudentDistributionChart({ breakdown }: { breakdown: GenderBreakdown }) {
  const { resolvedTheme } = useTheme();
  const textColor = resolvedTheme === "dark" ? EDUPORTAL_COLORS.bg : EDUPORTAL_COLORS.ink;
  const total = Object.values(breakdown).reduce((sum, n) => sum + n, 0);
  const segments = SEGMENTS.filter((s) => breakdown[s.key] > 0);

  return (
    <div className="flex items-center gap-6">
      <div className="relative h-40 w-40 shrink-0">
        <Doughnut
          data={{
            labels: segments.map((s) => s.label),
            datasets: [
              {
                data: segments.map((s) => breakdown[s.key]),
                backgroundColor: segments.map((s) => s.color),
                borderWidth: 0,
              },
            ],
          }}
          options={{ maintainAspectRatio: false, cutout: "70%", plugins: { legend: { display: false } } }}
        />
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-semibold" style={{ color: textColor }}>
            {total}
          </span>
          <span className="text-[10px] opacity-60">Total</span>
        </div>
      </div>
      <div className="flex flex-col gap-2 text-sm">
        {SEGMENTS.map((s) => (
          <div key={s.key} className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: s.color }} />
            {s.label}: <span className="font-semibold">{breakdown[s.key]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
