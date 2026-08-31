"use client";

import { useState } from "react";
import { Line } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Tooltip } from "chart.js";
import { useTheme } from "next-themes";
import { EDUPORTAL_COLORS } from "@/lib/eduportal-theme";
import type { SeriesPoint } from "@/lib/dashboard";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip);

export function EnrollmentGrowthChart({
  monthly,
  weekly,
}: {
  monthly: SeriesPoint[];
  weekly: SeriesPoint[];
}) {
  const [range, setRange] = useState<"monthly" | "weekly">("monthly");
  const { resolvedTheme } = useTheme();
  const textColor = resolvedTheme === "dark" ? "#94a3b8" : "#64748b";
  const gridColor = resolvedTheme === "dark" ? "#33302a" : "#e2ded0";
  const series = range === "monthly" ? monthly : weekly;

  return (
    <div>
      <div className="mb-3 flex justify-end gap-1 text-xs">
        <button
          type="button"
          onClick={() => setRange("weekly")}
          className={`rounded-md px-2 py-1 font-medium ${
            range === "weekly" ? "bg-[#104625] text-white" : "bg-[#f8f5ea] text-[#615e51] dark:bg-white/5"
          }`}
        >
          Weekly
        </button>
        <button
          type="button"
          onClick={() => setRange("monthly")}
          className={`rounded-md px-2 py-1 font-medium ${
            range === "monthly" ? "bg-[#104625] text-white" : "bg-[#f8f5ea] text-[#615e51] dark:bg-white/5"
          }`}
        >
          Monthly
        </button>
      </div>
      <div className="h-56">
        <Line
          data={{
            labels: series.map((row) => row.label),
            datasets: [
              {
                label: "New students",
                data: series.map((row) => row.count),
                borderColor: EDUPORTAL_COLORS.primary,
                backgroundColor: EDUPORTAL_COLORS.primary,
                tension: 0.4,
                fill: false,
              },
            ],
          }}
          options={{
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
              x: { grid: { display: false }, ticks: { color: textColor, maxRotation: 0, autoSkip: true } },
              y: { grid: { color: gridColor }, ticks: { color: textColor } },
            },
          }}
        />
      </div>
    </div>
  );
}
