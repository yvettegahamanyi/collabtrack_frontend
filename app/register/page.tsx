"use client";

import {
  ArrowRightIcon,
  EyeIcon,
  EyeOffIcon,
  LockIcon,
  MailIcon,
  UserIcon,
} from "lucide-react";
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
import { APP_NAME, ROUTES } from "@/lib/constants";
import { mapApiUser, useRegister } from "@/service/use-auth";
import { useAuthStore } from "@/stores/auth-store";
import type { ApiError } from "@/types";

export default function RegisterPage() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);
  const setNeedsOnboarding = useAuthStore((s) => s.setNeedsOnboarding);
  const register = useRegister();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!acceptedTerms) {
      toast.error("Please accept the Terms of Service and Privacy Policy");
      return;
    }
    if (!name || !email || !password) {
      toast.error("Please fill in all fields");
      return;
    }
    if (password.length < 8 || !/\d/.test(password)) {
      toast.error(
        "Password must be at least 8 characters and include a number"
      );
      return;
    }

    try {
      const response = await register.mutateAsync({ name, email, password });
      const { access_token, user } = response.data;

      setAuth(mapApiUser(user), access_token);
      setNeedsOnboarding(true);
      router.push(ROUTES.onboarding);
    } catch (error) {
      const apiError = error as ApiError;
      toast.error(apiError.message ?? "Registration failed");
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
            <h1 className="mt-3 text-xl font-semibold text-primary">
              {APP_NAME}
            </h1>
            <p className="text-sm text-muted-foreground">
              Academic Analytics Portal
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <FieldBlock label="Full name" htmlFor="name">
              <UserIcon className="auth-input-icon" />
              <Input
                id="name"
                placeholder="John Doe"
                className="h-11 bg-muted/50 pl-9"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={register.isPending}
              />
            </FieldBlock>

            <FieldBlock label="Email address" htmlFor="email">
              <MailIcon className="auth-input-icon" />
              <Input
                id="email"
                type="email"
                placeholder="professor@university.edu"
                className="h-11 bg-muted/50 pl-9"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={register.isPending}
              />
            </FieldBlock>

            <div>
              <FieldBlock label="Password" htmlFor="password">
                <LockIcon className="auth-input-icon" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="h-11 bg-muted/50 px-9"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={register.isPending}
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
              </FieldBlock>
              <p className="mt-1.5 text-xs text-muted-foreground italic">
                At least 8 characters with a number.
              </p>
            </div>

            <div className="flex items-start gap-3 pt-1">
              <Checkbox
                id="accept-terms"
                checked={acceptedTerms}
                onCheckedChange={(checked) =>
                  setAcceptedTerms(checked === true)
                }
                disabled={register.isPending}
                className="mt-0.5"
              />
              <Label
                htmlFor="accept-terms"
                className="text-sm leading-snug font-normal text-muted-foreground"
              >
                I agree to the{" "}
                <Link
                  href={ROUTES.terms}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-primary hover:underline"
                >
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link
                  href={ROUTES.privacy}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-primary hover:underline"
                >
                  Privacy Policy
                </Link>
                .
              </Label>
            </div>

            <Button
              type="submit"
              className="mt-2 h-11 w-full text-sm"
              disabled={register.isPending || !acceptedTerms}
            >
              {register.isPending ? "Creating account…" : "Register"}
              {!register.isPending && <ArrowRightIcon />}
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="mt-4 flex items-center justify-between px-2 text-xs text-muted-foreground">
        <Link href={ROUTES.login} className="hover:text-foreground">
          Sign in
        </Link>
        <span className="flex gap-4">
          <Link href={ROUTES.privacy} className="hover:text-foreground">
            Privacy
          </Link>
          <Link href={ROUTES.terms} className="hover:text-foreground">
            Terms
          </Link>
        </span>
      </div>
    </AuthLayout>
  );
}

function FieldBlock({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label
        htmlFor={htmlFor}
        className="text-xs font-semibold tracking-wide text-muted-foreground uppercase"
      >
        {label}
      </Label>
      <div className="relative">{children}</div>
    </div>
  );
}
