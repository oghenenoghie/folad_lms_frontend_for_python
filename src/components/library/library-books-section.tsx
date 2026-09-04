import { BookOpen, Pencil, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookFormDialog } from "@/components/library/book-form-dialog";
import { CopyFormDialog } from "@/components/library/copy-form-dialog";
import { DeleteConfirmButton } from "@/components/schools/delete-confirm-button";
import { getLibraryBooks, getLibraryCopies, type LibraryBook, type LibraryCopy } from "@/lib/library";
import { createBook, updateBook, deleteBook, createCopy, updateCopy, deleteCopy } from "@/lib/actions/library";
import { bookDefaults, copyDefaults } from "@/lib/library-forms";

const COPY_STATUS_VARIANT: Record<LibraryCopy["status"], "default" | "secondary" | "destructive" | "outline"> = {
  available: "default",
  loaned: "secondary",
  lost: "destructive",
  damaged: "destructive",
};

function CopyRow({ schoolId, copy }: { schoolId: string; copy: LibraryCopy }) {
  return (
    <div className="flex items-center justify-between rounded-md bg-muted/50 px-3 py-1.5 text-sm">
      <span className="flex items-center gap-2">
        #{copy.copy_number}
        <Badge variant={COPY_STATUS_VARIANT[copy.status]}>{copy.status}</Badge>
      </span>
      <div className="flex items-center gap-1">
        <CopyFormDialog
          trigger={
            <Button variant="ghost" size="icon-sm">
              <Pencil className="h-3.5 w-3.5" />
            </Button>
          }
          title="Edit copy"
          defaultValues={{ copy_number: copy.copy_number }}
          action={updateCopy.bind(null, schoolId, copy.public_id)}
        />
        <DeleteConfirmButton
          description={`Delete copy #${copy.copy_number}?`}
          action={deleteCopy.bind(null, schoolId, copy.public_id)}
        />
      </div>
    </div>
  );
}

async function BookCard({ schoolId, book }: { schoolId: string; book: LibraryBook }) {
  const copies = await getLibraryCopies(book.public_id);

  return (
    <div className="rounded-lg border">
      <div className="flex items-center justify-between gap-3 border-b px-4 py-3">
        <div>
          <p className="font-medium">{book.title}</p>
          <p className="text-sm text-muted-foreground">
            {book.author || "Unknown author"}
            {book.category && ` · ${book.category}`}
          </p>
        </div>
        <div className="flex items-center gap-1">
          <BookFormDialog
            trigger={
              <Button variant="ghost" size="icon-sm">
                <Pencil className="h-4 w-4" />
              </Button>
            }
            title="Edit book"
            defaultValues={{
              title: book.title,
              isbn: book.isbn,
              author: book.author,
              publisher: book.publisher,
              category: book.category,
              published_year: book.published_year ? String(book.published_year) : "",
            }}
            action={updateBook.bind(null, schoolId, book.public_id)}
          />
          <DeleteConfirmButton
            description={`Delete ${book.title}? Its copies go with it.`}
            action={deleteBook.bind(null, schoolId, book.public_id)}
          />
        </div>
      </div>

      {copies !== null && (
        <div className="px-4 py-3">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Copies</p>
            <CopyFormDialog
              trigger={
                <button type="button" className="text-xs font-medium text-primary hover:underline">
                  + Add copy
                </button>
              }
              title="New copy"
              defaultValues={copyDefaults}
              action={createCopy.bind(null, schoolId, book.public_id)}
            />
          </div>
          {copies.length === 0 ? (
            <p className="text-sm text-muted-foreground">No copies yet.</p>
          ) : (
            <div className="space-y-1.5">
              {copies.map((copy) => (
                <CopyRow key={copy.public_id} schoolId={schoolId} copy={copy} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export async function LibraryBooksSection({ schoolId }: { schoolId: string }) {
  const books = await getLibraryBooks(schoolId);
  if (books === null) return null;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Library books</CardTitle>
        <BookFormDialog
          trigger={
            <Button size="sm" variant="secondary">
              <Plus className="h-4 w-4" />
              New book
            </Button>
          }
          title="New book"
          defaultValues={bookDefaults}
          action={createBook.bind(null, schoolId)}
        />
      </CardHeader>
      <CardContent className="space-y-4">
        {books.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-8 text-center">
            <BookOpen className="h-6 w-6 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">No books in the catalogue yet.</p>
          </div>
        ) : (
          books.map((book) => <BookCard key={book.public_id} schoolId={schoolId} book={book} />)
        )}
      </CardContent>
    </Card>
  );
}
