export const ORDER_STATUS = {
  PENDING: "pending",
  ESCROW: "escrow",
  COMPLETED: "completed",
  DISPUTED: "disputed",
  REFUNDED: "refunded",
} as const;

export type OrderStatus = (typeof ORDER_STATUS)[keyof typeof ORDER_STATUS];

export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  [ORDER_STATUS.PENDING]: "Pending",
  [ORDER_STATUS.ESCROW]: "In Escrow",
  [ORDER_STATUS.COMPLETED]: "Completed",
  [ORDER_STATUS.DISPUTED]: "Disputed",
  [ORDER_STATUS.REFUNDED]: "Refunded",
};

export const isOrderStatus = (value: unknown): value is OrderStatus => {
  return typeof value === "string" && Object.values(ORDER_STATUS).includes(value as OrderStatus);
};
