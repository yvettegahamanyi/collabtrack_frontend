"use client";

import { GraduationCapIcon, UsersIcon, type LucideIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { toast } from "sonner";

import { Logo } from "@/components/brand/logo";
import { Card } from "@/components/ui/card";
import { ROLE_HOME, ROUTES } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth-store";
import type { Role } from "@/types";

interface RoleOption {
  role: Extract<Role, "student" | "instructor">;
  title: string;
  description: string;
  icon: LucideIcon;
}

const OPTIONS: RoleOption[] = [
  {
    role: "student",
    title: "Student",
    description: "Collaborate with peers on project tracks.",
    icon: GraduationCapIcon,
  },
  {
    role: "instructor",
    title: "Instructor / Lecturer",
    description:
      "Manage teaching assistants, course labs, and oversee cohort performance.",
    icon: UsersIcon,
  },
];

export default function OnboardingPage() {
  const router = useRouter();
  const pendingRegistration = useAuthStore((s) => s.pendingRegistration);
  const completeOnboarding = useAuthStore((s) => s.completeOnboarding);

  useEffect(() => {
    if (!pendingRegistration) {
      router.replace(ROUTES.register);
    }
  }, [pendingRegistration, router]);

  const handleSelect = (role: RoleOption["role"]) => {
    const user = completeOnboarding(role);
    if (!user) {
      router.replace(ROUTES.register);
      return;
    }
    toast.success(`You're all set, ${user.name}!`);
    router.push(ROLE_HOME[role]);
  };

  return (
    <div className="flex min-h-svh flex-col">
      <header className="flex h-16 items-center border-b px-6">
        <Logo href="" />
      </header>

      <main className="flex flex-1 flex-col items-center justify-center px-6 py-16">
        <h1 className="text-3xl font-semibold tracking-tight text-primary">
          Who are you?
        </h1>
        <p className="mt-2 text-muted-foreground">
          Tell us your role to personalize your academic experience.
        </p>

        <div className="mt-10 grid w-full max-w-2xl gap-5 sm:grid-cols-2">
          {OPTIONS.map((option) => (
            <Card
              key={option.role}
              role="button"
              tabIndex={0}
              onClick={() => handleSelect(option.role)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  handleSelect(option.role);
                }
              }}
              className={cn(
                "cursor-pointer items-center p-8 text-center transition-all",
                "hover:border-primary/40 hover:shadow-md focus-visible:border-primary focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
              )}
            >
              <span className="flex size-14 items-center justify-center rounded-full bg-secondary text-primary">
                <option.icon className="size-7" />
              </span>
              <h2 className="mt-4 text-lg font-semibold text-primary">
                {option.title}
              </h2>
              <p className="mt-1 max-w-xs text-sm text-muted-foreground">
                {option.description}
              </p>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}
