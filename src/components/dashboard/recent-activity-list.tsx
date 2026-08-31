import { CheckCircle2, XCircle } from "lucide-react";
import type { RecentActivityEntry } from "@/lib/dashboard";

export function RecentActivityList({ entries }: { entries: RecentActivityEntry[] }) {
  if (entries.length === 0) {
    return <p className="text-sm text-muted-foreground">No sign-in activity yet.</p>;
  }

  return (
    <div className="flex flex-col gap-3">
      {entries.map((entry, i) => (
        <div
          key={`${entry.email}-${entry.created_at}-${i}`}
          className="flex items-center justify-between gap-2 border-b pb-3 text-sm last:border-0 last:pb-0"
        >
          <div className="flex flex-col overflow-hidden">
            <span className="truncate font-medium">{entry.email}</span>
            <span className="text-xs text-muted-foreground">
              {new Date(entry.created_at).toLocaleString()}
            </span>
          </div>
          {entry.success ? (
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
          ) : (
            <XCircle className="h-4 w-4 shrink-0 text-rose-600 dark:text-rose-400" />
          )}
        </div>
      ))}
    </div>
  );
}
