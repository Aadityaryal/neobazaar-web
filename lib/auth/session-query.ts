"use client";

import { useEffect } from "react";
import { useQuery, type QueryClient } from "@tanstack/react-query";
import { getMe } from "@/lib/api/auth";
import { classifyAuthError } from "@/lib/auth/error";
import { publishAuthTransition } from "@/lib/auth/transitions";
import { useAuthStore } from "@/lib/state/auth-store";

export const SESSION_QUERY_KEY = ["session", "me"] as const;

export const SESSION_BOUND_QUERY_PREFIXES = [
  "session",
  "dashboard",
  "orders",
  "offers",
  "wallet",
  "notifications",
  "reputation",
  "referrals",
  "leaderboard",
] as const;

export function getSessionStaleTime(pathname: string) {
  if (pathname.startsWith("/admin")) {
    return 15_000;
  }
  if (pathname.startsWith("/dashboard") || pathname.startsWith("/seller")) {
    return 30_000;
  }
  return 60_000;
}

export function shouldRetryAuthQuery(error: unknown, failureCount: number) {
  const kind = classifyAuthError(error);
  if (kind === "unauthorized") {
    return false;
  }
  if (kind === "network") {
    return failureCount < 2;
  }
  return failureCount < 1;
}

async function fetchSessionWithInstrumentation() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("nb:session-refresh-attempt", { detail: { at: Date.now() } }));
  }

  const response = await getMe();
  if (!response.success) {
    throw new Error(response.message || "Session expired");
  }
  return response.data;
}

export function useSessionQuery({ pathname, enabled }: { pathname: string; enabled: boolean }) {
  const setAuthStatus = useAuthStore((state) => state.setAuthStatus);

  const sessionQuery = useQuery({
    queryKey: SESSION_QUERY_KEY,
    queryFn: fetchSessionWithInstrumentation,
    enabled,
    staleTime: getSessionStaleTime(pathname),
    refetchOnWindowFocus: false,
    retry: (failureCount, error) => shouldRetryAuthQuery(error, failureCount),
  });

  useEffect(() => {
    if (sessionQuery.isSuccess) {
      setAuthStatus("authenticated");
      publishAuthTransition("session-refresh");
      return;
    }

    if (sessionQuery.isError) {
      const kind = classifyAuthError(sessionQuery.error);
      setAuthStatus(kind === "unauthorized" ? "guest" : "unknown");
    }
  }, [sessionQuery.isError, sessionQuery.isSuccess, sessionQuery.error, setAuthStatus]);

  return sessionQuery;
}

export function purgeSessionBoundQueries(queryClient: QueryClient) {
  queryClient.removeQueries({
    predicate: (query) => {
      const key = query.queryKey[0];
      return typeof key === "string" && SESSION_BOUND_QUERY_PREFIXES.includes(key as (typeof SESSION_BOUND_QUERY_PREFIXES)[number]);
    },
  });
}

export function invalidateSessionQueries(queryClient: QueryClient) {
  queryClient.invalidateQueries({ queryKey: SESSION_QUERY_KEY });
  queryClient.invalidateQueries({ queryKey: ["dashboard"] });
}
