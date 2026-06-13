"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { use } from "react";
import { toast } from "sonner";

import { AuthLayout } from "@/components/auth/auth-layout";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { setInviteRedirect } from "@/lib/auth-redirect";
import { groupPath, ROUTES } from "@/lib/constants";
import { useAcceptInvite, useVerifyInvite } from "@/service/use-groups";
import { useAuthStore } from "@/stores/auth-store";
import type { ApiError } from "@/types";

export default function InvitePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = use(params);
  const router = useRouter();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const acceptInvite = useAcceptInvite();
  const { data, isLoading, isError, error } = useVerifyInvite(token);

  const invite = data?.data;

  const handleAccept = async () => {
    try {
      const response = await acceptInvite.mutateAsync(token);
      toast.success(response.message ?? "You have joined the group");
      const userRole = useAuthStore.getState().user?.role;
      const groupRole = userRole === "instructor" ? "instructor" : "student";
      router.replace(groupPath(response.data.group_id, undefined, groupRole));
    } catch (err) {
      const apiError = err as ApiError;
      toast.error(apiError.message ?? "Failed to accept invitation");
    }
  };

  const handleAuthRedirect = (path: "login" | "register") => {
    setInviteRedirect(token);
    router.push(path === "login" ? ROUTES.login : ROUTES.register);
  };

  return (
    <AuthLayout>
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader>
          <CardTitle>Group Invitation</CardTitle>
          <CardDescription>
            Review the invitation details before joining.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoading && (
            <div className="space-y-3">
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          )}

          {isError && (
            <p className="text-sm text-destructive">
              {(error as unknown as ApiError)?.message ??
                "This invitation is invalid or has expired."}
            </p>
          )}

          {invite && (
            <>
              <div className="space-y-2 rounded-lg border bg-muted/40 p-4 text-sm">
                <p>
                  <span className="text-muted-foreground">Group:</span>{" "}
                  <span className="font-medium">{invite.group_name}</span>
                </p>
                {invite.description && (
                  <p className="text-muted-foreground">{invite.description}</p>
                )}
                <p>
                  <span className="text-muted-foreground">Role:</span>{" "}
                  {invite.role}
                </p>
                <p>
                  <span className="text-muted-foreground">Expires:</span>{" "}
                  {new Date(invite.expires_at).toLocaleString()}
                </p>
              </div>

              {isAuthenticated ? (
                <Button
                  className="w-full"
                  onClick={handleAccept}
                  disabled={acceptInvite.isPending}
                >
                  {acceptInvite.isPending
                    ? "Joining…"
                    : "Accept Invitation"}
                </Button>
              ) : (
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    Sign in or create an account to join this group.
                  </p>
                  <Button
                    className="w-full"
                    onClick={() => handleAuthRedirect("login")}
                  >
                    Sign In
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => handleAuthRedirect("register")}
                  >
                    Create Account
                  </Button>
                </div>
              )}

              <Link
                href={ROUTES.home}
                className="block text-center text-sm text-muted-foreground hover:text-foreground"
              >
                Back to home
              </Link>
            </>
          )}
        </CardContent>
      </Card>
    </AuthLayout>
  );
}
