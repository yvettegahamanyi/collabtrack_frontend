"use client";

import { Loader2Icon } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef } from "react";
import { toast } from "sonner";

import { mapApiUser } from "@/lib/auth";
import { getMe } from "@/service/auth.service";
import { useAuthStore } from "@/stores/auth-store";

function LtiCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const setAuth = useAuthStore((s) => s.setAuth);
  const setNeedsOnboarding = useAuthStore((s) => s.setNeedsOnboarding);
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;

    const token = searchParams.get("token");
    const assignmentId = searchParams.get("assignment_id");
    const warning = searchParams.get("warning");
    const groupsImported = searchParams.get("groups_imported");
    const membersAdded = searchParams.get("members_added");

    if (!token || !assignmentId) {
      toast.error("Invalid Moodle launch response.");
      router.replace("/login");
      return;
    }

    const complete = async () => {
      useAuthStore.getState().setToken(token);
      try {
        const profile = await getMe();
        const user = mapApiUser(profile.data);
        setAuth(user, token);
        setNeedsOnboarding(false);

        if (warning) {
          toast.warning(warning);
        } else if (groupsImported && Number(groupsImported) > 0) {
          toast.success(
            `Imported ${groupsImported} Moodle group(s) with ${
              membersAdded ?? "0"
            } new member(s).`
          );
        } else {
          toast.success("Connected to CollabTrack from Moodle.");
        }

        router.replace(`/instructor/assignments/${assignmentId}`);
      } catch {
        useAuthStore.getState().logout();
        toast.error("Could not complete Moodle sign-in.");
        router.replace("/login");
      }
    };

    void complete();
  }, [router, searchParams, setAuth, setNeedsOnboarding]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 text-muted-foreground">
      <Loader2Icon className="size-8 animate-spin text-primary" />
      <p className="text-sm">Signing you in from Moodle…</p>
    </div>
  );
}

export default function LtiCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center text-muted-foreground">
          <Loader2Icon className="size-8 animate-spin text-primary" />
        </div>
      }
    >
      <LtiCallbackContent />
    </Suspense>
  );
}
