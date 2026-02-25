import axios from "./axios";
import { API } from "./endpoints";
import type { ApiSuccess } from "./types";

export type ReviewItem = {
  reviewId: string;
  transactionId: string;
  productId: string;
  reviewerId: string;
  revieweeId: string;
  rating: number;
  comment?: string;
  status?: string;
  createdAt?: string;
};

export const createReview = async (payload: {
  transactionId: string;
  productId: string;
  revieweeId: string;
  rating: number;
  comment?: string;
}): Promise<ApiSuccess<ReviewItem>> => {
  const response = await axios.post<ApiSuccess<ReviewItem>>(API.REVIEWS.CREATE, payload);
  return response.data;
};

export const listProductReviews = async (productId: string): Promise<ApiSuccess<ReviewItem[]>> => {
  const response = await axios.get<ApiSuccess<ReviewItem[]>>(API.REVIEWS.BY_PRODUCT(productId));
  return response.data;
};
