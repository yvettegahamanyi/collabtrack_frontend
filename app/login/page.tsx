"use client";

import {
  EyeIcon,
  EyeOffIcon,
  LockIcon,
  LogInIcon,
  MailIcon,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { AuthLayout } from "@/components/auth/auth-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { resolvePostAuthRoute } from "@/lib/auth-redirect";
import { APP_NAME, ROUTES } from "@/lib/constants";
import { mapApiUser, useLogin } from "@/service/use-auth";
import { useAuthStore } from "@/stores/auth-store";
import type { ApiError } from "@/types";

export default function LoginPage() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);
  const setNeedsOnboarding = useAuthStore((s) => s.setNeedsOnboarding);
  const login = useLogin();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Enter your email and password");
      return;
    }

    try {
      const { access_token, user } = await login.mutateAsync({
        email,
        password,
      });
      const mappedUser = mapApiUser(user);

      setAuth(mappedUser, access_token);

      if (!mappedUser.role) {
        setNeedsOnboarding(true);
        router.replace(ROUTES.onboarding);
        return;
      }

      setNeedsOnboarding(false);
      toast.success("Welcome back");
      router.replace(resolvePostAuthRoute(mappedUser.role));
    } catch (error) {
      const apiError = error as ApiError;
      toast.error(apiError.message ?? "Sign in failed");
    }
  };

  return (
    <AuthLayout>
      <Card className="px-2 py-8 shadow-lg">
        <CardContent>
          <div className="mb-7 flex flex-col items-center text-center">
            <Image
              src="/images/collabTrackLogo.png"
              alt={`${APP_NAME} logo`}
              width={48}
              height={48}
              priority
              style={{ width: 48, height: "auto" }}
            />
            <h1 className="font-heading mt-3 text-xl font-semibold text-primary">
              {APP_NAME}
            </h1>
            <p className="text-sm text-muted-foreground">
              Academic Analytics Portal
            </p>
          </div>

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
                  disabled={login.isPending}
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
                <Link
                  href={ROUTES.forgotPassword}
                  className="text-xs font-medium text-primary hover:underline"
                >
                  Forgot?
                </Link>
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
                  disabled={login.isPending}
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

            {/* <Label
              htmlFor="stay"
              className="flex items-center gap-2 text-sm font-normal text-muted-foreground"
            >
              <Checkbox id="stay" />
              Stay signed in for 30 days
            </Label> */}

            <Button
              type="submit"
              className="h-11 w-full text-sm"
              disabled={login.isPending}
            >
              {login.isPending ? "Signing in…" : "Sign In"}
              {!login.isPending && <LogInIcon />}
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
    </AuthLayout>
  );
}
