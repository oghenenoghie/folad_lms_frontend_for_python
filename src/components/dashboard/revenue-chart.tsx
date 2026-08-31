"use client";

import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
} from "chart.js";
import { useTheme } from "next-themes";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip);

export function RevenueChart({ series }: { series: { date: string; amount_minor: number }[] }) {
  const { resolvedTheme } = useTheme();
  const textColor = resolvedTheme === "dark" ? "#94a3b8" : "#64748b";
  const gridColor = resolvedTheme === "dark" ? "#1e293b" : "#f1f5f9";

  const labels = series.map((row) =>
    new Date(row.date).toLocaleDateString(undefined, { day: "numeric", month: "short" })
  );

  return (
    <Bar
      data={{
        labels,
        datasets: [
          {
            label: "Collected",
            data: series.map((row) => row.amount_minor / 100),
            backgroundColor: "#3b82f6",
            borderRadius: 4,
            maxBarThickness: 18,
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
  );
}
