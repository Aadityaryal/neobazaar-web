export const AUTH_COOKIE_NAME = process.env.AUTH_COOKIE_NAME || "neobazaar_session";

export const AUTH_REASON = {
  SESSION_EXPIRED: "session-expired",
} as const;
