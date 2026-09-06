"use client";

import { Flag } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { SUPPORTED_QUESTION_TYPES, type CBTDeliveryQuestion, type CBTResponse } from "@/lib/cbt-types";

// Only "paragraph"/"heading"/"callout" blocks render here — their content
// is staff-authored rich HTML (see the backend's block-content
// validation, which requires an "html" key for exactly these types), so
// this trusts it the same way the rest of the app trusts staff-authored
// content. Every other block_type (image/equation/table/graph/media) has
// no rendering pipeline yet in this UI — see the PR notes — so it shows a
// plain placeholder rather than breaking or silently dropping the block.
function BlockContent({ block }: { block: CBTDeliveryQuestion["snapshot"]["blocks"][number] }) {
  if (["paragraph", "heading", "callout"].includes(block.block_type) && typeof block.content.html === "string") {
    return (
      <div
        className={block.block_type === "heading" ? "text-lg font-medium" : "text-sm"}
        dangerouslySetInnerHTML={{ __html: block.content.html as string }}
      />
    );
  }
  return (
    <p className="text-sm italic text-muted-foreground">
      [{block.block_type} content — not yet viewable in this exam interface]
    </p>
  );
}

function optionText(content: Record<string, unknown>, fallbackLabel: string): string {
  if (typeof content.text === "string" && content.text.length > 0) return content.text;
  return fallbackLabel;
}

export function QuestionCard({
  index,
  total,
  question,
  response,
  flagged,
  disabled,
  onAnswer,
  onToggleFlag,
}: {
  index: number;
  total: number;
  question: CBTDeliveryQuestion;
  response: CBTResponse | null;
  flagged: boolean;
  disabled: boolean;
  onAnswer: (response: CBTResponse) => void;
  onToggleFlag: () => void;
}) {
  const { snapshot } = question;
  const supported = (SUPPORTED_QUESTION_TYPES as string[]).includes(snapshot.question_type);

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground">
            Question {index + 1} of {total} · {question.marks} marks
          </p>
        </div>
        <Button
          type="button"
          variant={flagged ? "default" : "outline"}
          size="sm"
          onClick={onToggleFlag}
          disabled={disabled}
        >
          <Flag className="h-4 w-4" />
          {flagged ? "Flagged" : "Flag for review"}
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          {snapshot.blocks.map((block, i) => (
            <BlockContent key={i} block={block} />
          ))}
        </div>

        {!supported ? (
          <Badge variant="outline" className="w-fit">
            This question type isn&apos;t supported in the browser exam yet — flag it and tell your invigilator.
          </Badge>
        ) : snapshot.question_type === "single_choice" || snapshot.question_type === "true_false" ? (
          <RadioGroup
            value={(response?.selected_option_label as string) ?? ""}
            onValueChange={(value) => onAnswer({ selected_option_label: value })}
            disabled={disabled}
          >
            {snapshot.options.map((option) => (
              <div key={option.label} className="flex items-center gap-2">
                <RadioGroupItem value={option.label} id={`opt-${question.exam_question}-${option.label}`} />
                <Label htmlFor={`opt-${question.exam_question}-${option.label}`} className="font-normal">
                  {optionText(option.content, option.label)}
                </Label>
              </div>
            ))}
          </RadioGroup>
        ) : snapshot.question_type === "multiple_choice" ? (
          <div className="space-y-2">
            {snapshot.options.map((option) => {
              const selected = ((response?.selected_option_labels as string[]) ?? []).includes(option.label);
              return (
                <div key={option.label} className="flex items-center gap-2">
                  <Checkbox
                    id={`opt-${question.exam_question}-${option.label}`}
                    checked={selected}
                    disabled={disabled}
                    onCheckedChange={(checked) => {
                      const current = new Set((response?.selected_option_labels as string[]) ?? []);
                      if (checked) current.add(option.label);
                      else current.delete(option.label);
                      onAnswer({ selected_option_labels: [...current] });
                    }}
                  />
                  <Label htmlFor={`opt-${question.exam_question}-${option.label}`} className="font-normal">
                    {optionText(option.content, option.label)}
                  </Label>
                </div>
              );
            })}
          </div>
        ) : snapshot.question_type === "numeric" ? (
          <Input
            type="number"
            inputMode="decimal"
            value={(response?.value as number | string) ?? ""}
            onChange={(e) => onAnswer({ value: e.target.value === "" ? "" : Number(e.target.value) })}
            disabled={disabled}
            placeholder="Enter your answer"
            className="max-w-xs"
          />
        ) : snapshot.question_type === "short_answer" ? (
          <Input
            value={(response?.text as string) ?? ""}
            onChange={(e) => onAnswer({ text: e.target.value })}
            disabled={disabled}
            placeholder="Enter your answer"
          />
        ) : snapshot.question_type === "long_answer" ? (
          <Textarea
            value={(response?.text as string) ?? ""}
            onChange={(e) => onAnswer({ text: e.target.value })}
            disabled={disabled}
            rows={8}
            placeholder="Write your answer"
          />
        ) : null}
      </CardContent>
    </Card>
  );
}
