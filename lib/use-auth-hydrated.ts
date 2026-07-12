"use client";

import { useEffect, useState } from "react";

import { useAuthStore } from "@/stores/auth-store";

/** True once the persisted auth store has rehydrated from localStorage. */
export function useAuthHydrated() {
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let active = true;
    const persist = useAuthStore.persist;

    const finish = () => {
      if (active) setHydrated(true);
    };

    const timeout = window.setTimeout(finish, 1000);

    if (!persist) {
      finish();
      window.clearTimeout(timeout);
      return;
    }

    if (persist.hasHydrated()) {
      finish();
      window.clearTimeout(timeout);
      return;
    }

    void Promise.resolve(persist.rehydrate()).finally(() => {
      window.clearTimeout(timeout);
      finish();
    });

    return () => {
      active = false;
      window.clearTimeout(timeout);
    };
  }, []);

  return hydrated;
}
