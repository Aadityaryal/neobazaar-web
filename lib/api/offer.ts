import axios from "./axios";
import { PILOT_V1 } from "./pilot-v1-adapter";
import type { ApiSuccess } from "./types";
import type { UnifiedOffer } from "@/lib/offers/model";

export const listOffers = async (): Promise<ApiSuccess<UnifiedOffer[]>> => {
  const response = await axios.get<ApiSuccess<UnifiedOffer[]>>(PILOT_V1.OFFERS.LIST);
  return response.data;
};

export const createOffer = async (payload: { productId: string; amount: number; expiresAt?: string }): Promise<ApiSuccess<UnifiedOffer>> => {
  const response = await axios.post<ApiSuccess<UnifiedOffer>>(PILOT_V1.OFFERS.CREATE, payload);
  return response.data;
};

export const counterOffer = async (offerId: string, counterAmount: number): Promise<ApiSuccess<UnifiedOffer>> => {
  const response = await axios.post<ApiSuccess<UnifiedOffer>>(PILOT_V1.OFFERS.COUNTER(offerId), { counterAmount });
  return response.data;
};

export const acceptOffer = async (offerId: string): Promise<ApiSuccess<UnifiedOffer>> => {
  const response = await axios.post<ApiSuccess<UnifiedOffer>>(PILOT_V1.OFFERS.ACCEPT(offerId));
  return response.data;
};

export const rejectOffer = async (offerId: string): Promise<ApiSuccess<UnifiedOffer>> => {
  const response = await axios.post<ApiSuccess<UnifiedOffer>>(PILOT_V1.OFFERS.REJECT(offerId));
  return response.data;
};
