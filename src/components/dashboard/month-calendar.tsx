import type { MonthCalendar, Notice } from "@/lib/dashboard";

function dayClasses(day: { in_month: boolean; is_today: boolean; events: string[] }): string {
  if (day.is_today) return "bg-[#104625] text-white font-semibold";
  if (!day.in_month) return "text-[#cbc7b8]";
  if (day.events.length > 0) return "bg-[#ffe6ca] font-medium text-[#8a5410]";
  return "text-[#1d1b10] dark:text-[#e2ded0]";
}

export function MonthCalendarCard({ calendar, notices }: { calendar: MonthCalendar; notices: Notice[] }) {
  return (
    <div>
      <p className="mb-3 text-sm font-semibold">{calendar.month_label}</p>
      <table className="w-full text-center text-xs">
        <thead>
          <tr>
            {calendar.weekday_labels.map((label) => (
              <th key={label} className="pb-1 font-medium text-muted-foreground">
                {label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {calendar.weeks.map((week, wi) => (
            <tr key={wi}>
              {week.map((day) => (
                <td key={day.date} className="p-0.5" title={day.events.join("; ") || undefined}>
                  <div className={`mx-auto flex h-7 w-7 items-center justify-center rounded-md ${dayClasses(day)}`}>
                    {new Date(day.date).getDate()}
                  </div>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      {notices.length > 0 && (
        <div className="mt-4 border-t pt-3">
          <p className="mb-2 text-xs font-semibold text-muted-foreground">Notices</p>
          <div className="flex flex-col gap-2">
            {notices.slice(0, 3).map((notice, i) => (
              <div key={`${notice.title}-${i}`} className="text-left text-xs">
                <p className="truncate font-medium">{notice.title}</p>
                <p className="text-muted-foreground">
                  {new Date(notice.published_at ?? notice.created_at).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
