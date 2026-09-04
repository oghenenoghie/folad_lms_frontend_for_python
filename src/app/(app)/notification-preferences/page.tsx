import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { getNotificationPreference } from "@/lib/communication";
import { NotificationPreferencesForm } from "@/components/communication/notification-preferences-form";

export const metadata: Metadata = { title: "Notification preferences" };

export default async function NotificationPreferencesPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const preference = await getNotificationPreference();

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-6">
      <div>
        <h1 className="text-xl font-semibold">Notification preferences</h1>
        <p className="text-sm text-muted-foreground">Choose how you want to be notified.</p>
      </div>
      <NotificationPreferencesForm
        initialValues={{
          email_enabled: preference?.email_enabled ?? true,
          sms_enabled: preference?.sms_enabled ?? false,
          push_enabled: preference?.push_enabled ?? true,
          in_app_enabled: preference?.in_app_enabled ?? true,
        }}
      />
    </div>
  );
}
