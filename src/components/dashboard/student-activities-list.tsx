import { UploadCloud } from "lucide-react";
import type { StudentActivity } from "@/lib/dashboard";

const STATUS_CLASSES: Record<string, string> = {
  graded: "bg-[#d0f2d8] text-[#155a30]",
  late: "bg-[#ffe0dc] text-[#8a2524]",
  submitted: "bg-[#e2ded0] text-[#615e51]",
};

export function StudentActivitiesList({ activities }: { activities: StudentActivity[] }) {
  if (activities.length === 0) {
    return <p className="text-sm text-muted-foreground">No recent activity.</p>;
  }

  return (
    <div className="flex flex-col gap-3">
      {activities.map((activity, i) => (
        <div
          key={`${activity.title}-${activity.date}-${i}`}
          className="flex items-start gap-3 border-b pb-3 text-sm last:border-0 last:pb-0"
        >
          <UploadCloud className="mt-0.5 h-4 w-4 shrink-0 text-[#104625]" />
          <div className="flex-1 overflow-hidden">
            <p className="truncate font-medium">{activity.title}</p>
            <p className="text-xs text-muted-foreground">{new Date(activity.date).toLocaleString()}</p>
          </div>
          <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${STATUS_CLASSES[activity.status] ?? "bg-[#e2ded0] text-[#615e51]"}`}>
            {activity.status}
          </span>
        </div>
      ))}
    </div>
  );
}
