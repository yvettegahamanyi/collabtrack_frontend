import { ROLE_HOME } from "@/lib/constants";
import { useAuthStore } from "@/stores/auth-store";
import type { Role } from "@/types";

/** Returns stored redirect path and clears it, or the role home route. */
export function resolvePostAuthRoute(role: Role): string {
  const redirect = useAuthStore.getState().redirectPath;
  if (redirect) {
    useAuthStore.getState().setRedirectPath(null);
    return redirect;
  }
  return ROLE_HOME[role];
}

export function setInviteRedirect(token: string) {
  useAuthStore.getState().setRedirectPath(`/invite/${token}`);
}
