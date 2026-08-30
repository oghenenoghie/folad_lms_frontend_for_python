import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { DJANGO_API_URL } from "@/lib/env";
import { REFRESH_COOKIE, setSessionCookies, clearSessionCookies } from "@/lib/auth-cookies";
import type { Envelope } from "@/lib/api-types";

type TokenPairData = { access: string; refresh: string; access_expires_in: number; refresh_expires_in: number };

// Manual refresh, for a client-side fetch wrapper to call after a 401 from
// one of this app's own API routes. proxy.ts performs the same refresh
// optimistically on page navigation, so this mostly covers the gap between
// navigations (a long-lived tab with an expired access token).
export async function POST() {
  const store = await cookies();
  const refresh = store.get(REFRESH_COOKIE)?.value;

  if (!refresh) {
    return NextResponse.json({ success: false, message: "no session" }, { status: 401 });
  }

  let djangoRes: Response;
  try {
    djangoRes = await fetch(`${DJANGO_API_URL}/api/v1/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh }),
      cache: "no-store",
    });
  } catch (err) {
    // Django unreachable — fail as a clean error response rather than an
    // unhandled exception turning into an opaque 500. Logged (DJANGO_API_URL
    // is this app's own public backend URL, not a secret) so the actual
    // target and error are visible in Vercel's function logs.
    console.error("[api/auth/refresh] fetch to Django failed", {
      djangoApiUrl: DJANGO_API_URL,
      error: err instanceof Error ? err.message : String(err),
    });
    return NextResponse.json(
      { success: false, message: "Unable to reach the server. Please try again shortly." },
      { status: 502 }
    );
  }

  let envelope: Envelope<TokenPairData>;
  try {
    envelope = await djangoRes.json();
  } catch (err) {
    console.error("[api/auth/refresh] Django response was not valid JSON", {
      djangoApiUrl: DJANGO_API_URL,
      status: djangoRes.status,
      error: err instanceof Error ? err.message : String(err),
    });
    return NextResponse.json(
      { success: false, message: "Unexpected response from the server." },
      { status: 502 }
    );
  }

  if (!djangoRes.ok || !envelope.success || !envelope.data) {
    clearSessionCookies(store);
    return NextResponse.json({ success: false, message: envelope.message }, { status: djangoRes.status });
  }

  setSessionCookies(store, envelope.data);
  return NextResponse.json({ success: true });
}
