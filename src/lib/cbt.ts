import "server-only";
import { djangoFetch } from "@/lib/session";
import type { DetailResult, Envelope, Paginated } from "@/lib/api-types";
import type { CBTAttemptPayload, CBTMyCandidate } from "@/lib/cbt-types";

export * from "@/lib/cbt-types";

/** Every CBT candidate the signed-in student has — the backend already
 * scopes this to "my own" (see apps.cbt.views.MyCandidateListView), so
 * there's no student_id filter to pass here. */
export async function getMyCandidates(): Promise<CBTMyCandidate[] | null> {
  const res = await djangoFetch("/api/v1/cbt/my/candidates?page_size=100");
  if (!res.ok) return null;
  const body: Envelope<Paginated<CBTMyCandidate>> = await res.json();
  return body.success && body.data ? body.data.results : null;
}

export async function getMyCandidate(candidatePublicId: string): Promise<CBTMyCandidate | null> {
  const candidates = await getMyCandidates();
  return candidates?.find((c) => c.public_id === candidatePublicId) ?? null;
}

/** The current attempt's live state plus its (answer-key-stripped)
 * question content — used to resume an in-progress attempt on page
 * load/refresh. */
export async function getMyAttempt(attemptPublicId: string): Promise<DetailResult<CBTAttemptPayload>> {
  // The endpoint reports an ownership failure as 404, not 403 — a
  // candidate can't probe for other students' attempt IDs by
  // distinguishing "forbidden" from "not found" (see the backend's
  // _own_attempt_or_error) — so there's no separate "forbidden" case here.
  const res = await djangoFetch(`/api/v1/cbt/my/attempts/${attemptPublicId}`);
  if (!res.ok) return { status: "not_found" };
  const body: Envelope<CBTAttemptPayload> = await res.json();
  if (!body.success || !body.data) return { status: "not_found" };
  return { status: "ok", data: body.data };
}
