import { create } from "zustand";
import { persist } from "zustand/middleware";

import type { User } from "@/types";

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  /** True after registration until the user picks a role on onboarding. */
  needsOnboarding: boolean;
  /** Path to navigate to after login/register/onboarding (e.g. invite acceptance). */
  redirectPath: string | null;
  setAuth: (user: User, token: string) => void;
  setToken: (token: string) => void;
  setUser: (user: User) => void;
  setNeedsOnboarding: (needs: boolean) => void;
  setRedirectPath: (path: string | null) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      needsOnboarding: false,
      redirectPath: null,
      setAuth: (user, token) =>
        set({ user, token, isAuthenticated: true }),
      setToken: (token) => set({ token }),
      setUser: (user) => set({ user }),
      setNeedsOnboarding: (needs) => set({ needsOnboarding: needs }),
      setRedirectPath: (path) => set({ redirectPath: path }),
      logout: () =>
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          needsOnboarding: false,
          redirectPath: null,
        }),
    }),
    {
      name: "collabtrack-auth",
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
        needsOnboarding: state.needsOnboarding,
        redirectPath: state.redirectPath,
      }),
    }
  )
);

export const useCurrentUser = () => useAuthStore((s) => s.user);
export const useRole = () => useAuthStore((s) => s.user?.role);
