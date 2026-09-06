import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Pencil, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DeleteConfirmButton } from "@/components/schools/delete-confirm-button";
import { QuestionFormDialog } from "@/components/cbt/admin/question-form-dialog";
import { BlockFormDialog } from "@/components/cbt/admin/block-form-dialog";
import { OptionFormDialog } from "@/components/cbt/admin/option-form-dialog";
import { QuestionStatusActions } from "@/components/cbt/admin/question-status-actions";
import { getQuestionResult, getTopics, HTML_BLOCK_TYPES } from "@/lib/cbt";
import { getSubjects, getClassLevels } from "@/lib/academics";
import {
  updateQuestion,
  deleteQuestion,
  submitQuestion,
  approveQuestion,
  rejectQuestion,
  duplicateQuestion,
  addQuestionBlock,
  updateQuestionBlock,
  deleteQuestionBlock,
  addQuestionOption,
  updateQuestionOption,
  deleteQuestionOption,
} from "@/lib/actions/cbt";
import { cbtBlockDefaults, cbtOptionDefaults, cbtQuestionTypeLabel } from "@/lib/cbt-forms";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ publicId: string }>;
}): Promise<Metadata> {
  const { publicId } = await params;
  const result = await getQuestionResult(publicId);
  return { title: result.status === "ok" ? result.data.code : "Question" };
}

export default async function CBTQuestionDetailPage({
  params,
}: {
  params: Promise<{ publicId: string }>;
}) {
  const { publicId } = await params;
  const result = await getQuestionResult(publicId);
  if (result.status === "forbidden") {
    return (
      <div className="mx-auto max-w-4xl space-y-6 p-6">
        <p className="text-sm text-muted-foreground">You don&apos;t have access to this question.</p>
      </div>
    );
  }
  if (result.status === "not_found") notFound();
  const question = result.data;

  const [subjects, classLevels, topics] = await Promise.all([
    getSubjects(),
    getClassLevels(),
    getTopics(question.subject),
  ]);
  const subjectOptions = (subjects ?? []).map((s) => ({ value: s.public_id, label: s.name }));
  const classLevelOptions = (classLevels ?? []).map((l) => ({ value: l.public_id, label: l.name }));
  const topicOptions = (topics ?? []).map((t) => ({ value: t.public_id, label: t.name }));

  // The backend permits editing a question's shell/blocks/options in any
  // status (cbt_questions.update is purely an RBAC check, not gated on
  // question.status) — editing an already-published question just
  // triggers question_service's snapshot-first-then-edit behavior rather
  // than being blocked, so this UI doesn't invent a stricter rule either.
  const editable = true;
  const sortedBlocks = [...question.blocks].sort((a, b) => a.order - b.order);
  const sortedOptions = [...question.options].sort((a, b) => a.order - b.order);
  const nextBlockOrder = sortedBlocks.length > 0 ? Math.max(...sortedBlocks.map((b) => b.order)) + 1 : 1;
  const nextOptionOrder = sortedOptions.length > 0 ? Math.max(...sortedOptions.map((o) => o.order)) + 1 : 1;

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-semibold">{question.code}</h1>
            <Badge variant="outline" className="capitalize">
              {question.status}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            {cbtQuestionTypeLabel(question.question_type)} · {question.difficulty} · {question.marks} marks
            {Number(question.negative_marks) > 0 && ` (−${question.negative_marks} if wrong)`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {editable && (
            <QuestionFormDialog
              trigger={
                <Button variant="secondary">
                  <Pencil className="h-4 w-4" />
                  Edit
                </Button>
              }
              title="Edit question"
              defaultValues={{
                subject: question.subject,
                class_level: question.class_level,
                topic: question.topic ?? "",
                question_type: question.question_type,
                difficulty: question.difficulty,
                marks: question.marks,
                negative_marks: question.negative_marks,
              }}
              subjectOptions={subjectOptions}
              classLevelOptions={classLevelOptions}
              topicOptions={topicOptions}
              action={updateQuestion.bind(null, question.public_id)}
            />
          )}
          {editable && (
            <DeleteConfirmButton
              description="Delete this question? Its blocks and options go with it."
              action={deleteQuestion.bind(null, question.public_id)}
            />
          )}
        </div>
      </div>

      <QuestionStatusActions
        status={question.status}
        onSubmit={submitQuestion.bind(null, question.public_id)}
        onApprove={approveQuestion.bind(null, question.public_id)}
        onReject={rejectQuestion.bind(null, question.public_id)}
        onDuplicate={duplicateQuestion.bind(null, question.public_id)}
      />

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Content</CardTitle>
          {editable && (
            <BlockFormDialog
              trigger={
                <Button size="sm" variant="secondary">
                  <Plus className="h-4 w-4" />
                  Add block
                </Button>
              }
              title="Add content block"
              defaultValues={{ ...cbtBlockDefaults, order: nextBlockOrder }}
              action={addQuestionBlock.bind(null, question.public_id)}
            />
          )}
        </CardHeader>
        <CardContent className="space-y-2">
          {sortedBlocks.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No content yet. Add a paragraph block with the question stem.
            </p>
          ) : (
            sortedBlocks.map((block) => {
              const isHtml = (HTML_BLOCK_TYPES as string[]).includes(block.block_type);
              const html = typeof block.content.html === "string" ? block.content.html : "";
              return (
                <div
                  key={block.public_id}
                  className="flex items-start justify-between gap-3 rounded-md border p-3"
                >
                  <div className="min-w-0 flex-1 space-y-1">
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      {block.block_type} · order {block.order}
                    </p>
                    {isHtml ? (
                      <div className="text-sm" dangerouslySetInnerHTML={{ __html: html }} />
                    ) : (
                      <p className="text-sm italic text-muted-foreground">
                        [{block.block_type} content — not editable in this UI yet]
                      </p>
                    )}
                  </div>
                  {editable && (
                    <div className="flex items-center gap-1">
                      {isHtml && (
                        <BlockFormDialog
                          trigger={
                            <Button variant="ghost" size="icon-sm">
                              <Pencil className="h-4 w-4" />
                            </Button>
                          }
                          title="Edit content block"
                          defaultValues={{
                            block_type: block.block_type as "paragraph" | "heading" | "callout",
                            html,
                            order: block.order,
                          }}
                          action={updateQuestionBlock.bind(null, question.public_id, block.public_id)}
                        />
                      )}
                      <DeleteConfirmButton
                        description="Delete this content block?"
                        action={deleteQuestionBlock.bind(null, question.public_id, block.public_id)}
                      />
                    </div>
                  )}
                </div>
              );
            })
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Options</CardTitle>
          {editable && (
            <OptionFormDialog
              trigger={
                <Button size="sm" variant="secondary">
                  <Plus className="h-4 w-4" />
                  Add option
                </Button>
              }
              title="Add option"
              defaultValues={{ ...cbtOptionDefaults, order: nextOptionOrder }}
              action={addQuestionOption.bind(null, question.public_id)}
            />
          )}
        </CardHeader>
        <CardContent className="space-y-2">
          {sortedOptions.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No options yet. Single/multiple choice and true/false questions need at least two.
            </p>
          ) : (
            sortedOptions.map((option) => {
              const text = typeof option.content.text === "string" ? option.content.text : "";
              return (
                <div
                  key={option.public_id}
                  className="flex items-center justify-between gap-3 rounded-md border p-3"
                >
                  <div className="flex items-center gap-2 text-sm">
                    <Badge variant={option.is_correct ? "default" : "outline"}>{option.label}</Badge>
                    <span>{text || <span className="italic text-muted-foreground">(no text)</span>}</span>
                    {option.is_correct && <span className="text-xs text-muted-foreground">Correct</span>}
                  </div>
                  {editable && (
                    <div className="flex items-center gap-1">
                      <OptionFormDialog
                        trigger={
                          <Button variant="ghost" size="icon-sm">
                            <Pencil className="h-4 w-4" />
                          </Button>
                        }
                        title="Edit option"
                        defaultValues={{
                          label: option.label,
                          text,
                          is_correct: option.is_correct,
                          order: option.order,
                          explanation: option.explanation ?? "",
                        }}
                        action={updateQuestionOption.bind(null, question.public_id, option.public_id)}
                      />
                      <DeleteConfirmButton
                        description="Delete this option?"
                        action={deleteQuestionOption.bind(null, question.public_id, option.public_id)}
                      />
                    </div>
                  )}
                </div>
              );
            })
          )}
        </CardContent>
      </Card>
    </div>
  );
}
