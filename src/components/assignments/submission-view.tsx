import { Download } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { getSubmissionDownloadUrl } from "@/lib/assignments";
import { SUBMISSION_STATUS_LABELS, type AssignmentSubmission } from "@/lib/assignments-types";

export async function SubmissionView({
  submission,
  maxScore,
}: {
  submission: AssignmentSubmission;
  maxScore: string;
}) {
  const downloadUrl = submission.file_name ? await getSubmissionDownloadUrl(submission.public_id) : null;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant={submission.status === "late" ? "secondary" : "default"}>
          {SUBMISSION_STATUS_LABELS[submission.status]}
        </Badge>
        <span className="text-xs text-muted-foreground">
          Submitted {new Date(submission.submitted_at).toLocaleString()}
        </span>
      </div>

      {submission.text_content && (
        <p className="rounded-md border bg-muted/30 p-3 text-sm whitespace-pre-wrap">
          {submission.text_content}
        </p>
      )}

      {submission.file_name && (
        <div className="flex items-center gap-2 rounded-md border p-3 text-sm">
          <Download className="h-4 w-4 text-muted-foreground" />
          {downloadUrl ? (
            <a href={downloadUrl} target="_blank" rel="noreferrer" className="text-primary hover:underline">
              {submission.file_name}
            </a>
          ) : (
            <span>{submission.file_name}</span>
          )}
        </div>
      )}

      {submission.score !== null ? (
        <div className="space-y-1">
          <Badge variant="default">
            Score: {submission.score} / {maxScore}
          </Badge>
          {submission.feedback && <p className="text-sm text-muted-foreground">{submission.feedback}</p>}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">Awaiting grading.</p>
      )}
    </div>
  );
}
