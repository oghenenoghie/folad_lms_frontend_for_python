import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { DJANGO_API_URL } from "@/lib/env";
import { ACCESS_COOKIE, REFRESH_COOKIE, setSessionCookies, clearSessionCookies } from "@/lib/auth-cookies";
import type { CurrentUser, Envelope } from "@/lib/api-types";

type TokenPairData = { access: string; refresh: string; access_expires_in: number; refresh_expires_in: number };

/** Read-only: for Server Components. Attaches whatever access cookie is
 * already on the request — no refresh attempt, since Server Components
 * cannot write cookies. A 401 here means the caller should redirect to
 * /login (proxy.ts's own refresh keeps this the rare case). */
export async function djangoFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const store = await cookies();
  const access = store.get(ACCESS_COOKIE)?.value;

  return fetch(`${DJANGO_API_URL}${path}`, {
    ...init,
    headers: {
      ...(init.headers ?? {}),
      ...(access ? { Authorization: `Bearer ${access}` } : {}),
    },
    cache: "no-store",
  });
}

// Wrapped in cache(): (app)/layout.tsx calls this on every page render for
// the nav/user menu, and most pages under it call it again for their own
// role checks — without this, that's two (or more) identical /auth/me
// round trips per request. djangoFetch always sets cache: "no-store", so
// this wraps the function itself instead, scoped to one request/render.
export const getCurrentUser = cache(async (): Promise<CurrentUser | null> => {
  const res = await djangoFetch("/api/v1/auth/me");
  if (!res.ok) return null;
  const body: Envelope<CurrentUser> = await res.json();
  return body.success ? body.data : null;
});

/** Mutable-cookie version for Route Handlers and Server Actions: retries
 * once through Django's refresh endpoint on a 401 before giving up, so a
 * request that just missed the access token's 15-minute window doesn't
 * force a re-login. */
export async function authorizedDjangoFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const store = await cookies();
  const access = store.get(ACCESS_COOKIE)?.value;
  const refresh = store.get(REFRESH_COOKIE)?.value;

  const attempt = (token?: string) =>
    fetch(`${DJANGO_API_URL}${path}`, {
      ...init,
      headers: {
        ...(init.headers ?? {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      cache: "no-store",
    });

  let res = await attempt(access);
  if (res.status !== 401 || !refresh) return res;

  const refreshRes = await fetch(`${DJANGO_API_URL}/api/v1/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh }),
    cache: "no-store",
  });

  if (!refreshRes.ok) {
    clearSessionCookies(store);
    return res;
  }

  const body: Envelope<TokenPairData> = await refreshRes.json();
  if (!body.success || !body.data) {
    clearSessionCookies(store);
    return res;
  }

  setSessionCookies(store, body.data);
  res = await attempt(body.data.access);
  return res;
}
