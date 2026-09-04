import { z } from "zod";
import type { FieldConfig, SelectOption } from "@/components/schools/entity-form-dialog";

export const announcementAudienceOptions: SelectOption[] = [
  { value: "all", label: "Everyone" },
  { value: "students", label: "Students" },
  { value: "staff", label: "Staff" },
  { value: "parents", label: "Parents" },
];

export function announcementAudienceLabel(audience: string): string {
  return announcementAudienceOptions.find((option) => option.value === audience)?.label ?? audience;
}

// published_at isn't a form field — it's flipped by the dedicated "Publish"
// action (apps.communication.views.AnnouncementPublishView), not by an
// edit, so a draft can be revised freely right up until it goes out.
export const announcementSchema = z.object({
  title: z.string().min(1, "Title is required"),
  body: z.string().min(1, "Body is required"),
  audience: z.enum(["all", "students", "staff", "parents"]),
  is_pinned: z.boolean(),
});
export type AnnouncementFormValues = z.infer<typeof announcementSchema>;

export const announcementFields: FieldConfig<AnnouncementFormValues>[] = [
  { name: "title", label: "Title", type: "text" },
  { name: "body", label: "Body", type: "textarea" },
  { name: "audience", label: "Audience", type: "select", options: announcementAudienceOptions },
  { name: "is_pinned", label: "Pinned", type: "checkbox" },
];

export const announcementDefaults: AnnouncementFormValues = {
  title: "",
  body: "",
  audience: "all",
  is_pinned: false,
};
