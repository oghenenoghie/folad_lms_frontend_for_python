import { NextResponse } from "next/server";
import { authorizedDjangoFetch } from "@/lib/session";
import { DJANGO_API_URL } from "@/lib/env";

// Same BFF hop as api/report-cards/[publicId]/pdf/route.ts — Django's
// ReportCardBulkExportDownloadView also needs the Bearer token this app
// keeps in an httpOnly cookie, which a plain <a href> to the Django host
// wouldn't carry.
export async function GET(request: Request, { params }: { params: Promise<{ publicId: string }> }) {
  const { publicId } = await params;
  const res = await authorizedDjangoFetch(`/api/v1/report-cards/bulk-exports/${publicId}/download`, {
    redirect: "manual",
  });

  const location = res.headers.get("location");
  if ((res.status === 301 || res.status === 302) && location) {
    return NextResponse.redirect(new URL(location, DJANGO_API_URL));
  }

  const message =
    res.status === 409
      ? "This export isn't ready yet — try again shortly."
      : "Couldn't download this export.";
  const referer = request.headers.get("referer");
  const redirectTo = new URL(referer ?? "/report-cards", request.url);
  redirectTo.searchParams.set("exportError", message);
  return NextResponse.redirect(redirectTo);
}
