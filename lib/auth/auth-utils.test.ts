import test from "node:test";
import assert from "node:assert/strict";
import { isAuthPath, isProtectedPath } from "./routing";
import { shouldRedirectToSessionExpired } from "./client-session";
import { classifyAuthError } from "./error";
import { shouldRetryAuthQuery } from "./session-query";

test("isAuthPath matches auth routes", () => {
  assert.equal(isAuthPath("/login"), true);
  assert.equal(isAuthPath("/auth/login"), true);
  assert.equal(isAuthPath("/register"), true);
  assert.equal(isAuthPath("/dashboard"), false);
});

test("isProtectedPath matches protected routes", () => {
  assert.equal(isProtectedPath("/dashboard"), true);
  assert.equal(isProtectedPath("/dashboard/orders"), true);
  assert.equal(isProtectedPath("/dashboard/"), true);
  assert.equal(isProtectedPath("/dashboard%2Forders"), true);
  assert.equal(isProtectedPath("/login"), false);
});

test("shouldRedirectToSessionExpired guards auth pages and auth APIs", () => {
  assert.equal(
    shouldRedirectToSessionExpired("/dashboard", "", "/api/auth/me"),
    true,
  );
  assert.equal(
    shouldRedirectToSessionExpired("/login", "?reason=session-expired", "/api/auth/me"),
    false,
  );
  assert.equal(
    shouldRedirectToSessionExpired("/dashboard", "", "/api/auth/login"),
    false,
  );
});

test("classifyAuthError and retry policy handle auth/network/server cases", () => {
  const unauthorizedError = new Error("session expired");
  const networkError = new Error("Network Error");
  const serverError = { response: { status: 500 } };

  assert.equal(classifyAuthError(unauthorizedError), "unauthorized");
  assert.equal(classifyAuthError(networkError), "network");
  assert.equal(classifyAuthError(serverError), "server");

  assert.equal(shouldRetryAuthQuery(unauthorizedError, 0), false);
  assert.equal(shouldRetryAuthQuery(networkError, 0), true);
  assert.equal(shouldRetryAuthQuery(networkError, 2), false);
  assert.equal(shouldRetryAuthQuery(serverError, 0), true);
  assert.equal(shouldRetryAuthQuery(serverError, 1), false);
});
