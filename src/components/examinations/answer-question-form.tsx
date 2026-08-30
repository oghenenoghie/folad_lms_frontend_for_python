"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { submitAnswer } from "@/lib/actions/examinations";
import { OBJECTIVE_QUESTION_TYPES, type Question, type QuestionOption } from "@/lib/examinations-types";

export function AnswerQuestionForm({
  assessmentId,
  question,
  options,
  studentId,
}: {
  assessmentId: string;
  question: Question;
  options: QuestionOption[];
  studentId: string;
}) {
  const isObjective = OBJECTIVE_QUESTION_TYPES.includes(question.question_type);
  const [selectedOption, setSelectedOption] = useState("");
  const [textAnswer, setTextAnswer] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    if (isObjective && !selectedOption) {
      setError("Select an option before submitting");
      return;
    }
    if (!isObjective && !textAnswer.trim()) {
      setError("Enter an answer before submitting");
      return;
    }
    setError(null);
    setPending(true);
    const result = await submitAnswer(assessmentId, {
      question: question.public_id,
      student: studentId,
      ...(isObjective ? { selected_option: selectedOption } : { text_answer: textAnswer }),
    });
    setPending(false);
    if (result.success) {
      toast.success("Answer submitted");
    } else {
      setError(result.errors?.join(" ") || result.message || "Could not submit answer");
    }
  }

  return (
    <div className="space-y-3">
      {isObjective ? (
        <RadioGroup value={selectedOption} onValueChange={setSelectedOption}>
          {options.map((option) => (
            <div key={option.public_id} className="flex items-center gap-2">
              <RadioGroupItem value={option.public_id} id={option.public_id} />
              <Label htmlFor={option.public_id} className="font-normal">
                {option.text}
              </Label>
            </div>
          ))}
        </RadioGroup>
      ) : (
        <Textarea
          value={textAnswer}
          onChange={(e) => setTextAnswer(e.target.value)}
          placeholder="Type your answer..."
          rows={4}
        />
      )}

      {error && <p className="text-sm text-destructive">{error}</p>}

      <Button type="button" size="sm" onClick={handleSubmit} disabled={pending}>
        {pending && <Loader2 className="h-4 w-4 animate-spin" />}
        Submit answer
      </Button>
    </div>
  );
}
