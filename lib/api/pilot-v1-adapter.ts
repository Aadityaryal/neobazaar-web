import type { paths } from "./generated/openapi";

const API_V1_PREFIX = "/api/v1";

type PilotOpenApiPath = Extract<
  keyof paths,
  | "/offers"
  | "/offers/:offerId/counter"
  | "/offers/:offerId/accept"
  | "/offers/:offerId/reject"
  | "/orders"
  | "/orders/:orderId/timeline"
  | "/transactions"
  | "/transactions/:txnId/confirm"
  | "/transactions/:txnId/dispute"
  | "/transactions/:txnId/dispute/evidence"
  | "/bids"
>;

const assertPath = <TPath extends PilotOpenApiPath>(path: TPath) => path;

const fillPath = (template: string, values: Record<string, string>) => {
  let resolved = template;
  for (const [key, value] of Object.entries(values)) {
    resolved = resolved.replace(`:${key}`, encodeURIComponent(value));
  }
  return resolved;
};

export const PILOT_V1 = {
  OFFERS: {
    LIST: `${API_V1_PREFIX}${assertPath("/offers")}`,
    CREATE: `${API_V1_PREFIX}${assertPath("/offers")}`,
    COUNTER: (offerId: string) =>
      `${API_V1_PREFIX}${fillPath(assertPath("/offers/:offerId/counter"), { offerId })}`,
    ACCEPT: (offerId: string) =>
      `${API_V1_PREFIX}${fillPath(assertPath("/offers/:offerId/accept"), { offerId })}`,
    REJECT: (offerId: string) =>
      `${API_V1_PREFIX}${fillPath(assertPath("/offers/:offerId/reject"), { offerId })}`,
  },
  ORDERS: {
    LIST: `${API_V1_PREFIX}${assertPath("/orders")}`,
    TIMELINE: (orderId: string) =>
      `${API_V1_PREFIX}${fillPath(assertPath("/orders/:orderId/timeline"), { orderId })}`,
  },
  TRANSACTIONS: {
    LIST: `${API_V1_PREFIX}${assertPath("/transactions")}`,
    CREATE: `${API_V1_PREFIX}${assertPath("/transactions")}`,
    CONFIRM: (txnId: string) =>
      `${API_V1_PREFIX}${fillPath(assertPath("/transactions/:txnId/confirm"), { txnId })}`,
    DISPUTE: (txnId: string) =>
      `${API_V1_PREFIX}${fillPath(assertPath("/transactions/:txnId/dispute"), { txnId })}`,
    DISPUTE_EVIDENCE: (txnId: string) =>
      `${API_V1_PREFIX}${fillPath(assertPath("/transactions/:txnId/dispute/evidence"), { txnId })}`,
  },
  BIDS: {
    CREATE: `${API_V1_PREFIX}${assertPath("/bids")}`,
  },
} as const;