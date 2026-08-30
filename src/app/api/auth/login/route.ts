import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { DJANGO_API_URL } from "@/lib/env";
import { setSessionCookies } from "@/lib/auth-cookies";
import type { Envelope } from "@/lib/api-types";

type TokenPairData = { access: string; refresh: string; access_expires_in: number; refresh_expires_in: number };

// Proxies to Django's /api/v1/auth/login and, on success, converts the
// returned JWT pair into httpOnly cookies on this origin — the browser
// never sees the raw tokens (BFF pattern; see docs/app/guides/backend-for-frontend).
export async function POST(request: Request) {
  const body = await request.json();

  let djangoRes: Response;
  try {
    djangoRes = await fetch(`${DJANGO_API_URL}/api/v1/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      cache: "no-store",
    });
  } catch (err) {
    // Django unreachable (misconfigured DJANGO_API_URL, network failure,
    // Django down) — fail as a clean error response rather than an
    // unhandled exception, which Next.js would otherwise turn into an
    // opaque 500 with no indication of what actually went wrong. Logged
    // (DJANGO_API_URL is this app's own public backend URL, not a secret)
    // so the actual target and error are visible in Vercel's function logs.
    console.error("[api/auth/login] fetch to Django failed", {
      djangoApiUrl: DJANGO_API_URL,
      error: err instanceof Error ? err.message : String(err),
    });
    return NextResponse.json(
      { success: false, message: "Unable to reach the server. Please try again shortly.", errors: null },
      { status: 502 }
    );
  }

  // A 429 here comes from infrastructure in front of Django (e.g. the
  // hosting platform's own abuse protection), not the app itself — the
  // app's own login-lockout (auth_service.AccountLockedError) returns 423
  // with a proper JSON envelope, so this path is specifically the "too
  // many raw requests" case, whose body isn't guaranteed to be JSON at all.
  if (djangoRes.status === 429) {
    return NextResponse.json(
      { success: false, message: "Too many attempts. Please wait a moment and try again.", errors: null },
      { status: 429 }
    );
  }

  let envelope: Envelope<TokenPairData>;
  try {
    envelope = await djangoRes.json();
  } catch (err) {
    console.error("[api/auth/login] Django response was not valid JSON", {
      djangoApiUrl: DJANGO_API_URL,
      status: djangoRes.status,
      error: err instanceof Error ? err.message : String(err),
    });
    return NextResponse.json(
      { success: false, message: "Unexpected response from the server.", errors: null },
      { status: 502 }
    );
  }

  if (!djangoRes.ok || !envelope.success || !envelope.data) {
    return NextResponse.json(
      { success: false, message: envelope.message, errors: envelope.errors },
      { status: djangoRes.status }
    );
  }

  const store = await cookies();
  setSessionCookies(store, envelope.data);

  return NextResponse.json({ success: true, message: envelope.message });
}
