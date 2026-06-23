"use client";

import { useEffect, useState } from "react";

import { useAuthStore } from "@/stores/auth-store";

/** True once the persisted auth store has rehydrated from localStorage. */
export function useAuthHydrated() {
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const persist = useAuthStore.persist;
    if (!persist) {
      setHydrated(true);
      return;
    }

    const unsub = persist.onFinishHydration(() => {
      setHydrated(true);
    });

    setHydrated(persist.hasHydrated());

    return unsub;
  }, []);

  return hydrated;
}
