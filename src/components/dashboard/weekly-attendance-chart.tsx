"use client";

import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip } from "chart.js";
import { useTheme } from "next-themes";
import { EDUPORTAL_COLORS } from "@/lib/eduportal-theme";
import type { WeeklyAttendance } from "@/lib/dashboard";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip);

export function WeeklyAttendanceChart({ attendance }: { attendance: WeeklyAttendance }) {
  const { resolvedTheme } = useTheme();
  const textColor = resolvedTheme === "dark" ? "#94a3b8" : "#64748b";

  return (
    <div>
      <div className="mb-3 flex gap-4 text-sm">
        <div>
          <span className="font-semibold" style={{ color: EDUPORTAL_COLORS.good }}>
            {attendance.present_pct !== null ? `${attendance.present_pct}%` : "—"}
          </span>{" "}
          Present
        </div>
        <div>
          <span className="font-semibold" style={{ color: EDUPORTAL_COLORS.warn }}>
            {attendance.absent_pct !== null ? `${attendance.absent_pct}%` : "—"}
          </span>{" "}
          Absent
        </div>
      </div>
      <div className="h-48">
        <Bar
          data={{
            labels: attendance.days.map((d) => d.label),
            datasets: [
              {
                label: "Present %",
                data: attendance.days.map((d) => d.present_pct),
                backgroundColor: EDUPORTAL_COLORS.primary,
                borderRadius: 4,
              },
              {
                label: "Absent %",
                data: attendance.days.map((d) => d.absent_pct),
                backgroundColor: EDUPORTAL_COLORS.accent,
                borderRadius: 4,
              },
            ],
          }}
          options={{
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
              x: { grid: { display: false }, ticks: { color: textColor } },
              y: { grid: { display: false }, ticks: { color: textColor } },
            },
          }}
        />
      </div>
    </div>
  );
}
