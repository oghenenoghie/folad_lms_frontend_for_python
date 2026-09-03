import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { getMySummary } from "@/lib/dashboard";
import { AppShellWithAuth } from "@/components/layout/app-shell-with-auth";

export default async function AppLayout({ children }: { children: ReactNode }) {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  // Same role classification the dashboard page itself uses — drives which
  // sidebar modules are shown (see lib/nav.ts's visibleNavSections).
  const summary = await getMySummary();

  return (
    <AppShellWithAuth user={user} role={summary?.role ?? null}>
      {children}
    </AppShellWithAuth>
  );
}
