"use client";

import { useEffect, useState } from "react";
import { useUiStore } from "@/lib/state/ui-store";

type Language = "en" | "ne";
type ThemeMode = "default" | "festival" | "midnight";

function setCookie(name: string, value: string) {
  document.cookie = `${name}=${value}; path=/; max-age=${60 * 60 * 24 * 365}`;
}

function getCookie(name: string): string | null {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length < 2) return null;
  return parts.pop()?.split(";").shift() ?? null;
}

export default function PreferenceToggles() {
  const setGlobalTheme = useUiStore((state) => state.setTheme);
  const [lang, setLang] = useState<Language>(() => {
    if (typeof document === "undefined") return "en";
    const cookieLang = getCookie("lang");
    return cookieLang === "ne" ? "ne" : "en";
  });
  const [theme, setTheme] = useState<ThemeMode>(() => {
    if (typeof document === "undefined") return "default";
    const cookieTheme = getCookie("theme");
    if (cookieTheme === "festival") return "festival";
    if (cookieTheme === "midnight") return "midnight";
    return "default";
  });

  useEffect(() => {
    setGlobalTheme(theme);
    document.documentElement.setAttribute("data-theme", theme);
  }, [setGlobalTheme, theme]);

  return (
    <div className="flex items-center gap-2">
      <select
        className="input-field w-auto px-2 py-1 text-xs"
        value={lang}
        onChange={(e) => {
          const value = e.target.value as Language;
          setLang(value);
          setCookie("lang", value);
          window.dispatchEvent(new CustomEvent("nb:lang-changed", { detail: value }));
        }}
      >
        <option value="en">English</option>
        <option value="ne">Nepali</option>
      </select>

      <select
        className="input-field w-auto px-2 py-1 text-xs"
        value={theme}
        onChange={(e) => {
          const value = e.target.value as ThemeMode;
          setTheme(value);
          setCookie("theme", value);
          document.documentElement.setAttribute("data-theme", value);
          window.dispatchEvent(new CustomEvent("nb:theme-changed", { detail: value }));
        }}
      >
        <option value="default">default</option>
        <option value="festival">festival</option>
        <option value="midnight">midnight</option>
      </select>
    </div>
  );
}
