"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { updateNotificationPreferences } from "@/lib/actions/communication";

const schema = z.object({
  email_enabled: z.boolean(),
  sms_enabled: z.boolean(),
  push_enabled: z.boolean(),
  in_app_enabled: z.boolean(),
});
type FormValues = z.infer<typeof schema>;

const CHANNELS: { name: keyof FormValues; label: string; description: string }[] = [
  { name: "in_app_enabled", label: "In-app", description: "Show notifications in the notification center." },
  { name: "email_enabled", label: "Email", description: "Send a copy of notifications to your email address." },
  { name: "push_enabled", label: "Push", description: "Send push notifications to your device." },
  { name: "sms_enabled", label: "SMS", description: "Send a text message for important notifications." },
];

export function NotificationPreferencesForm({ initialValues }: { initialValues: FormValues }) {
  const form = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: initialValues });

  async function onSubmit(values: FormValues) {
    const result = await updateNotificationPreferences(values);
    if (result.success) {
      toast.success(result.message ?? "Preferences saved");
      form.reset(values);
    } else {
      toast.error(result.errors?.join(" ") || result.message || "Something went wrong");
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Notification channels</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-4">
              {CHANNELS.map((channel) => (
                <FormField
                  key={channel.name}
                  control={form.control}
                  name={channel.name}
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                      <div className="space-y-0.5">
                        <FormLabel className="text-sm font-medium">{channel.label}</FormLabel>
                        <p className="text-sm text-muted-foreground">{channel.description}</p>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              ))}
            </div>
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
              Save preferences
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
