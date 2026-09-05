import type { LucideIcon } from "lucide-react";
import {
  BedDouble,
  Briefcase,
  Building2,
  BookOpen,
  Bus,
  CalendarCheck,
  CalendarDays,
  ClipboardCheck,
  ClipboardList,
  CreditCard,
  FileBarChart,
  FileText,
  GraduationCap,
  HeartHandshake,
  LayoutDashboard,
  NotebookPen,
  Shield,
} from "lucide-react";

// Mirrors apps.dashboards.services.dashboard_service.get_summary's role
// classification (student > teacher/staff > guardian > admin, by linked
// profile) — a signed-in user only ever gets one of these.
export type NavAudience = "admin" | "teacher" | "staff" | "guardian" | "student";

export type NavItem = {
  label: string;
  icon: LucideIcon;
  href?: string;
  enabled: boolean;
  /** Who this module is for. A student account has no use for "Staff &
   * teachers" (that's other people's records, not theirs) any more than a
   * guardian does — this is what keeps that off their sidebar. */
  audience: NavAudience[];
};

export type NavSection = {
  heading?: string;
  items: NavItem[];
};

const ALL_AUDIENCES: NavAudience[] = ["admin", "teacher", "staff", "guardian", "student"];
const MANAGEMENT: NavAudience[] = ["admin", "teacher", "staff"];
const TEACHING: NavAudience[] = ["admin", "teacher"];

// Originally mirrored apps/web/context_processors.py::nav_items (the
// server-rendered Django UI's own nav) 1:1. This repo is now the primary
// frontend going forward, so its IA is free to move ahead of the Django
// UI's — "Examinations" below has no Django-UI counterpart yet. Only
// modules with a real page are enabled; the rest preview the intended
// structure as "Soon".
export const NAV_SECTIONS: NavSection[] = [
  {
    items: [
      { label: "Dashboard", icon: LayoutDashboard, href: "/dashboard", enabled: true, audience: ALL_AUDIENCES },
    ],
  },
  {
    heading: "School",
    items: [
      { label: "Students", icon: GraduationCap, href: "/students", enabled: true, audience: MANAGEMENT },
      { label: "Staff & teachers", icon: Briefcase, href: "/staff", enabled: true, audience: MANAGEMENT },
      {
        label: "Parents & guardians",
        icon: HeartHandshake,
        href: "/guardians",
        enabled: true,
        audience: MANAGEMENT,
      },
      {
        label: "Schools & academics",
        icon: Building2,
        href: "/schools",
        enabled: true,
        audience: MANAGEMENT,
      },
    ],
  },
  {
    heading: "Examinations",
    items: [
      { label: "Assessments", icon: ClipboardList, href: "/assessments", enabled: true, audience: TEACHING },
      { label: "Exams", icon: NotebookPen, href: "/exams", enabled: true, audience: MANAGEMENT },
      { label: "My Exams", icon: NotebookPen, href: "/my-exams", enabled: true, audience: ["student"] },
    ],
  },
  {
    heading: "Assignments",
    items: [
      { label: "Assignments", icon: ClipboardCheck, href: "/assignments", enabled: true, audience: TEACHING },
      {
        label: "My Assignments",
        icon: ClipboardCheck,
        href: "/my-assignments",
        enabled: true,
        audience: ["student"],
      },
    ],
  },
  {
    heading: "Attendance",
    items: [
      {
        label: "Take Attendance",
        icon: CalendarCheck,
        href: "/attendance",
        enabled: true,
        audience: TEACHING,
      },
      {
        label: "My Attendance",
        icon: CalendarCheck,
        href: "/my-attendance",
        enabled: true,
        audience: ["student"],
      },
    ],
  },
  {
    heading: "Timetable",
    items: [
      { label: "Timetable", icon: CalendarDays, href: "/timetable", enabled: true, audience: TEACHING },
    ],
  },
  {
    heading: "Fees",
    items: [
      { label: "Invoices", icon: CreditCard, href: "/invoices", enabled: true, audience: MANAGEMENT },
      { label: "My Fees", icon: CreditCard, href: "/my-fees", enabled: true, audience: ["student"] },
    ],
  },
  {
    heading: "Report Cards",
    items: [
      { label: "Report Cards", icon: FileText, href: "/report-cards", enabled: true, audience: MANAGEMENT },
      {
        label: "My Report Cards",
        icon: FileText,
        href: "/my-report-cards",
        enabled: true,
        audience: ["student"],
      },
      {
        label: "My Children's Report Cards",
        icon: FileText,
        href: "/my-childrens-report-cards",
        enabled: true,
        audience: ["guardian"],
      },
    ],
  },
  {
    heading: "Library",
    items: [
      { label: "Library Desk", icon: BookOpen, href: "/library-desk", enabled: true, audience: MANAGEMENT },
      { label: "My Library", icon: BookOpen, href: "/my-library", enabled: true, audience: ["student"] },
    ],
  },
  {
    heading: "Hostel",
    items: [
      { label: "Hostel Desk", icon: BedDouble, href: "/hostel-desk", enabled: true, audience: MANAGEMENT },
    ],
  },
  {
    heading: "Transport",
    items: [
      { label: "Transport Desk", icon: Bus, href: "/transport-desk", enabled: true, audience: MANAGEMENT },
    ],
  },
  {
    heading: "Reports",
    items: [{ label: "Reports", icon: FileBarChart, href: "/reports", enabled: true, audience: MANAGEMENT }],
  },
  {
    heading: "Administration",
    items: [{ label: "Users & roles", icon: Shield, href: "/users", enabled: true, audience: ["admin"] }],
  },
];

/** Sections visible to `role`, with items the role has no use for dropped —
 * and any section left with no items dropped entirely, so a student never
 * sees a bare "School" heading over nothing. `role` is
 * DashboardSummary["role"] from lib/dashboard.ts (not imported directly to
 * keep this client-safe module free of that file's "server-only" import);
 * null (summary fetch failed) falls back to the unfiltered nav rather than
 * guessing wrong and hiding something a real admin/staff account needs. */
export function visibleNavSections(role: NavAudience | null): NavSection[] {
  if (role === null) return NAV_SECTIONS;
  return NAV_SECTIONS.map((section) => ({
    ...section,
    items: section.items.filter((item) => item.audience.includes(role)),
  })).filter((section) => section.items.length > 0);
}
