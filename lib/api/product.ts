import axios from "./axios";
import { API } from "./endpoints";
import type { ApiSuccess } from "./types";

export type ProductMode = "buy_now" | "auction" | "donate";

export type Product = {
    productId: string;
    sellerId: string;
    title: string;
    description: string;
    category: string;
    images: string[];
    priceListed: number;
    aiSuggestedPrice: number;
    aiCondition: string;
    aiVerified: boolean;
    aiConfidence?: number;
    aiFallback?: boolean;
    aiFallbackLabel?: string;
    mode: ProductMode;
    location: string;
    createdAt: string;
};

export const listProducts = async (filters?: { sellerId?: string; category?: string; location?: string; mode?: string; page?: number; limit?: number; sort?: "newest" | "oldest" | "price_asc" | "price_desc" }) => {
    const response = await axios.get<ApiSuccess<Product[]>>(API.PRODUCTS.LIST, { params: filters });
    return response.data;
};

export const listSavedProducts = async (limit = 50) => {
    const response = await axios.get<ApiSuccess<Array<Product & { savedAt: string }>>>(API.PRODUCTS.SAVED, {
        params: { limit },
    });
    return response.data;
};

export const saveProduct = async (productId: string) => {
    const response = await axios.post<ApiSuccess<Record<string, unknown>>>(API.PRODUCTS.SAVE(productId));
    return response.data;
};

export const unsaveProduct = async (productId: string) => {
    const response = await axios.delete<ApiSuccess<Record<string, unknown>>>(API.PRODUCTS.SAVE(productId));
    return response.data;
};

export const listRecentViewedProducts = async (limit = 20) => {
    const response = await axios.get<ApiSuccess<Array<Product & { viewedAt: string }>>>(API.PRODUCTS.RECENT_VIEWED, {
        params: { limit },
    });
    return response.data;
};

export const recordProductView = async (productId: string) => {
    const response = await axios.post<ApiSuccess<Record<string, unknown>>>(API.PRODUCTS.VIEW(productId));
    return response.data;
};

export const getProductById = async (productId: string) => {
    const response = await axios.get<ApiSuccess<Product>>(API.PRODUCTS.DETAIL(productId));
    return response.data;
};

export const getPublicProductPayload = async (productId: string) => {
    const response = await axios.get<ApiSuccess<Product>>(API.PRODUCTS.PUBLIC(productId));
    return response.data;
};

export const createProduct = async (payload: {
    title: string;
    description: string;
    category: string;
    images: string[];
    priceListed: number;
    mode: ProductMode;
    location: string;
}) => {
    const response = await axios.post<ApiSuccess<Product>>(API.PRODUCTS.CREATE, payload);
    return response.data;
};
