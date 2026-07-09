"use client";

import {
  ArrowLeftIcon,
  EyeIcon,
  EyeOffIcon,
  KeyRoundIcon,
  LockIcon,
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
import { isValidPassword } from "@/lib/auth";
import { APP_NAME, ROUTES } from "@/lib/constants";
import {
  useRequestPasswordReset,
  useResetPassword,
} from "@/service/use-auth";
import type { ApiError } from "@/types";

type Step = "email" | "otp" | "password";

const fieldLabelClass =
  "text-xs font-semibold tracking-wide text-muted-foreground uppercase";

export function ForgotPasswordPage() {
  const router = useRouter();
  const requestReset = useRequestPasswordReset();
  const resetPassword = useResetPassword();

  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const isBusy = requestReset.isPending || resetPassword.isPending;

  const handleRequestCode = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!email.trim()) {
      toast.error("Enter your email address");
      return;
    }

    try {
      const response = await requestReset.mutateAsync({ email: email.trim() });
      toast.success(response.message);
      setStep("otp");
    } catch (error) {
      const apiError = error as ApiError;
      toast.error(apiError.message ?? "Failed to send verification code");
    }
  };

  const handleVerifyOtp = (event: React.FormEvent) => {
    event.preventDefault();
    if (!/^\d{6}$/.test(otp)) {
      toast.error("Enter the 6-digit verification code");
      return;
    }
    setStep("password");
  };

  const handleResetPassword = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!isValidPassword(newPassword)) {
      toast.error(
        "Password must be at least 8 characters and include a number"
      );
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    try {
      const response = await resetPassword.mutateAsync({
        email: email.trim(),
        otp,
        new_password: newPassword,
      });
      toast.success(response.message ?? "Password reset successfully");
      router.replace(ROUTES.login);
    } catch (error) {
      const apiError = error as ApiError;
      toast.error(apiError.message ?? "Failed to reset password");
    }
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
        <p className="text-sm text-muted-foreground">Reset your password</p>
      </div>

      <Card className="shadow-lg">
        <CardContent>
          {step === "email" && (
            <form onSubmit={handleRequestCode} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="reset-email" className={fieldLabelClass}>
                  Email address
                </Label>
                <div className="relative">
                  <MailIcon className="auth-input-icon" />
                  <Input
                    id="reset-email"
                    type="email"
                    placeholder="professor.jones@university.edu"
                    className="h-11 bg-muted/50 pl-9"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    disabled={isBusy}
                  />
                </div>
              </div>

              <p className="text-sm text-muted-foreground">
                We&apos;ll email you a 6-digit verification code.
              </p>

              <Button
                type="submit"
                className="h-11 w-full"
                disabled={isBusy}
              >
                {requestReset.isPending ? "Sending code…" : "Send verification code"}
              </Button>
            </form>
          )}

          {step === "otp" && (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="reset-otp" className={fieldLabelClass}>
                  Verification code
                </Label>
                <div className="relative">
                  <KeyRoundIcon className="auth-input-icon" />
                  <Input
                    id="reset-otp"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    placeholder="123456"
                    className="h-11 bg-muted/50 pl-9 tracking-[0.3em]"
                    value={otp}
                    onChange={(event) =>
                      setOtp(event.target.value.replace(/\D/g, "").slice(0, 6))
                    }
                    disabled={isBusy}
                  />
                </div>
              </div>

              <p className="text-sm text-muted-foreground">
                Enter the code sent to <span className="font-medium">{email}</span>.
              </p>

              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="h-11"
                  onClick={() => setStep("email")}
                  disabled={isBusy}
                >
                  <ArrowLeftIcon className="size-4" />
                  Back
                </Button>
                <Button type="submit" className="h-11 flex-1" disabled={isBusy}>
                  Continue
                </Button>
              </div>
            </form>
          )}

          {step === "password" && (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="new-password" className={fieldLabelClass}>
                  New password
                </Label>
                <div className="relative">
                  <LockIcon className="auth-input-icon" />
                  <Input
                    id="new-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className="h-11 bg-muted/50 px-9"
                    value={newPassword}
                    onChange={(event) => setNewPassword(event.target.value)}
                    disabled={isBusy}
                  />
                  <button
                    type="button"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    onClick={() => setShowPassword((value) => !value)}
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

              <div className="space-y-1.5">
                <Label htmlFor="confirm-password" className={fieldLabelClass}>
                  Confirm password
                </Label>
                <div className="relative">
                  <LockIcon className="auth-input-icon" />
                  <Input
                    id="confirm-password"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className="h-11 bg-muted/50 px-9"
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                    disabled={isBusy}
                  />
                  <button
                    type="button"
                    aria-label={
                      showConfirmPassword ? "Hide password" : "Show password"
                    }
                    onClick={() => setShowConfirmPassword((value) => !value)}
                    className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showConfirmPassword ? (
                      <EyeOffIcon className="size-4" />
                    ) : (
                      <EyeIcon className="size-4" />
                    )}
                  </button>
                </div>
              </div>

              <p className="text-sm text-muted-foreground">
                Use at least 8 characters with one number.
              </p>

              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="h-11"
                  onClick={() => setStep("otp")}
                  disabled={isBusy}
                >
                  <ArrowLeftIcon className="size-4" />
                  Back
                </Button>
                <Button
                  type="submit"
                  className="h-11 flex-1"
                  disabled={isBusy}
                >
                  {resetPassword.isPending ? "Resetting…" : "Reset password"}
                </Button>
              </div>
            </form>
          )}

          <div className="mt-6 text-center">
            <Button
              variant="link"
              className="h-auto px-0 text-sm"
              nativeButton={false}
              render={<Link href={ROUTES.login} />}
            >
              Back to sign in
            </Button>
          </div>
        </CardContent>
      </Card>
    </AuthLayout>
  );
}
