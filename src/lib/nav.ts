import type { LucideIcon } from "lucide-react";
import {
  Briefcase,
  Building2,
  CalendarCheck,
  ClipboardCheck,
  ClipboardList,
  CreditCard,
  GraduationCap,
  HeartHandshake,
  LayoutDashboard,
  NotebookPen,
  Shield,
} from "lucide-react";

export type NavItem = {
  label: string;
  icon: LucideIcon;
  href?: string;
  enabled: boolean;
};

export type NavSection = {
  heading?: string;
  items: NavItem[];
};

// Originally mirrored apps/web/context_processors.py::nav_items (the
// server-rendered Django UI's own nav) 1:1. This repo is now the primary
// frontend going forward, so its IA is free to move ahead of the Django
// UI's — "Examinations" below has no Django-UI counterpart yet. Only
// modules with a real page are enabled; the rest preview the intended
// structure as "Soon".
export const NAV_SECTIONS: NavSection[] = [
  {
    items: [
      { label: "Dashboard", icon: LayoutDashboard, href: "/dashboard", enabled: true },
    ],
  },
  {
    heading: "School",
    items: [
      { label: "Students", icon: GraduationCap, enabled: false },
      { label: "Staff & teachers", icon: Briefcase, href: "/staff", enabled: true },
      { label: "Parents & guardians", icon: HeartHandshake, enabled: false },
      { label: "Schools & academics", icon: Building2, href: "/schools", enabled: true },
    ],
  },
  {
    heading: "Examinations",
    items: [
      { label: "Assessments", icon: ClipboardList, href: "/assessments", enabled: true },
      { label: "My Exams", icon: NotebookPen, href: "/my-exams", enabled: true },
    ],
  },
  {
    heading: "Assignments",
    items: [{ label: "My Assignments", icon: ClipboardCheck, href: "/my-assignments", enabled: true }],
  },
  {
    heading: "Attendance",
    items: [{ label: "My Attendance", icon: CalendarCheck, href: "/my-attendance", enabled: true }],
  },
  {
    heading: "Fees",
    items: [{ label: "My Fees", icon: CreditCard, href: "/my-fees", enabled: true }],
  },
  {
    heading: "Administration",
    items: [{ label: "Users & roles", icon: Shield, enabled: false }],
  },
];
