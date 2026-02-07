"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { isProtectedPath } from "@/lib/auth/routing";
import { useSessionQuery } from "@/lib/auth/session-query";
import { useAuthStore } from "@/lib/state/auth-store";

export default function SessionBootstrap() {
  const pathname = usePathname();
  const shouldBootstrapSession = isProtectedPath(pathname);
  const markHydrated = useAuthStore((state) => state.markHydrated);

  useSessionQuery({ pathname, enabled: shouldBootstrapSession });

  useEffect(() => {
    markHydrated();
  }, [markHydrated]);

  return null;
}
