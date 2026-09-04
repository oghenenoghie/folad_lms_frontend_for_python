import type { Metadata } from "next";
import { MessageSquare } from "lucide-react";
import { MessageRow } from "@/components/messages/message-row";
import { getMessages } from "@/lib/messages";
import { getCurrentUser } from "@/lib/session";

export const metadata: Metadata = { title: "Messages" };

// No "compose new" button here — there's no org-wide directory a non-
// admin account can browse to pick a recipient (see MessageSerializer's
// sender_name/recipient_name comment). Starting a conversation happens
// from that person's own detail page (Guardian/Staff/Student "Message"
// button); this inbox is for reading and replying to what's already
// there.
export default async function MessagesPage() {
  const [messages, user] = await Promise.all([getMessages(), getCurrentUser()]);
  const unreadCount = (messages ?? []).filter((m) => !m.is_read && m.recipient === user?.public_id).length;

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-6">
      <div>
        <h1 className="text-xl font-semibold">Messages</h1>
        <p className="text-sm text-muted-foreground">
          {unreadCount > 0 ? `${unreadCount} unread` : "You're all caught up"}
        </p>
      </div>

      {messages === null || user === null ? (
        <p className="text-sm text-muted-foreground">Could not load messages.</p>
      ) : messages.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed py-16 text-center">
          <MessageSquare className="h-8 w-8 text-muted-foreground" />
          <p className="font-medium">No messages yet</p>
          <p className="text-sm text-muted-foreground">
            Send one from a student, staff, or guardian&apos;s profile page.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {messages.map((message) => (
            <MessageRow key={message.public_id} message={message} currentUserPublicId={user.public_id} />
          ))}
        </div>
      )}
    </div>
  );
}
