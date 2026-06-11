import { DashboardShell } from "@/components/layout/dashboard-shell";

export default function InstructorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardShell role="instructor">{children}</DashboardShell>;
}
