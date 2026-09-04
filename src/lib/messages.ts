import "server-only";
import { djangoFetch } from "@/lib/session";
import type { Envelope, Paginated } from "@/lib/api-types";

export type AppMessage = {
  public_id: string;
  sender: string;
  sender_name: string;
  recipient: string;
  recipient_name: string;
  subject: string;
  body: string;
  is_read: boolean;
  read_at: string | null;
  created_at: string;
};

/** Every message the signed-in user sent or received (apps.communication's
 * MessageListCreateView self-scopes to request.user). */
export async function getMessages(): Promise<AppMessage[] | null> {
  const res = await djangoFetch("/api/v1/messages?page_size=100");
  if (!res.ok) return null;
  const body: Envelope<Paginated<AppMessage>> = await res.json();
  return body.success && body.data ? body.data.results : null;
}
