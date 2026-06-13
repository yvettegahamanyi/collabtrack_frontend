import { create } from "zustand";
import { persist } from "zustand/middleware";

import type { User } from "@/types";

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  /** True after registration until the user picks a role on onboarding. */
  needsOnboarding: boolean;
  setAuth: (user: User, token: string) => void;
  setUser: (user: User) => void;
  setNeedsOnboarding: (needs: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      needsOnboarding: false,
      setAuth: (user, token) =>
        set({ user, token, isAuthenticated: true }),
      setUser: (user) => set({ user }),
      setNeedsOnboarding: (needs) => set({ needsOnboarding: needs }),
      logout: () =>
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          needsOnboarding: false,
        }),
    }),
    {
      name: "collabtrack-auth",
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
        needsOnboarding: state.needsOnboarding,
      }),
    }
  )
);

export const useCurrentUser = () => useAuthStore((s) => s.user);
export const useRole = () => useAuthStore((s) => s.user?.role);
