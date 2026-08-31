import type { AttendanceHeatmap } from "@/lib/dashboard";

function cellTone(value: number | null): string {
  if (value === null) return "text-muted-foreground";
  if (value >= 90) return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300";
  if (value >= 75) return "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300";
  return "bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300";
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
