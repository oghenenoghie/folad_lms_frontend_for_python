import type { Metadata } from "next";
import Link from "next/link";
import { HelpCircle, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { QuestionFormDialog } from "@/components/cbt/admin/question-form-dialog";
import { QuestionBulkImportDialog } from "@/components/cbt/admin/question-bulk-import-dialog";
import { TopicFormDialog } from "@/components/cbt/admin/topic-form-dialog";
import { DeleteConfirmButton } from "@/components/schools/delete-confirm-button";
import { getQuestions, getTopics } from "@/lib/cbt";
import { getSubjects, getClassLevels } from "@/lib/academics";
import { createQuestion, bulkImportQuestions, createTopic, deleteTopic } from "@/lib/actions/cbt";
import { cbtQuestionDefaults, cbtQuestionTypeLabel, cbtTopicDefaults } from "@/lib/cbt-forms";

export const metadata: Metadata = { title: "CBT Question Bank" };

function statusVariant(status: string): "default" | "secondary" | "outline" | "destructive" {
  if (status === "published" || status === "approved") return "default";
  if (status === "archived") return "outline";
  if (status === "draft") return "secondary";
  return "outline";
}

export default async function CBTQuestionsPage() {
  const [questions, subjects, classLevels] = await Promise.all([
    getQuestions(),
    getSubjects(),
    getClassLevels(),
  ]);

  const subjectNameById = new Map((subjects ?? []).map((s) => [s.public_id, s.name]));
  const classLevelNameById = new Map((classLevels ?? []).map((l) => [l.public_id, l.name]));
  const subjectOptions = (subjects ?? []).map((s) => ({ value: s.public_id, label: s.name }));
  const classLevelOptions = (classLevels ?? []).map((l) => ({ value: l.public_id, label: l.name }));

  const topics = subjectOptions.length > 0 ? await getTopics() : null;
  const topicOptions = (topics ?? []).map((t) => ({
    value: t.public_id,
    label: `${subjectNameById.get(t.subject) ?? "Unknown subject"} — ${t.name}`,
  }));

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">CBT Question Bank</h1>
          <p className="text-sm text-muted-foreground">
            Author, review, and approve questions for computer-based exams.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {questions !== null && subjectOptions.length > 0 && classLevelOptions.length > 0 && (
            <QuestionBulkImportDialog
              trigger={
                <Button variant="secondary">
                  <Plus className="h-4 w-4" />
                  Bulk import
                </Button>
              }
              subjectOptions={subjectOptions}
              classLevelOptions={classLevelOptions}
              action={bulkImportQuestions}
            />
          )}
          {questions !== null && subjectOptions.length > 0 && classLevelOptions.length > 0 && (
            <QuestionFormDialog
              trigger={
                <Button>
                  <Plus className="h-4 w-4" />
                  New question
                </Button>
              }
              title="New question"
              defaultValues={cbtQuestionDefaults}
              subjectOptions={subjectOptions}
              classLevelOptions={classLevelOptions}
              topicOptions={topicOptions}
              action={createQuestion}
            />
          )}
        </div>
      </div>

      {subjectOptions.length > 0 && (
        <div className="space-y-2 rounded-lg border p-4">
          <div className="flex items-center justify-between">
            <h2 className="font-medium">Topics</h2>
            <TopicFormDialog
              trigger={
                <button type="button" className="text-xs font-medium text-primary hover:underline">
                  + Add topic
                </button>
              }
              title="New topic"
              defaultValues={cbtTopicDefaults}
              subjectOptions={subjectOptions}
              action={createTopic}
            />
          </div>
          {topics === null || topics.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No topics yet — optional, but useful for filtering and topic-weighted exams.
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {topics.map((topic) => (
                <Badge key={topic.public_id} variant="outline" className="gap-1.5 py-1 pl-2.5 pr-1">
                  {subjectNameById.get(topic.subject) ?? "Unknown"} — {topic.name}
                  <DeleteConfirmButton
                    description={`Delete the topic "${topic.name}"?`}
                    action={deleteTopic.bind(null, topic.public_id)}
                  />
                </Badge>
              ))}
            </div>
          )}
        </div>
      )}

      {questions === null ? (
        <p className="text-sm text-muted-foreground">You don&apos;t have access to the question bank.</p>
      ) : questions.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed py-16 text-center">
          <HelpCircle className="h-8 w-8 text-muted-foreground" />
          <p className="font-medium">No questions yet</p>
          <p className="text-sm text-muted-foreground">
            {subjectOptions.length === 0 || classLevelOptions.length === 0
              ? "Create a subject and class level first, then add a question."
              : "Add your first question, or bulk import a CSV of choice questions."}
          </p>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Code</TableHead>
              <TableHead>Subject</TableHead>
              <TableHead>Class level</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Difficulty</TableHead>
              <TableHead>Marks</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {questions.map((question) => (
              <TableRow key={question.public_id}>
                <TableCell>
                  <Link
                    href={`/cbt-questions/${question.public_id}`}
                    className="font-medium text-primary hover:underline"
                  >
                    {question.code}
                  </Link>
                </TableCell>
                <TableCell>{subjectNameById.get(question.subject) ?? "Unknown"}</TableCell>
                <TableCell>{classLevelNameById.get(question.class_level) ?? "Unknown"}</TableCell>
                <TableCell>{cbtQuestionTypeLabel(question.question_type)}</TableCell>
                <TableCell className="capitalize">{question.difficulty}</TableCell>
                <TableCell>{question.marks}</TableCell>
                <TableCell>
                  <Badge variant={statusVariant(question.status)} className="capitalize">
                    {question.status}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
