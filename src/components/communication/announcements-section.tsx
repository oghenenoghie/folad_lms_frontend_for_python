import { Megaphone, Pencil, Plus, Send } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AnnouncementFormDialog } from "@/components/communication/announcement-form-dialog";
import { AnnouncementActionButton } from "@/components/communication/announcement-action-button";
import { DeleteConfirmButton } from "@/components/schools/delete-confirm-button";
import { getAnnouncements } from "@/lib/communication";
import { createAnnouncement, updateAnnouncement, deleteAnnouncement, publishAnnouncement } from "@/lib/actions/communication";
import { announcementDefaults, announcementAudienceLabel } from "@/lib/communication-forms";

export async function AnnouncementsSection({ schoolId }: { schoolId: string }) {
  const announcements = await getAnnouncements(schoolId);
  if (announcements === null) return null;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Announcements</CardTitle>
        <AnnouncementFormDialog
          trigger={
            <Button size="sm" variant="secondary">
              <Plus className="h-4 w-4" />
              New announcement
            </Button>
          }
          title="New announcement"
          defaultValues={announcementDefaults}
          action={createAnnouncement.bind(null, schoolId)}
        />
      </CardHeader>
      <CardContent>
        {announcements.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-8 text-center">
            <Megaphone className="h-6 w-6 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">No announcements yet.</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Audience</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-1" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {announcements.map((announcement) => (
                <TableRow key={announcement.public_id}>
                  <TableCell>
                    {announcement.title}
                    {announcement.is_pinned && (
                      <Badge variant="outline" className="ml-2">
                        Pinned
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>{announcementAudienceLabel(announcement.audience)}</TableCell>
                  <TableCell>
                    <Badge variant={announcement.published_at ? "default" : "secondary"}>
                      {announcement.published_at ? "Published" : "Draft"}
                    </Badge>
                  </TableCell>
                  <TableCell className="flex justify-end gap-1">
                    {!announcement.published_at && (
                      <AnnouncementActionButton
                        label="Publish"
                        icon={<Send className="h-4 w-4" />}
                        action={publishAnnouncement.bind(null, schoolId, announcement.public_id)}
                      />
                    )}
                    <AnnouncementFormDialog
                      trigger={
                        <Button variant="ghost" size="icon-sm">
                          <Pencil className="h-4 w-4" />
                        </Button>
                      }
                      title="Edit announcement"
                      defaultValues={{
                        title: announcement.title,
                        body: announcement.body,
                        audience: announcement.audience,
                        is_pinned: announcement.is_pinned,
                      }}
                      action={updateAnnouncement.bind(null, schoolId, announcement.public_id)}
                    />
                    <DeleteConfirmButton
                      description={`Delete announcement "${announcement.title}"?`}
                      action={deleteAnnouncement.bind(null, schoolId, announcement.public_id)}
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
