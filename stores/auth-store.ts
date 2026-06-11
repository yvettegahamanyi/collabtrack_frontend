import { create } from "zustand";
import { persist } from "zustand/middleware";

import type { Role, User } from "@/types";

interface PendingRegistration {
  name: string;
  email: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  /** Set during registration, consumed by the onboarding step. */
  pendingRegistration: PendingRegistration | null;
  setAuth: (user: User, token: string) => void;
  setUser: (user: User) => void;
  startRegistration: (data: PendingRegistration) => void;
  completeOnboarding: (role: Role) => User | null;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      pendingRegistration: null,
      setAuth: (user, token) =>
        set({ user, token, isAuthenticated: true, pendingRegistration: null }),
      setUser: (user) => set({ user }),
      startRegistration: (data) => set({ pendingRegistration: data }),
      completeOnboarding: (role) => {
        const pending = get().pendingRegistration;
        if (!pending) return null;
        const user: User = {
          id: crypto.randomUUID(),
          name: pending.name,
          email: pending.email,
          role,
        };
        set({
          user,
          token: "demo-token",
          isAuthenticated: true,
          pendingRegistration: null,
        });
        return user;
      },
      logout: () =>
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          pendingRegistration: null,
        }),
    }),
    {
      name: "collabtrack-auth",
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
        pendingRegistration: state.pendingRegistration,
      }),
    }
  )
);

export const useCurrentUser = () => useAuthStore((s) => s.user);
export const useRole = (): Role | undefined =>
  useAuthStore((s) => s.user?.role);
