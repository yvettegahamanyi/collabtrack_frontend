"use client";

import { useEffect, useState } from "react";

import { useAuthStore } from "@/stores/auth-store";

/** True once the persisted auth store has rehydrated from localStorage. */
export function useAuthHydrated() {
  const [hydrated, setHydrated] = useState(() =>
    useAuthStore.persist.hasHydrated()
  );

  useEffect(() => {
    const unsub = useAuthStore.persist.onFinishHydration(() => {
      setHydrated(true);
    });

    setHydrated(useAuthStore.persist.hasHydrated());

    return unsub;
  }, []);

  return hydrated;
}
