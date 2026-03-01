"use client";

import { create } from "zustand";

type ThemeMode = "default" | "festival" | "midnight";

type UiState = {
  mobileNavOpen: boolean;
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  setMobileNavOpen: (open: boolean) => void;
};

export const useUiStore = create<UiState>((set) => ({
  mobileNavOpen: false,
  theme: "default",
  setTheme: (theme) => set({ theme }),
  setMobileNavOpen: (mobileNavOpen) => set({ mobileNavOpen }),
}));
