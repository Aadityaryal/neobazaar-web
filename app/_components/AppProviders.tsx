"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { classifyAuthError } from "@/lib/auth/error";
import { invalidateSessionQueries, purgeSessionBoundQueries } from "@/lib/auth/session-query";
import { subscribeAuthTransitions } from "@/lib/auth/transitions";
import { useAuthStore } from "@/lib/state/auth-store";
import { AUTH_REASON } from "@/lib/auth/constants";

export default function AppProviders({ children }: { children: ReactNode }) {
  const setAuthStatus = useAuthStore((state) => state.setAuthStatus);

  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30_000,
            retry: (failureCount, error) => {
              const kind = classifyAuthError(error);
              if (kind === "unauthorized") {
                return false;
              }
              if (kind === "network") {
                return failureCount < 2;
              }
              return failureCount < 1;
            },
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  useEffect(() => {
    const unsubscribe = subscribeAuthTransitions((payload) => {
      if (payload.type === "login" || payload.type === "session-refresh") {
        setAuthStatus("authenticated");
        invalidateSessionQueries(queryClient);
        return;
      }

      if (payload.type === "logout" || payload.type === AUTH_REASON.SESSION_EXPIRED) {
        setAuthStatus("guest");
        purgeSessionBoundQueries(queryClient);
      }
    });

    let lastSyncAt = 0;
    const onVisibilityChange = () => {
      if (document.visibilityState !== "visible") {
        return;
      }
      const now = Date.now();
      if (now - lastSyncAt < 5_000) {
        return;
      }
      lastSyncAt = now;
      invalidateSessionQueries(queryClient);
    };

    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => {
      unsubscribe();
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [queryClient, setAuthStatus]);

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
