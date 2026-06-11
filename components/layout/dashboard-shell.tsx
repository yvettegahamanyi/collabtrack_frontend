"use client";

import { BellIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

import { UserMenu } from "@/components/layout/user-menu";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { APP_NAME, ROUTES } from "@/lib/constants";
import { NAVIGATION } from "@/lib/navigation";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth-store";
import type { Role } from "@/types";

interface DashboardShellProps {
  role: Role;
  children: React.ReactNode;
}

/**
 * Shared layout for the authenticated contexts (admin, instructor, student).
 * Guards access to the matching role and renders the sidebar + top bar.
 */
export function DashboardShell({ role, children }: DashboardShellProps) {
  const router = useRouter();
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace(ROUTES.login);
    } else if (user && user.role !== role) {
      router.replace(`/${user.role}`);
    }
  }, [isAuthenticated, user, role, router]);

  if (!isAuthenticated || !user || user.role !== role) {
    return null;
  }

  const items = NAVIGATION[role];

  return (
    <div className="flex min-h-svh bg-muted/30">
      <aside className="hidden w-64 shrink-0 flex-col border-r bg-sidebar text-sidebar-foreground md:flex">
        <div className="flex h-16 items-center gap-2.5 border-b px-5">
          <Image
            src="/images/collabTrackLogo.png"
            alt={`${APP_NAME} logo`}
            width={28}
            height={28}
            priority
            style={{ width: 28, height: "auto" }}
          />
          <div className="leading-tight">
            <p className="text-sm font-semibold">{APP_NAME}</p>
            <p className="text-xs text-muted-foreground">Academic Analytics</p>
          </div>
        </div>
        <nav className="flex-1 space-y-1 p-3">
          {items.map((item) => {
            const active =
              pathname === item.href ||
              (item.href !== `/${role}` && pathname.startsWith(`${item.href}/`));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  active
                    ? "bg-sidebar-primary text-sidebar-primary-foreground"
                    : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                )}
              >
                <item.icon className="size-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      <div className="flex flex-1 flex-col">
        <header className="flex h-16 items-center justify-between gap-3 border-b bg-background px-4 sm:px-6">
          <span className="md:hidden">
            <Image
              src="/images/collabTrackLogo.png"
              alt={`${APP_NAME} logo`}
              width={26}
              height={26}
              style={{ width: 26, height: "auto" }}
            />
          </span>
          <div className="ml-auto flex items-center gap-1.5">
            <ThemeToggle />
            <Button
              variant="ghost"
              size="icon"
              aria-label="Notifications"
              className="relative"
            >
              <BellIcon />
              <span className="absolute top-2 right-2 size-1.5 rounded-full bg-destructive" />
            </Button>
            <UserMenu />
          </div>
        </header>
        <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
