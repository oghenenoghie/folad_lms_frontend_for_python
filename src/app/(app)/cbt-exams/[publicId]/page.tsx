import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { Pencil, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DeleteConfirmButton } from "@/components/schools/delete-confirm-button";
import { CBTExamEditFormDialog } from "@/components/cbt/admin/exam-form-dialog";
import { ExamSectionFormDialog } from "@/components/cbt/admin/exam-section-form-dialog";
import { ExamQuestionFormDialog } from "@/components/cbt/admin/exam-question-form-dialog";
import {
  ExamCandidateFormDialog,
  ExamCandidatesFromClassArmFormDialog,
} from "@/components/cbt/admin/exam-candidate-form-dialog";
import { ExamStatusActions } from "@/components/cbt/admin/exam-status-actions";
import {
  getCBTExamResult,
  getExamSections,
  getExamQuestions,
  getExamCandidates,
  getQuestions,
} from "@/lib/cbt";
import { getClassArms } from "@/lib/academics";
import { getStudentsBySchool } from "@/lib/students";
import { getAcademicYears } from "@/lib/schools";
import {
  updateCBTExam,
  deleteCBTExam,
  publishCBTExam,
  archiveCBTExam,
  addExamSection,
  updateExamSection,
  deleteExamSection,
  addExamQuestion,
  removeExamQuestion,
  addExamCandidate,
  removeExamCandidate,
  addExamCandidatesFromClassArm,
} from "@/lib/actions/cbt";
import {
  cbtExamSectionDefaults,
  cbtExamQuestionDefaults,
  cbtExamCandidateDefaults,
  cbtExamCandidatesFromClassArmDefaults,
  cbtQuestionTypeLabel,
} from "@/lib/cbt-forms";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ publicId: string }>;
}): Promise<Metadata> {
  const { publicId } = await params;
  const result = await getCBTExamResult(publicId);
  return { title: result.status === "ok" ? result.data.name : "CBT Exam" };
}

export default async function CBTExamDetailPage({
  params,
}: {
  params: Promise<{ publicId: string }>;
}) {
  const { publicId } = await params;
  const result = await getCBTExamResult(publicId);
  if (result.status === "forbidden") {
    return (
      <div className="mx-auto max-w-4xl space-y-6 p-6">
        <p className="text-sm text-muted-foreground">You don&apos;t have access to this exam.</p>
      </div>
    );
  }
  if (result.status === "not_found") notFound();
  const exam = result.data;
  const editable = exam.status === "draft";

  const [sections, examQuestions, candidates, bankQuestions, classArms, academicYears, students] =
    await Promise.all([
      getExamSections(publicId),
      getExamQuestions(publicId),
      getExamCandidates(publicId),
      getQuestions({ subjectId: exam.subject, classLevelId: exam.class_level }),
      getClassArms(),
      getAcademicYears(),
      getStudentsBySchool(exam.school),
    ]);

  const sortedSections = (sections ?? []).sort((a, b) => a.order - b.order);
  const sectionOptions = sortedSections.map((s) => ({ value: s.public_id, label: s.name }));
  const sectionNameById = new Map(sortedSections.map((s) => [s.public_id, s.name]));

  // Only approved/published questions are eligible to attach — see the
  // backend's EXAM_ELIGIBLE_QUESTION_STATUSES.
  const ELIGIBLE_STATUSES = new Set(["approved", "published"]);
  const attachedQuestionIds = new Set((examQuestions ?? []).map((eq) => eq.question));
  const availableBankQuestions = (bankQuestions ?? []).filter(
    (q) => ELIGIBLE_STATUSES.has(q.status) && !attachedQuestionIds.has(q.public_id)
  );
  const questionOptions = availableBankQuestions.map((q) => ({
    value: q.public_id,
    label: `${q.code} · ${cbtQuestionTypeLabel(q.question_type)} · ${q.marks} marks`,
  }));
  const bankQuestionById = new Map((bankQuestions ?? []).map((q) => [q.public_id, q]));

  const studentNameById = new Map(
    (students ?? []).map((s) => [s.public_id, `${s.first_name} ${s.last_name} (${s.admission_number})`])
  );
  const candidateStudentIds = new Set((candidates ?? []).map((c) => c.student));
  const studentOptions = (students ?? [])
    .filter((s) => !candidateStudentIds.has(s.public_id))
    .map((s) => ({ value: s.public_id, label: `${s.first_name} ${s.last_name} (${s.admission_number})` }));

  const classArmsForLevel = (classArms ?? []).filter((arm) => arm.class_level === exam.class_level);
  const classArmOptions = classArmsForLevel.map((arm) => ({ value: arm.public_id, label: arm.name }));
  const academicYearOptions = (academicYears ?? []).map((y) => ({ value: y.public_id, label: y.name }));

  const nextSectionOrder = sortedSections.length > 0 ? Math.max(...sortedSections.map((s) => s.order)) + 1 : 1;
  const nextQuestionOrder =
    (examQuestions ?? []).length > 0 ? Math.max(...(examQuestions ?? []).map((q) => q.order)) + 1 : 1;

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-semibold">{exam.name}</h1>
            <Badge variant="outline" className="capitalize">
              {exam.status}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            {exam.code} · {exam.duration_minutes} min · {exam.total_marks} marks · pass {exam.pass_mark}
          </p>
          <p className="text-sm text-muted-foreground">
            Opens {new Date(exam.start_at).toLocaleString()} · Closes {new Date(exam.end_at).toLocaleString()}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <ExamStatusActions
            status={exam.status}
            candidateCount={(candidates ?? []).length}
            questionCount={(examQuestions ?? []).length}
            onPublish={publishCBTExam.bind(null, exam.public_id)}
            onArchive={archiveCBTExam.bind(null, exam.public_id)}
          />
          {editable && (
            <CBTExamEditFormDialog
              trigger={
                <Button variant="secondary">
                  <Pencil className="h-4 w-4" />
                  Edit
                </Button>
              }
              title="Edit exam"
              defaultValues={{
                name: exam.name,
                exam_type: exam.exam_type,
                duration_minutes: exam.duration_minutes,
                pass_mark: exam.pass_mark,
                start_at: exam.start_at.slice(0, 16),
                end_at: exam.end_at.slice(0, 16),
                randomize_questions: exam.randomize_questions,
                randomize_options: exam.randomize_options,
                allow_resume: exam.allow_resume,
                negative_marking: exam.negative_marking,
              }}
              action={updateCBTExam.bind(null, exam.public_id)}
            />
          )}
          {editable && (
            <DeleteConfirmButton
              description="Delete this exam? Its sections, questions, and candidates go with it."
              action={deleteCBTExam.bind(null, exam.public_id)}
            />
          )}
        </div>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Sections</CardTitle>
          {editable && (
            <ExamSectionFormDialog
              trigger={
                <Button size="sm" variant="secondary">
                  <Plus className="h-4 w-4" />
                  Add section
                </Button>
              }
              title="Add section"
              defaultValues={{ ...cbtExamSectionDefaults, order: nextSectionOrder }}
              action={addExamSection.bind(null, exam.public_id)}
            />
          )}
        </CardHeader>
        <CardContent className="space-y-2">
          {sortedSections.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No sections — optional. Questions can be attached directly without one.
            </p>
          ) : (
            sortedSections.map((section) => (
              <div key={section.public_id} className="flex items-center justify-between rounded-md border p-3">
                <div>
                  <p className="text-sm font-medium">
                    {section.order}. {section.name}
                  </p>
                  {section.instructions && (
                    <p className="text-sm text-muted-foreground">{section.instructions}</p>
                  )}
                </div>
                {editable && (
                  <div className="flex items-center gap-1">
                    <ExamSectionFormDialog
                      trigger={
                        <Button variant="ghost" size="icon-sm">
                          <Pencil className="h-4 w-4" />
                        </Button>
                      }
                      title="Edit section"
                      defaultValues={{
                        name: section.name,
                        instructions: section.instructions ?? "",
                        order: section.order,
                      }}
                      action={updateExamSection.bind(null, exam.public_id, section.public_id)}
                    />
                    <DeleteConfirmButton
                      description="Delete this section? Questions in it become unsectioned."
                      action={deleteExamSection.bind(null, exam.public_id, section.public_id)}
                    />
                  </div>
                )}
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Questions ({(examQuestions ?? []).length})</CardTitle>
          {editable && questionOptions.length > 0 && (
            <ExamQuestionFormDialog
              trigger={
                <Button size="sm" variant="secondary">
                  <Plus className="h-4 w-4" />
                  Add question
                </Button>
              }
              title="Attach a bank question"
              defaultValues={{ ...cbtExamQuestionDefaults, order: nextQuestionOrder }}
              questionOptions={questionOptions}
              sectionOptions={sectionOptions}
              action={addExamQuestion.bind(null, exam.public_id)}
            />
          )}
        </CardHeader>
        <CardContent className="space-y-2">
          {(examQuestions ?? []).length === 0 ? (
            <p className="text-sm text-muted-foreground">
              {questionOptions.length === 0
                ? "No approved bank questions available for this subject/class level yet — approve one in the question bank first."
                : "No questions attached yet."}
            </p>
          ) : (
            [...(examQuestions ?? [])]
              .sort((a, b) => a.order - b.order)
              .map((eq) => {
                const question = bankQuestionById.get(eq.question);
                return (
                  <div key={eq.public_id} className="flex items-center justify-between rounded-md border p-3">
                    <div className="text-sm">
                      <Link
                        href={`/cbt-questions/${eq.question}`}
                        className="font-medium text-primary hover:underline"
                      >
                        {question?.code ?? eq.question}
                      </Link>
                      <span className="text-muted-foreground">
                        {" "}
                        · {question ? cbtQuestionTypeLabel(question.question_type) : "unknown type"} ·{" "}
                        {eq.effective_marks} marks
                        {eq.section && ` · ${sectionNameById.get(eq.section) ?? "unknown section"}`}
                      </span>
                    </div>
                    {editable && (
                      <DeleteConfirmButton
                        description="Remove this question from the exam?"
                        action={removeExamQuestion.bind(null, exam.public_id, eq.public_id)}
                      />
                    )}
                  </div>
                );
              })
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Candidates ({(candidates ?? []).length})</CardTitle>
          {editable && (
            <div className="flex items-center gap-2">
              {classArmOptions.length > 0 && academicYearOptions.length > 0 && (
                <ExamCandidatesFromClassArmFormDialog
                  trigger={
                    <Button size="sm" variant="outline">
                      From class arm
                    </Button>
                  }
                  title="Add candidates from a class arm"
                  defaultValues={cbtExamCandidatesFromClassArmDefaults}
                  classArmOptions={classArmOptions}
                  academicYearOptions={academicYearOptions}
                  action={addExamCandidatesFromClassArm.bind(null, exam.public_id)}
                />
              )}
              {studentOptions.length > 0 && (
                <ExamCandidateFormDialog
                  trigger={
                    <Button size="sm" variant="secondary">
                      <Plus className="h-4 w-4" />
                      Add student
                    </Button>
                  }
                  title="Add a candidate"
                  defaultValues={cbtExamCandidateDefaults}
                  studentOptions={studentOptions}
                  action={addExamCandidate.bind(null, exam.public_id)}
                />
              )}
            </div>
          )}
        </CardHeader>
        <CardContent className="space-y-2">
          {(candidates ?? []).length === 0 ? (
            <p className="text-sm text-muted-foreground">No candidates yet.</p>
          ) : (
            candidates!.map((candidate) => (
              <div key={candidate.public_id} className="flex items-center justify-between rounded-md border p-3">
                <div className="text-sm">
                  <span className="font-medium">{candidate.candidate_number}</span>{" "}
                  {studentNameById.get(candidate.student) ?? candidate.student}
                  {!candidate.is_eligible && (
                    <Badge variant="outline" className="ml-2">
                      Not eligible
                    </Badge>
                  )}
                  {candidate.extra_time_minutes > 0 && (
                    <span className="ml-2 text-muted-foreground">+{candidate.extra_time_minutes} min</span>
                  )}
                </div>
                {editable && (
                  <DeleteConfirmButton
                    description="Remove this candidate from the exam?"
                    action={removeExamCandidate.bind(null, exam.public_id, candidate.public_id)}
                  />
                )}
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
