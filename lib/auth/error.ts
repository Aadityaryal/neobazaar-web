import axios from "axios";

export type AuthErrorKind = "unauthorized" | "network" | "server";

export function classifyAuthError(error: unknown): AuthErrorKind {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status;
    if (status === 401 || status === 403) {
      return "unauthorized";
    }
    if (!status) {
      return "network";
    }
    return "server";
  }

  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    if (message.includes("unauthorized") || message.includes("session expired")) {
      return "unauthorized";
    }
    if (message.includes("network") || message.includes("failed to fetch")) {
      return "network";
    }
  }

  return "server";
}

export function getAuthErrorMessage(error: unknown): string {
  const kind = classifyAuthError(error);
  if (kind === "unauthorized") {
    return "Your session expired. Please log in again to continue.";
  }
  if (kind === "network") {
    return "Network connection issue. Please check your internet and try again.";
  }
  return "Something went wrong. Please try again.";
}
