import type { ActivityEntry } from "@/lib/dashboard";

export function RecentActivityList({ entries }: { entries: ActivityEntry[] }) {
  if (entries.length === 0) {
    return <p className="text-sm text-muted-foreground">No recent activity.</p>;
  }

  return (
    <div className="flex flex-col gap-3">
      {entries.map((entry, i) => (
        <div
          key={`${entry.title}-${entry.created_at}-${i}`}
          className="flex items-start gap-2 border-b pb-3 text-sm last:border-0 last:pb-0"
        >
          <span
            className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${entry.is_read ? "bg-[#e2ded0]" : "bg-[#104625]"}`}
          />
          <div className="overflow-hidden">
            <p className="truncate font-medium">{entry.title}</p>
            <p className="text-xs text-muted-foreground">{new Date(entry.created_at).toLocaleString()}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
