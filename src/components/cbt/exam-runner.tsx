"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { AlertTriangle, Flag, Loader2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { QuestionCard } from "@/components/cbt/question-card";
import { heartbeat, logAttemptEvent, saveAnswer, setFlag, startAttempt, submitAttempt } from "@/lib/actions/cbt";
import type { CBTAttempt, CBTAttemptPayload, CBTDeliveryQuestion, CBTResponse } from "@/lib/cbt-types";

const HEARTBEAT_INTERVAL_MS = 20_000;
const SAVE_DEBOUNCE_MS = 700;

function formatCountdown(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const parts = [minutes, seconds].map((n) => String(n).padStart(2, "0"));
  return hours > 0 ? `${hours}:${parts.join(":")}` : parts.join(":");
}

export function ExamRunner({ candidateId }: { candidateId: string }) {
  const router = useRouter();
  const [phase, setPhase] = useState<"loading" | "ready" | "finished" | "error">("loading");
  const [attempt, setAttempt] = useState<CBTAttempt | null>(null);
  const [questions, setQuestions] = useState<CBTDeliveryQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<string, CBTResponse | null>>({});
  const [flags, setFlags] = useState<Record<string, boolean>>({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [secondsRemaining, setSecondsRemaining] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const attemptIdRef = useRef<string | null>(null);
  const saveTimeoutsRef = useRef<Record<string, ReturnType<typeof setTimeout>>>({});
  const closingRef = useRef(false); // guards against a double auto-submit from a race between the countdown and a heartbeat

  function applyPayload(payload: CBTAttemptPayload) {
    attemptIdRef.current = payload.attempt.public_id;
    setAttempt(payload.attempt);
    setQuestions(payload.questions);
    setAnswers(Object.fromEntries(payload.questions.map((q) => [q.exam_question, q.response])));
    setFlags(Object.fromEntries(payload.questions.map((q) => [q.exam_question, q.flagged])));
    if (payload.attempt.status !== "in_progress") {
      setPhase("finished");
    } else {
      setPhase("ready");
    }
  }

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const result = await startAttempt(candidateId);
      if (cancelled) return;
      if (!result.success || !result.data) {
        setError(result.errors?.join(" ") || result.message || "Could not start this exam");
        setPhase("error");
        return;
      }
      applyPayload(result.data);
    })();
    return () => {
      cancelled = true;
    };
  }, [candidateId]);

  const refreshFromServer = useCallback(async () => {
    if (!attemptIdRef.current) return;
    try {
      const result = await heartbeat(attemptIdRef.current);
      if (result.success && result.data) applyPayload(result.data);
    } finally {
      closingRef.current = false;
    }
  }, []);

  // Countdown, ticking from expires_at every second — never a locally
  // decremented counter, so it can't drift from the server's clock.
  useEffect(() => {
    if (phase !== "ready" || !attempt?.expires_at) return;
    const expiresAt = new Date(attempt.expires_at).getTime();

    const tick = () => {
      const remaining = Math.max(0, Math.round((expiresAt - Date.now()) / 1000));
      setSecondsRemaining(remaining);
      if (remaining <= 0 && !closingRef.current) {
        closingRef.current = true;
        refreshFromServer();
      }
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [phase, attempt?.expires_at, refreshFromServer]);

  // Heartbeat — the server is the sole authority on whether time has
  // actually run out; this just gives it a regular chance to say so.
  useEffect(() => {
    if (phase !== "ready") return;
    const interval = setInterval(refreshFromServer, HEARTBEAT_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [phase, refreshFromServer]);

  // Proctoring signals — best-effort, never blocking the exam on failure.
  useEffect(() => {
    if (phase !== "ready" || !attemptIdRef.current) return;
    const id = attemptIdRef.current;
    const log = (eventType: string) => void logAttemptEvent(id, eventType);

    const onVisibility = () => log(document.hidden ? "tab_hidden" : "tab_visible");
    const onBlur = () => log("window_blur");
    const onFocus = () => log("window_focus");
    const onFullscreenChange = () => log(document.fullscreenElement ? "fullscreen_enter" : "fullscreen_exit");
    const onCopy = (e: ClipboardEvent) => {
      e.preventDefault();
      log("copy_attempt");
    };
    const onPaste = (e: ClipboardEvent) => {
      e.preventDefault();
      log("paste_attempt");
    };
    const onContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      log("right_click");
    };
    const onOffline = () => log("disconnect");
    const onOnline = () => log("reconnect");

    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("blur", onBlur);
    window.addEventListener("focus", onFocus);
    document.addEventListener("fullscreenchange", onFullscreenChange);
    document.addEventListener("copy", onCopy);
    document.addEventListener("paste", onPaste);
    document.addEventListener("contextmenu", onContextMenu);
    window.addEventListener("offline", onOffline);
    window.addEventListener("online", onOnline);
    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("blur", onBlur);
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("fullscreenchange", onFullscreenChange);
      document.removeEventListener("copy", onCopy);
      document.removeEventListener("paste", onPaste);
      document.removeEventListener("contextmenu", onContextMenu);
      window.removeEventListener("offline", onOffline);
      window.removeEventListener("online", onOnline);
    };
  }, [phase]);

  useEffect(() => {
    const timeouts = saveTimeoutsRef.current;
    return () => {
      Object.values(timeouts).forEach(clearTimeout);
    };
  }, []);

  function handleAnswer(examQuestionId: string, response: CBTResponse) {
    setAnswers((prev) => ({ ...prev, [examQuestionId]: response }));
    clearTimeout(saveTimeoutsRef.current[examQuestionId]);
    saveTimeoutsRef.current[examQuestionId] = setTimeout(async () => {
      if (!attemptIdRef.current) return;
      const result = await saveAnswer(attemptIdRef.current, examQuestionId, response, 0);
      if (!result.success) {
        toast.error(result.errors?.join(" ") || result.message || "Could not save your answer");
      }
    }, SAVE_DEBOUNCE_MS);
  }

  async function handleToggleFlag(examQuestionId: string) {
    if (!attemptIdRef.current) return;
    const next = !flags[examQuestionId];
    setFlags((prev) => ({ ...prev, [examQuestionId]: next }));
    const result = await setFlag(attemptIdRef.current, examQuestionId, next);
    if (!result.success) {
      setFlags((prev) => ({ ...prev, [examQuestionId]: !next }));
      toast.error(result.errors?.join(" ") || result.message || "Could not update the flag");
    }
  }

  async function handleSubmit() {
    if (!attemptIdRef.current) return;
    setSubmitting(true);
    const result = await submitAttempt(attemptIdRef.current);
    setSubmitting(false);
    if (result.success && result.data) {
      applyPayload(result.data);
      return;
    }
    // finalize (the Result write) can fail even though the submission and
    // scoring already committed server-side — re-sync rather than assume
    // nothing happened (see attempt_service.submit_attempt's docstring).
    toast.error(result.errors?.join(" ") || result.message || "Submission ran into an issue — re-checking status...");
    await refreshFromServer();
  }

  const answeredCount = useMemo(
    () => questions.filter((q) => answers[q.exam_question] != null).length,
    [questions, answers]
  );

  if (phase === "loading") {
    return (
      <div className="flex flex-col items-center justify-center gap-2 py-24">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        <p className="text-sm text-muted-foreground">Loading your exam...</p>
      </div>
    );
  }

  if (phase === "error") {
    return (
      <div className="mx-auto max-w-xl space-y-4 p-6 text-center">
        <AlertTriangle className="mx-auto h-8 w-8 text-destructive" />
        <p className="font-medium">Couldn&apos;t start this exam</p>
        <p className="text-sm text-muted-foreground">{error}</p>
        <Button variant="outline" onClick={() => router.push(`/my-cbt-exams/${candidateId}`)}>
          Back to exam details
        </Button>
      </div>
    );
  }

  if (phase === "finished" && attempt) {
    return (
      <div className="mx-auto max-w-xl space-y-4 p-6 text-center">
        <h1 className="text-xl font-semibold">
          {attempt.status === "expired" ? "Time's up — exam submitted" : "Exam submitted"}
        </h1>
        <p className="text-3xl font-bold">
          {attempt.score} <span className="text-lg font-normal text-muted-foreground">({attempt.percentage}%)</span>
        </p>
        <Badge variant={attempt.passed ? "default" : "destructive"}>
          {attempt.passed ? "Passed" : "Not passed"}
        </Badge>
        <div>
          <Button onClick={() => router.push(`/my-cbt-exams/${candidateId}`)}>Back to exam details</Button>
        </div>
      </div>
    );
  }

  const current = questions[currentIndex];

  return (
    <div className="mx-auto max-w-3xl space-y-4 p-6">
      <div className="sticky top-0 z-10 -mx-6 flex items-center justify-between gap-4 border-b bg-background px-6 py-3">
        <div className="text-sm text-muted-foreground">
          {answeredCount} / {questions.length} answered
        </div>
        <Badge variant={secondsRemaining !== null && secondsRemaining < 60 ? "destructive" : "secondary"}>
          {secondsRemaining !== null ? formatCountdown(secondsRemaining) : "--:--"}
        </Badge>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button size="sm" disabled={submitting}>
              {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
              Submit exam
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Submit this exam?</AlertDialogTitle>
              <AlertDialogDescription>
                You&apos;ve answered {answeredCount} of {questions.length} questions. Once submitted, you
                can&apos;t change your answers.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Keep working</AlertDialogCancel>
              <AlertDialogAction onClick={handleSubmit}>Submit</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-normal text-muted-foreground">Question navigator</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {questions.map((q, i) => (
            <Button
              key={q.exam_question}
              type="button"
              size="icon"
              variant={i === currentIndex ? "default" : answers[q.exam_question] != null ? "secondary" : "outline"}
              className="relative h-9 w-9"
              onClick={() => setCurrentIndex(i)}
            >
              {i + 1}
              {flags[q.exam_question] && (
                <Flag className="absolute -top-1 -right-1 h-3 w-3 fill-amber-500 text-amber-500" />
              )}
            </Button>
          ))}
        </CardContent>
      </Card>

      {current && (
        <QuestionCard
          index={currentIndex}
          total={questions.length}
          question={current}
          response={answers[current.exam_question] ?? null}
          flagged={flags[current.exam_question] ?? false}
          disabled={submitting}
          onAnswer={(response) => handleAnswer(current.exam_question, response)}
          onToggleFlag={() => handleToggleFlag(current.exam_question)}
        />
      )}

      <div className="flex justify-between">
        <Button
          variant="outline"
          disabled={currentIndex === 0}
          onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          disabled={currentIndex >= questions.length - 1}
          onClick={() => setCurrentIndex((i) => Math.min(questions.length - 1, i + 1))}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
