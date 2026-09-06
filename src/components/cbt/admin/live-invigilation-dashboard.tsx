"use client";

import { useEffect, useRef, useState } from "react";
import { RefreshCw, Flag } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { fetchExamLiveStatus } from "@/lib/actions/cbt";
import type { CBTAttemptStatus, CBTLiveStatus } from "@/lib/cbt-types";

const POLL_INTERVAL_MS = 5000;

function formatSeconds(seconds: number | null): string {
  if (seconds === null) return "—";
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function statusVariant(status: CBTAttemptStatus | "not_started"): "default" | "secondary" | "outline" | "destructive" {
  if (status === "in_progress") return "default";
  if (status === "submitted") return "secondary";
  if (status === "expired" || status === "abandoned") return "destructive";
  return "outline";
}

function statusLabel(status: string): string {
  return status
    .split("_")
    .map((w) => w[0].toUpperCase() + w.slice(1))
    .join(" ");
}

// Poll-based, not a websocket feed — nothing server-side pushes updates
// (see invigilation_service's module docstring), so this dashboard
// re-fetches on an interval rather than subscribing to anything.
export function LiveInvigilationDashboard({
  examPublicId,
  initial,
}: {
  examPublicId: string;
  initial: CBTLiveStatus | null;
}) {
  const [status, setStatus] = useState<CBTLiveStatus | null>(initial);
  const [refreshing, setRefreshing] = useState(false);
  const mountedRef = useRef(true);

  async function refresh() {
    setRefreshing(true);
    const next = await fetchExamLiveStatus(examPublicId);
    if (mountedRef.current && next) setStatus(next);
    setRefreshing(false);
  }

  useEffect(() => {
    mountedRef.current = true;
    const interval = setInterval(refresh, POLL_INTERVAL_MS);
    return () => {
      mountedRef.current = false;
      clearInterval(interval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [examPublicId]);

  if (status === null) {
    return <p className="text-sm text-muted-foreground">Live status isn&apos;t available right now.</p>;
  }

  const candidates = status.candidates;
  const flaggedCount = candidates.filter((c) => c.flagged_for_review).length;
  const inProgressCount = candidates.filter((c) => c.status === "in_progress").length;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <span>
            <span className="font-medium text-foreground">{inProgressCount}</span> in progress
          </span>
          {flaggedCount > 0 && (
            <span className="flex items-center gap-1 text-destructive">
              <Flag className="h-3.5 w-3.5" />
              <span className="font-medium">{flaggedCount}</span> flagged for review
            </span>
          )}
          <span>Updated {new Date(status.server_time).toLocaleTimeString()}</span>
        </div>
        <Button size="sm" variant="ghost" onClick={refresh} disabled={refreshing}>
          <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>#</TableHead>
            <TableHead>Student</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Progress</TableHead>
            <TableHead>Time left</TableHead>
            <TableHead>Last activity</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {candidates.map((row) => (
            <TableRow key={row.candidate} className={row.flagged_for_review ? "bg-destructive/5" : undefined}>
              <TableCell>{row.candidate_number}</TableCell>
              <TableCell>
                {row.student_name}
                {!row.is_eligible && (
                  <Badge variant="outline" className="ml-2">
                    Not eligible
                  </Badge>
                )}
                {row.flagged_for_review && (
                  <Badge variant="destructive" className="ml-2 gap-1">
                    <Flag className="h-3 w-3" />
                    Flagged
                  </Badge>
                )}
              </TableCell>
              <TableCell>
                <Badge variant={statusVariant(row.status)}>{statusLabel(row.status)}</Badge>
              </TableCell>
              <TableCell>
                {row.answered_count} / {row.total_questions}
              </TableCell>
              <TableCell>{formatSeconds(row.seconds_remaining)}</TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {row.last_activity_at ? new Date(row.last_activity_at).toLocaleTimeString() : "—"}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
