import axios from "./axios";
import { PILOT_V1 } from "./pilot-v1-adapter";
import type { ApiSuccess } from "./types";

export type OrderItem = {
  orderId: string;
  buyerId: string;
  sellerId: string;
  productId: string;
  transactionId: string;
  status: string;
  timeline: Array<{ at: string; status: string; actor: string; note?: string }>;
};

export const listOrders = async (): Promise<ApiSuccess<OrderItem[]>> => {
  const response = await axios.get<ApiSuccess<OrderItem[]>>(PILOT_V1.ORDERS.LIST);
  return response.data;
};

export const getOrderTimeline = async (orderId: string): Promise<ApiSuccess<Array<{ at: string; status: string; actor: string; note?: string }>>> => {
  const response = await axios.get<ApiSuccess<Array<{ at: string; status: string; actor: string; note?: string }>>>(PILOT_V1.ORDERS.TIMELINE(orderId));
  return response.data;
};

export const appendOrderTimeline = async (
  orderId: string,
  payload: { status: string; note?: string },
): Promise<ApiSuccess<OrderItem>> => {
  const response = await axios.post<ApiSuccess<OrderItem>>(PILOT_V1.ORDERS.TIMELINE(orderId), payload);
  return response.data;
};
