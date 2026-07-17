"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { MenuIcon } from "lucide-react";
import { useEffect, useState } from "react";

import { UserMenu } from "@/components/layout/user-menu";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { APP_NAME, ROUTES } from "@/lib/constants";
import { NAVIGATION, type NavItem } from "@/lib/navigation";
import { useAuthHydrated } from "@/lib/use-auth-hydrated";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth-store";
import type { Role } from "@/types";

interface DashboardShellProps {
  role?: Role;
  children: React.ReactNode;
}

function SidebarBrand() {
  return (
    <div className="flex h-16 shrink-0 items-center gap-2.5 border-b border-sidebar-border/80 px-5">
      <Image
        src="/images/collabTrackLogo.png"
        alt={`${APP_NAME} logo`}
        width={28}
        height={28}
        priority
        style={{ width: 28, height: "auto" }}
      />
      <div className="leading-tight">
        <p className="font-heading text-sm font-semibold">{APP_NAME}</p>
        <p className="text-xs text-muted-foreground">Academic Analytics</p>
      </div>
    </div>
  );
}

function SidebarNavLinks({
  items,
  homeHref,
  pathname,
  onNavigate,
}: {
  items: NavItem[];
  homeHref: string;
  pathname: string;
  onNavigate?: () => void;
}) {
  return (
    <nav className="flex-1 space-y-1 overflow-y-auto p-3">
      {items.map((item) => {
        const active =
          pathname === item.href ||
          (item.href !== homeHref && pathname.startsWith(`${item.href}/`));

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
              active
                ? "bg-sidebar-primary/10 font-semibold text-sidebar-primary shadow-sm ring-1 ring-sidebar-primary/15 before:absolute before:top-1/2 before:left-0 before:h-5 before:w-1 before:-translate-y-1/2 before:rounded-r-full before:bg-sidebar-primary"
                : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            )}
          >
            <item.icon className="size-4 shrink-0" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

/**
 * Shared layout for the authenticated contexts (admin, instructor, student).
 * Guards access to the matching role and renders the sidebar + top bar.
 */
export function DashboardShell({ role, children }: DashboardShellProps) {
  const router = useRouter();
  const pathname = usePathname();
  const hydrated = useAuthHydrated();
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  useEffect(() => {
    if (!hydrated) return;

    if (!isAuthenticated) {
      router.replace(ROUTES.login);
    } else if (user && !user.role) {
      router.replace(ROUTES.onboarding);
    } else if (role && user?.role && user.role !== role) {
      router.replace(`/${user.role}`);
    }
  }, [hydrated, isAuthenticated, user, role, router]);

  if (
    !hydrated ||
    !isAuthenticated ||
    !user ||
    !user.role ||
    (role && user.role !== role)
  ) {
    return null;
  }

  const items = NAVIGATION[user.role];
  const homeHref = `/${user.role}`;

  return (
    <div className="flex h-svh overflow-hidden bg-background">
      <aside className="fixed inset-y-0 left-0 z-20 hidden h-svh w-64 flex-col border-r border-sidebar-border/80 bg-sidebar/95 shadow-sm backdrop-blur-sm md:flex">
        <SidebarBrand />
        <SidebarNavLinks
          items={items}
          homeHref={homeHref}
          pathname={pathname}
        />
      </aside>

      <div className="flex h-svh min-h-0 min-w-0 flex-1 flex-col md:ml-64">
        <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center justify-between gap-3 border-b border-border/60 bg-background/80 px-4 backdrop-blur-md sm:px-6">
          <div className="flex items-center gap-2 md:hidden">
            <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
              <SheetTrigger
                render={
                  <Button variant="ghost" size="icon-sm" aria-label="Open menu">
                    <MenuIcon />
                  </Button>
                }
              />
              <SheetContent side="left" className="w-72 p-0" showCloseButton>
                <SheetHeader className="sr-only">
                  <SheetTitle>Navigation</SheetTitle>
                </SheetHeader>
                <SidebarBrand />
                <SidebarNavLinks
                  items={items}
                  homeHref={homeHref}
                  pathname={pathname}
                  onNavigate={() => setMobileNavOpen(false)}
                />
              </SheetContent>
            </Sheet>
            <Image
              src="/images/collabTrackLogo.png"
              alt={`${APP_NAME} logo`}
              width={26}
              height={26}
              style={{ width: 26, height: "auto" }}
            />
          </div>
          <div className="ml-auto flex items-center gap-1.5">
            <ThemeToggle />
            <UserMenu />
          </div>
        </header>
        <main className="min-h-0 min-w-0 flex-1 overflow-x-hidden overflow-y-auto p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
