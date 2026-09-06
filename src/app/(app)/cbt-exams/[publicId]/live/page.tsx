import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { LiveInvigilationDashboard } from "@/components/cbt/admin/live-invigilation-dashboard";
import { getCBTExamResult, getExamLiveStatus } from "@/lib/cbt";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ publicId: string }>;
}): Promise<Metadata> {
  const { publicId } = await params;
  const result = await getCBTExamResult(publicId);
  return { title: result.status === "ok" ? `Live: ${result.data.name}` : "Live invigilation" };
}

export default async function CBTExamLivePage({
  params,
}: {
  params: Promise<{ publicId: string }>;
}) {
  const { publicId } = await params;
  const result = await getCBTExamResult(publicId);
  if (result.status === "forbidden") {
    return (
      <div className="mx-auto max-w-5xl space-y-6 p-6">
        <p className="text-sm text-muted-foreground">You don&apos;t have access to this exam.</p>
      </div>
    );
  }
  if (result.status === "not_found") notFound();
  const exam = result.data;

  const initial = await getExamLiveStatus(publicId);

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-6">
      <div className="space-y-1">
        <Link
          href={`/cbt-exams/${exam.public_id}`}
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to exam
        </Link>
        <h1 className="text-xl font-semibold">Live: {exam.name}</h1>
        <p className="text-sm text-muted-foreground">
          Refreshes automatically every few seconds. Not a live push feed — the page polls the server.
        </p>
      </div>

      <LiveInvigilationDashboard examPublicId={exam.public_id} initial={initial} />
    </div>
  );
}
