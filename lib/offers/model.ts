export const OFFER_STATUS = {
  PENDING: "pending",
  COUNTERED: "countered",
  ACCEPTED: "accepted",
  REJECTED: "rejected",
} as const;

export type OfferStatus = (typeof OFFER_STATUS)[keyof typeof OFFER_STATUS];

export type UnifiedOffer = {
  offerId: string;
  productId: string;
  buyerId: string;
  sellerId: string;
  amount: number;
  status: OfferStatus;
  counterAmount?: number;
  expiresAt?: string;
  createdAt?: string;
};

export const OFFER_STATUS_LABEL: Record<OfferStatus, string> = {
  pending: "Pending",
  countered: "Countered",
  accepted: "Accepted",
  rejected: "Rejected",
};
