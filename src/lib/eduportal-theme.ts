// Color palette mirrored from the reference dashboard the user pointed to
// (https://hr-payroll-wagebook.vercel.app/) — a warm cream/forest-green
// fintech palette, used consistently across every admin dashboard widget
// (Tailwind arbitrary-value classes in JSX; these raw hex values are for
// chart.js configs, which render to a <canvas> outside Tailwind's reach).
export const EDUPORTAL_COLORS = {
  bg: "#f8f5ea",
  surface: "#fdfcf8",
  border: "#e2ded0",
  ink: "#1d1b10",
  inkSoft: "#615e51",
  primary: "#104625",
  primaryDark: "#002d12",
  primaryTint: "#ddf1e1",
  accent: "#bd7138",
  accentTint: "#ffe1cd",
  good: "#22864a",
  goodTint: "#d0f2d8",
  warn: "#ce871b",
  warnTint: "#ffe6ca",
  bad: "#c13c3b",
  badTint: "#ffe0dc",
} as const;
