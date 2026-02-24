export const ERROR_CATEGORIES = {
  NETWORK: "network",
  AUTH: "auth",
  VALIDATION: "validation",
  FORBIDDEN: "forbidden",
  NOT_FOUND: "not_found",
  CONFLICT: "conflict",
  UNKNOWN: "unknown",
} as const;

export type ErrorCategory = (typeof ERROR_CATEGORIES)[keyof typeof ERROR_CATEGORIES];
