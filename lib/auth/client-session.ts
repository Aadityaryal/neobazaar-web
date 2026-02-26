import { AUTH_REASON } from "./constants";
import { COOKIE_KEYS } from "./cookies";
import { isAuthPath } from "./routing";
import { publishAuthTransition } from "./transitions";

export async function clearClientSessionCookies() {
  document.cookie = `${COOKIE_KEYS.AUTH_TOKEN}=; path=/; max-age=0`;
  document.cookie = `${COOKIE_KEYS.USER_DATA}=; path=/; max-age=0`;
  document.cookie = `${COOKIE_KEYS.BACKEND_SESSION}=; path=/; max-age=0`;

  try {
    await fetch("/api/auth/session-expired", {
      method: "POST",
      credentials: "include",
    });
  } catch {
  }

  publishAuthTransition(AUTH_REASON.SESSION_EXPIRED);
}

export function shouldRedirectToSessionExpired(pathname: string, search: string, requestUrl: string) {
  const isAuthApiRequest = requestUrl.includes("/api/auth/login") || requestUrl.includes("/api/auth/register");
  const alreadyOnSessionExpiredPage = pathname === "/login" && search.includes(`reason=${AUTH_REASON.SESSION_EXPIRED}`);
  return !isAuthPath(pathname) && !isAuthApiRequest && !alreadyOnSessionExpiredPage;
}
