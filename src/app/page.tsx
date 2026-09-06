import Link from "next/link";
import type { Metadata } from "next";
import { GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "Welcome" };

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-muted/30 p-4 text-center">
      <GraduationCap className="h-12 w-12 text-primary" />
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold">FOLAD KIDDIES SCHOOL</h1>
        <p className="max-w-sm text-sm text-muted-foreground">
          The school&apos;s learning management system — attendance, results, fees, messages, and more, all in one
          place.
        </p>
      </div>
      <Button asChild size="lg">
        <Link href="/dashboard">Go to dashboard</Link>
      </Button>
    </div>
  );
}
