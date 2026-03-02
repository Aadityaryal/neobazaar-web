import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    files: ["**/*.{js,mjs,cjs,ts,tsx}"],
    ignores: ["lib/auth/constants.ts", "eslint.config.mjs"],
    rules: {
      "no-restricted-syntax": [
        "error",
        {
          selector: "Literal[value='session-expired']",
          message: "Use AUTH_REASON.SESSION_EXPIRED instead of hardcoded reason literals.",
        },
        {
          selector: "Literal[value='/login?reason=session-expired']",
          message: "Use AUTH_REASON.SESSION_EXPIRED + route helpers for session-expired redirects.",
        },
      ],
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
