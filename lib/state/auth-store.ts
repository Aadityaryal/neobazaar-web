"use client";

import { create } from "zustand";

export type AuthStatus = "unknown" | "authenticated" | "guest";

type AuthState = {
  hydrated: boolean;
  authStatus: AuthStatus;
  markHydrated: () => void;
  setAuthStatus: (status: AuthStatus) => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  hydrated: false,
  authStatus: "unknown",
  markHydrated: () => set({ hydrated: true }),
  setAuthStatus: (authStatus) => set({ authStatus }),
}));

export const useAuthStatusSelector = () =>
  useAuthStore((state) => ({
    hydrated: state.hydrated,
    authStatus: state.authStatus,
  }));
