import type { MessageEntry } from "@/lib/dashboard";

export function MessagesList({
  messages,
  unreadCount,
}: {
  messages: MessageEntry[];
  unreadCount: number;
}) {
  if (messages.length === 0) {
    return <p className="text-sm text-muted-foreground">No messages yet.</p>;
  }

  return (
    <div>
      <div className="flex flex-col gap-3">
        {messages.map((message, i) => (
          <div
            key={`${message.sender_email}-${message.created_at}-${i}`}
            className="flex items-start gap-3 border-b pb-3 text-sm last:border-0 last:pb-0"
          >
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#ddf1e1] text-xs font-semibold text-[#104625]">
              {message.sender_name.slice(0, 1).toUpperCase()}
            </span>
            <div className="flex-1 overflow-hidden">
              <div className="flex items-center justify-between gap-2">
                <span className="truncate font-medium">{message.sender_name}</span>
                <span className="shrink-0 text-[10px] text-muted-foreground">
                  {new Date(message.created_at).toLocaleDateString()}
                </span>
              </div>
              <p className="truncate text-xs text-muted-foreground">{message.preview}</p>
            </div>
            {!message.is_read && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[#104625]" />}
          </div>
        ))}
      </div>
      {unreadCount > 0 && <p className="mt-3 text-xs text-muted-foreground">{unreadCount} unread</p>}
    </div>
  );
}
