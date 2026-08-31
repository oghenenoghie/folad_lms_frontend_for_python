import type { TopDefaulter } from "@/lib/dashboard";

export function TopDefaultersList({ defaulters }: { defaulters: TopDefaulter[] }) {
  if (defaulters.length === 0) {
    return <p className="text-sm text-muted-foreground">No overdue invoices.</p>;
  }

  return (
    <div className="flex flex-col gap-3">
      {defaulters.map((entry) => (
        <div
          key={entry.student_public_id}
          className="flex items-center justify-between gap-2 border-b pb-3 text-sm last:border-0 last:pb-0"
        >
          <div className="flex flex-col overflow-hidden">
            <span className="truncate font-medium">{entry.student_name}</span>
            <span className="text-xs text-muted-foreground">{entry.days_overdue} days overdue</span>
          </div>
          <span className="font-semibold text-rose-600 dark:text-rose-400">
            {(entry.outstanding_minor / 100).toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </span>
        </div>
      ))}
    </div>
  );
}
