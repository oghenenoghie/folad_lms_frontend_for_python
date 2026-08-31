import type { AttendanceHeatmap } from "@/lib/dashboard";

function cellTone(value: number | null): string {
  if (value === null) return "text-muted-foreground";
  if (value >= 90) return "bg-[#d0f2d8] text-[#155a30] dark:bg-[#22864a]/20 dark:text-[#4fbf7a]";
  if (value >= 75) return "bg-[#ffe6ca] text-[#8a5410] dark:bg-[#ce871b]/20 dark:text-[#f0b158]";
  return "bg-[#ffe0dc] text-[#8a2524] dark:bg-[#c13c3b]/20 dark:text-[#e37c7b]";
}

export function AttendanceHeatmapTable({ heatmap }: { heatmap: AttendanceHeatmap }) {
  if (heatmap.classes.length === 0) {
    return <p className="text-sm text-muted-foreground">No attendance recorded yet.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr>
            <th className="pb-2 pr-4 text-left font-medium text-muted-foreground">Class</th>
            {heatmap.dates.map((date) => (
              <th key={date} className="px-1 pb-2 text-center font-medium text-muted-foreground">
                {new Date(date).toLocaleDateString(undefined, { weekday: "short" })}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {heatmap.classes.map((row) => (
            <tr key={row.name} className="border-t">
              <td className="py-2 pr-4 font-medium">{row.name}</td>
              {row.values.map((value, i) => (
                <td key={heatmap.dates[i]} className="p-1 text-center">
                  <span
                    className={`inline-flex h-8 w-full items-center justify-center rounded-md text-xs font-semibold ${cellTone(value)}`}
                  >
                    {value !== null ? `${value}%` : "—"}
                  </span>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
