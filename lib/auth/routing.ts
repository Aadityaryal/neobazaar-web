export const AUTH_ROUTE_PREFIXES = [
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
  "/auth/login",
  "/auth/register",
  "/auth/forgot-password",
  "/auth/reset-password",
] as const;

export const PROTECTED_ROUTE_PREFIXES = [
  "/dashboard",
  "/user",
  "/admin",
  "/seller",
  "/profile",
  "/notifications",
  "/settings",
  "/wallet",
  "/reputation",
  "/referrals",
  "/leaderboard",
] as const;

export const PROTECTED_ROUTE_MATCHERS = PROTECTED_ROUTE_PREFIXES.map((prefix) => `${prefix}/:path*`);

function normalizePath(pathname: string) {
  const decoded = (() => {
    try {
      return decodeURIComponent(pathname);
    } catch {
      return pathname;
    }
  })();

  if (decoded.length > 1 && decoded.endsWith("/")) {
    return decoded.slice(0, -1);
  }
  return decoded;
}

function isInPrefixes(pathname: string, prefixes: readonly string[]) {
  const normalized = normalizePath(pathname);
  return prefixes.some((prefix) => normalized === prefix || normalized.startsWith(`${prefix}/`));
}

export function isAuthPath(pathname: string) {
  return isInPrefixes(pathname, AUTH_ROUTE_PREFIXES);
}

export function isProtectedPath(pathname: string) {
  return isInPrefixes(pathname, PROTECTED_ROUTE_PREFIXES);
}
