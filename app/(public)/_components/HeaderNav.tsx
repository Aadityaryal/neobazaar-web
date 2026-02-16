"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { resolveNavHref, type NavItem, type NavRole } from "@/lib/navigation";
import { useUiStore } from "@/lib/state/ui-store";
import { isAuthPath } from "@/lib/auth/routing";

type HeaderNavProps = {
  isLoggedIn: boolean;
  neoTokens: number;
  role: NavRole;
  primaryNav: NavItem[];
  onLogout: ReactNode;
};

function isActive(pathname: string, item: NavItem) {
  if (pathname === item.href) return true;
  if (item.startsWith && pathname.startsWith(item.startsWith)) return true;
  return false;
}

function formatCrumbLabel(segment: string) {
  return segment
    .replace(/\[|\]/g, "")
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export default function HeaderNav({ isLoggedIn, neoTokens, role, primaryNav, onLogout }: HeaderNavProps) {
  const pathname = usePathname();
  const authRoute = isAuthPath(pathname);
  const [mobileOpenLocal, setMobileOpenLocal] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [moreOpenPath, setMoreOpenPath] = useState(pathname);
  const mobileOpenGlobal = useUiStore((state) => state.mobileNavOpen);
  const setMobileOpenGlobal = useUiStore((state) => state.setMobileNavOpen);
  const mobileOpen = mobileOpenLocal || mobileOpenGlobal;
  const showAuthenticatedControls = isLoggedIn && !authRoute;
  const showPrimaryNav = !authRoute;
  const visiblePrimaryNav = primaryNav.filter((item) => item.priority !== "secondary");
  const overflowPrimaryNav = primaryNav.filter((item) => item.priority === "secondary");

  const setMobileOpen = (open: boolean) => {
    setMobileOpenLocal(open);
    setMobileOpenGlobal(open);
  };

  const breadcrumbs = useMemo(() => {
    const segments = pathname.split("/").filter(Boolean);
    return segments.map((segment, index) => {
      const href = `/${segments.slice(0, index + 1).join("/")}`;
      return {
        href,
        label: formatCrumbLabel(segment),
      };
    });
  }, [pathname]);
  const moreMenuOpen = moreOpen && moreOpenPath === pathname;

  return (
    <div className="w-full">
      {showPrimaryNav && (
        <button
          type="button"
          className="btn-secondary btn-sm md:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-expanded={mobileOpen}
          aria-controls="mobile-nav-panel"
        >
          {mobileOpen ? "Close" : "Menu"}
        </button>
      )}

      {showPrimaryNav && (
        <nav className="hidden flex-wrap items-center justify-end gap-2 md:flex md:gap-3">
          {visiblePrimaryNav.map((item) => (
            <Link
              key={item.href}
              href={resolveNavHref(item)}
              className={`link-muted ${isActive(pathname, item) ? "nav-active" : ""}`}
            >
              {item.label}
            </Link>
          ))}
          {overflowPrimaryNav.length > 0 && (
            <div className="relative">
              <button
                type="button"
                className={`link-muted ${overflowPrimaryNav.some((item) => isActive(pathname, item)) ? "nav-active" : ""}`}
                onClick={() => {
                  if (moreMenuOpen) {
                    setMoreOpen(false);
                    return;
                  }
                  setMoreOpenPath(pathname);
                  setMoreOpen(true);
                }}
              >
                More
              </button>
              {moreMenuOpen && (
                <div className="absolute right-0 top-full z-40 mt-2 min-w-44 rounded-xl border border-dark-border bg-dark-card p-2 shadow-xl">
                  {overflowPrimaryNav.map((item) => (
                    <Link
                      key={item.href}
                      href={resolveNavHref(item)}
                      className={`block rounded-lg px-3 py-2 text-sm ${isActive(pathname, item) ? "nav-active" : "link-muted"}`}
                      onClick={() => setMoreOpen(false)}
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}
          {showAuthenticatedControls && <div className="neo-chip token-text hidden sm:block">NeoTokens: {neoTokens}</div>}
          {showAuthenticatedControls && role !== "admin" && (
            <Link href="/admin" className={`link-muted ${pathname.startsWith("/admin") ? "nav-active" : ""}`}>
              Admin
            </Link>
          )}
          {showAuthenticatedControls && onLogout}
        </nav>
      )}

      {showPrimaryNav && mobileOpen && (
        <div id="mobile-nav-panel" className="mobile-nav-panel md:hidden">
          <div className="grid gap-2">
            {primaryNav.map((item) => (
              <Link
                key={item.href}
                href={resolveNavHref(item)}
                className={`link-muted rounded-lg px-3 py-2 ${isActive(pathname, item) ? "nav-active" : ""}`}
                onClick={() => setMobileOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            {showAuthenticatedControls && role !== "admin" && (
              <Link
                href="/admin"
                className={`link-muted rounded-lg px-3 py-2 ${pathname.startsWith("/admin") ? "nav-active" : ""}`}
                onClick={() => setMobileOpen(false)}
              >
                Admin
              </Link>
            )}
            {showAuthenticatedControls && <div className="pt-1">{onLogout}</div>}
          </div>
        </div>
      )}

      {breadcrumbs.length > 0 && (
        <div className="crumb-row">
          <Link href="/" className="crumb-link">Home</Link>
          {breadcrumbs.map((crumb, index) => {
            const isLast = index === breadcrumbs.length - 1;
            return (
              <span key={crumb.href} className="inline-flex items-center gap-2">
                <span className="crumb-sep">/</span>
                {isLast ? (
                  <span className="crumb-current">{crumb.label}</span>
                ) : (
                  <Link href={crumb.href} className="crumb-link">
                    {crumb.label}
                  </Link>
                )}
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
}
