import { NextResponse } from "next/server";
import { authorizedDjangoFetch } from "@/lib/session";
import { DJANGO_API_URL } from "@/lib/env";

// A stable download link the UI can point straight at (an <a href>) —
// proxies to Django's own ReportCardPdfView, which 302s to a presigned/
// media URL. That redirect can't be followed directly by the browser:
// the Django endpoint requires the Bearer access token this app keeps in
// an httpOnly cookie (see lib/session.ts's BFF pattern), which the
// browser never has to attach itself. So this route makes the
// authenticated hop server-side (redirect: "manual" to read the
// Location header rather than following it — the actual file URL itself
// needs no auth) and redirects the browser straight to that.
export async function GET(request: Request, { params }: { params: Promise<{ publicId: string }> }) {
  const { publicId } = await params;
  const res = await authorizedDjangoFetch(`/api/v1/report-cards/${publicId}/pdf`, {
    redirect: "manual",
  });

  const location = res.headers.get("location");
  if ((res.status === 301 || res.status === 302) && location) {
    return NextResponse.redirect(new URL(location, DJANGO_API_URL));
  }

  // Rare (pdf_status flipped between page render and click) — bounce back
  // to wherever the link was clicked from rather than a fixed path, since
  // this route is linked from admin, student, and guardian screens alike.
  const message =
    res.status === 409
      ? "The PDF for this report card isn't ready yet — try again shortly."
      : "Couldn't download this report card's PDF.";
  const referer = request.headers.get("referer");
  const redirectTo = new URL(referer ?? "/dashboard", request.url);
  redirectTo.searchParams.set("pdfError", message);
  return NextResponse.redirect(redirectTo);
}
