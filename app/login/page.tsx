"use client";

import { EyeIcon, EyeOffIcon, LockIcon, LogInIcon, MailIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { AuthLayout } from "@/components/auth/auth-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { APP_NAME, ROUTES } from "@/lib/constants";
import { useAuthStore } from "@/stores/auth-store";

export default function LoginPage() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // NOTE: demo sign-in. Replace with a real TanStack Query mutation later.
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Enter your email and password");
      return;
    }
    setAuth(
      {
        id: crypto.randomUUID(),
        name: email.split("@")[0] || "Student",
        email,
        role: "student",
      },
      "demo-token"
    );
    toast.success("Welcome back");
    router.push(ROUTES.student);
  };

  return (
    <AuthLayout>
      <div className="mb-8 flex flex-col items-center text-center">
        <Image
          src="/images/collabTrackLogo.png"
          alt={`${APP_NAME} logo`}
          width={52}
          height={52}
          priority
          style={{ width: 52, height: "auto" }}
        />
        <h1 className="mt-3 text-2xl font-semibold text-primary">{APP_NAME}</h1>
        <p className="text-sm text-muted-foreground">
          Academic Analytics Portal
        </p>
      </div>

      <Card className="shadow-lg">
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label
                htmlFor="email"
                className="text-xs font-semibold tracking-wide text-muted-foreground uppercase"
              >
                Email address
              </Label>
              <div className="relative">
                <MailIcon className="auth-input-icon" />
                <Input
                  id="email"
                  type="email"
                  placeholder="professor.jones@university.edu"
                  className="h-11 bg-muted/50 pl-9"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label
                  htmlFor="password"
                  className="text-xs font-semibold tracking-wide text-muted-foreground uppercase"
                >
                  Password
                </Label>
                <button
                  type="button"
                  className="text-xs font-medium text-primary hover:underline"
                >
                  Forgot?
                </button>
              </div>
              <div className="relative">
                <LockIcon className="auth-input-icon" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="h-11 bg-muted/50 px-9"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? (
                    <EyeOffIcon className="size-4" />
                  ) : (
                    <EyeIcon className="size-4" />
                  )}
                </button>
              </div>
            </div>

            <Label
              htmlFor="stay"
              className="flex items-center gap-2 text-sm font-normal text-muted-foreground"
            >
              <Checkbox id="stay" />
              Stay signed in for 30 days
            </Label>

            <Button type="submit" className="h-11 w-full text-sm">
              Sign In
              <LogInIcon />
            </Button>

            <Separator className="my-1" />

            <div className="flex flex-col items-center gap-2">
              <p className="text-sm text-muted-foreground">
                Don&apos;t have an account?
              </p>
              <Button
                variant="outline"
                size="sm"
                nativeButton={false}
                render={<Link href={ROUTES.register} />}
              >
                Register
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <p className="mt-6 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} {APP_NAME} v2.4.1. All rights reserved.
      </p>
    </AuthLayout>
  );
}
