import { z } from "zod";
import type { FieldConfig } from "@/components/schools/entity-form-dialog";

// Metadata-only edit — file_name/content_type/size_bytes are immutable once
// uploaded (apps.documents.serializers.DocumentSerializer's read_only_fields);
// replacing the file itself means deleting and re-uploading.
export const documentEditSchema = z.object({
  document_type: z.string().min(1, "Document type is required"),
  title: z.string().min(1, "Title is required"),
});
export type DocumentEditFormValues = z.infer<typeof documentEditSchema>;

export const documentEditFields: FieldConfig<DocumentEditFormValues>[] = [
  { name: "document_type", label: "Document type", type: "text" },
  { name: "title", label: "Title", type: "text" },
];

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
