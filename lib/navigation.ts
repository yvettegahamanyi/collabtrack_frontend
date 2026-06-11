import {
  BarChart3,
  FileBarChart,
  LayoutDashboard,
  Settings,
  Upload,
  Users,
  type LucideIcon,
} from "lucide-react";

import type { Role } from "@/types";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

export const NAVIGATION: Record<Role, NavItem[]> = {
  admin: [
    { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { label: "Users", href: "/admin/users", icon: Users },
    { label: "Reports", href: "/admin/reports", icon: BarChart3 },
    { label: "Settings", href: "/admin/settings", icon: Settings },
  ],
  instructor: [
    { label: "Dashboard", href: "/instructor", icon: LayoutDashboard },
    { label: "Settings", href: "/instructor/settings", icon: Settings },
  ],
  student: [
    { label: "Dashboard", href: "/student", icon: LayoutDashboard },
    { label: "My Group", href: "/student/group", icon: Users },
    {
      label: "Contribution Report",
      href: "/student/report",
      icon: FileBarChart,
    },
    { label: "Upload Transcript", href: "/student/upload", icon: Upload },
    { label: "Settings", href: "/student/settings", icon: Settings },
  ],
};
