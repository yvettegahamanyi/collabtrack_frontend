"use client";

import { ArrowRightIcon, PencilIcon, ShieldIcon, UserIcon } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { PageHeader } from "@/components/layout/page-header";
import { ChangePasswordDialog } from "@/components/settings/change-password-dialog";
import { IntegrationsCard } from "@/components/settings/integrations-card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { mapApiUser, toApiRole } from "@/lib/auth";
import { ROLES, ROUTES } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { useProfile, useUpdateProfile } from "@/service/use-auth";
import { useAuthStore } from "@/stores/auth-store";
import type { ApiError, Role } from "@/types";

const fieldLabelClass =
  "text-xs font-semibold tracking-wide text-muted-foreground uppercase";

interface SettingsPageProps {
  role?: Role;
  showIntegrations?: boolean;
}

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function SettingsPage({
  role,
  showIntegrations,
}: SettingsPageProps) {
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const { data, isLoading } = useProfile();
  const updateProfile = useUpdateProfile();

  const resolvedShowIntegrations =
    showIntegrations ??
    (user?.role === "student" || user?.role === "instructor");

  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);

  useEffect(() => {
    const profile = data?.data;
    if (profile) {
      setName(profile.name);
      setEmail(profile.email);
      setUser(mapApiUser(profile));
    }
  }, [data, setUser]);

  useEffect(() => {
    if (user && !data) {
      setName(user.name);
      setEmail(user.email);
    }
  }, [user, data]);

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error("Full name is required");
      return;
    }
    if (!user?.role) {
      toast.error("Your account role is not set");
      return;
    }

    try {
      const response = await updateProfile.mutateAsync({
        name: name.trim(),
        role: toApiRole(user.role),
      });
      setUser(mapApiUser(response.data));
      toast.success("Settings saved");
    } catch (error) {
      const apiError = error as ApiError;
      toast.error(apiError.message ?? "Failed to save settings");
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings"
        description="Manage your account preferences and connected services."
      />

      <div
        className={cn(
          "grid gap-6",
          resolvedShowIntegrations ? "lg:grid-cols-2" : "max-w-3xl"
        )}
      >
        <AccountSettingsCard
          name={name}
          email={email}
          role={role ?? user?.role ?? undefined}
          avatarUrl={user?.avatarUrl}
          isLoading={isLoading}
          isSaving={updateProfile.isPending}
          onNameChange={setName}
          onSave={handleSave}
          onChangePassword={() => setChangePasswordOpen(true)}
        />

        {resolvedShowIntegrations && <IntegrationsCard />}
      </div>

      <SecurityBanner />

      <ChangePasswordDialog
        open={changePasswordOpen}
        onOpenChange={setChangePasswordOpen}
      />
    </div>
  );
}

function AccountSettingsCard({
  name,
  email,
  role,
  avatarUrl,
  isLoading,
  isSaving,
  onNameChange,
  onSave,
  onChangePassword,
}: {
  name: string;
  email: string;
  role?: Role;
  avatarUrl?: string;
  isLoading: boolean;
  isSaving: boolean;
  onNameChange: (value: string) => void;
  onSave: () => void;
  onChangePassword: () => void;
}) {
  return (
    <Card>
      <CardHeader className="border-b">
        <CardTitle className="flex items-center gap-2 text-base">
          <UserIcon className="size-4" />
          Account Settings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 pt-6">
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : (
          <>
            <div className="flex items-center gap-4">
              <div className="relative">
                <Avatar className="size-20">
                  <AvatarImage src={avatarUrl} alt={name} />
                  <AvatarFallback className="text-lg">
                    {initials(name || "User")}
                  </AvatarFallback>
                </Avatar>
                <Button
                  type="button"
                  size="icon-sm"
                  className="absolute right-0 bottom-0 size-7 rounded-full"
                  disabled
                  aria-label="Change profile picture"
                >
                  <PencilIcon className="size-3.5" />
                </Button>
              </div>
              <div>
                <p className="font-medium">Profile Picture</p>
                <p className="text-sm text-muted-foreground">
                  JPG, GIF or PNG. Max size of 800K
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {role ? ROLES[role] : "Account"}
                </p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="settings-name" className={fieldLabelClass}>
                  Full name
                </Label>
                <Input
                  id="settings-name"
                  value={name}
                  onChange={(e) => onNameChange(e.target.value)}
                  className="h-11 bg-muted/50"
                  disabled={isSaving}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="settings-email" className={fieldLabelClass}>
                  Email address
                </Label>
                <Input
                  id="settings-email"
                  type="email"
                  value={email}
                  readOnly
                  className="h-11 bg-muted/50"
                />
              </div>
            </div>

            <Separator />

            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-medium">Security</p>
                <p className="text-sm text-muted-foreground">
                  Manage your authentication methods
                </p>
              </div>
              <Button
                type="button"
                variant="link"
                className="h-auto px-0"
                onClick={onChangePassword}
              >
                Change Password
                <ArrowRightIcon className="size-4" />
              </Button>
            </div>

            <div className="flex justify-end">
              <Button onClick={onSave} disabled={isSaving}>
                {isSaving ? "Saving…" : "Save Changes"}
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

function SecurityBanner() {
  return (
    <Card className="overflow-hidden border-0 bg-primary text-primary-foreground">
      <CardContent className="flex flex-col gap-4 py-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-4">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary-foreground/15">
            <ShieldIcon className="size-5" />
          </span>
          <div>
            <p className="font-semibold">Your Data is Secure</p>
            <p className="mt-1 max-w-2xl text-sm text-primary-foreground/85">
              We utilize bank-grade encryption for all stored transcripts and
              third-party API tokens. Academic integrity and privacy are our top
              priorities.
            </p>
          </div>
        </div>
        <Button
          variant="secondary"
          className="shrink-0 bg-primary-foreground text-primary hover:bg-primary-foreground/90"
          nativeButton={false}
          render={<Link href={ROUTES.privacy} target="_blank" rel="noopener noreferrer" />}
        >
          Privacy Policy
        </Button>
      </CardContent>
    </Card>
  );
}
