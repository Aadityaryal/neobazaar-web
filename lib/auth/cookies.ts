import { AUTH_COOKIE_NAME } from "./constants";

export const COOKIE_KEYS = {
  AUTH_TOKEN: "auth_token",
  USER_DATA: "user_data",
  BACKEND_SESSION: AUTH_COOKIE_NAME,
} as const;

export type CookieKey = (typeof COOKIE_KEYS)[keyof typeof COOKIE_KEYS];
