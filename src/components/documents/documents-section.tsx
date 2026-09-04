import { FileText, Pencil, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DocumentUploadDialog } from "@/components/documents/document-upload-dialog";
import { DocumentEditFormDialog } from "@/components/documents/document-edit-form-dialog";
import { DocumentDownloadButton } from "@/components/documents/document-download-button";
import { DeleteConfirmButton } from "@/components/schools/delete-confirm-button";
import { getDocuments, type DocumentOwnerType } from "@/lib/documents";
import { uploadDocument, updateDocument, deleteDocument } from "@/lib/actions/documents";
import { formatFileSize } from "@/lib/documents-forms";

export async function DocumentsSection({
  ownerType,
  ownerId,
  schoolId,
}: {
  ownerType: DocumentOwnerType;
  ownerId: string;
  schoolId: string;
}) {
  const documents = await getDocuments(
    ownerType === "student" ? { studentId: ownerId } : { staffId: ownerId }
  );
  if (documents === null) return null;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Documents</CardTitle>
        <DocumentUploadDialog
          trigger={
            <Button size="sm" variant="secondary">
              <Plus className="h-4 w-4" />
              Upload document
            </Button>
          }
          action={uploadDocument.bind(null, schoolId, ownerType, ownerId)}
        />
      </CardHeader>
      <CardContent>
        {documents.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-8 text-center">
            <FileText className="h-6 w-6 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">No documents yet.</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>File</TableHead>
                <TableHead>Uploaded</TableHead>
                <TableHead className="w-1" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {documents.map((document) => (
                <TableRow key={document.public_id}>
                  <TableCell className="font-medium">{document.title}</TableCell>
                  <TableCell>{document.document_type}</TableCell>
                  <TableCell>
                    {document.file_name}
                    <span className="text-muted-foreground"> · {formatFileSize(document.size_bytes)}</span>
                  </TableCell>
                  <TableCell>{document.created_at.slice(0, 10)}</TableCell>
                  <TableCell className="flex justify-end gap-1">
                    <DocumentDownloadButton publicId={document.public_id} />
                    <DocumentEditFormDialog
                      trigger={
                        <Button variant="ghost" size="icon-sm">
                          <Pencil className="h-4 w-4" />
                        </Button>
                      }
                      title="Edit document"
                      defaultValues={{
                        document_type: document.document_type,
                        title: document.title,
                      }}
                      action={updateDocument.bind(null, ownerType, ownerId, document.public_id)}
                    />
                    <DeleteConfirmButton
                      description={`Delete document "${document.title}"? This cannot be undone.`}
                      action={deleteDocument.bind(null, ownerType, ownerId, document.public_id)}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
