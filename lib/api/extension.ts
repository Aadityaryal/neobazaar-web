import axios from "./axios";
import { API } from "./endpoints";

const NEGOTIATION_FALLBACK_TEXT = "Could you offer a fair price?";

export const detectAI = async (payload: { productId?: string; image: string }) => {
  const response = await axios.post(API.EXTENSION.DETECT, payload);
  return response.data;
};

export const priceAI = async (payload: { productId?: string; category: string; condition: string; location: string }) => {
  const response = await axios.post(API.EXTENSION.PRICE, payload);
  return response.data;
};

export const fraudAI = async (payload: { productId?: string; imageHash: string }) => {
  const response = await axios.post(API.EXTENSION.FRAUD, payload);
  return response.data;
};

export const recommendProducts = async () => {
  const response = await axios.post(API.EXTENSION.RECOMMEND, { recentViews: [] });
  if (response.data?.success) {
    const strategy = response.data?.meta?.explainability?.strategy;
    const fallbackLabel = strategy === "fallback-recent"
      ? "Fallback recommendations: recent listings"
      : "Personalized recommendations";
    return {
      ...response.data,
      fallbackLabel,
    };
  }
  return response.data;
};

export const nlpSuggest = async (messages: Array<{ senderId: string; content: string }>) => {
  try {
    const response = await axios.post(API.EXTENSION.NLP_SUGGEST, { messages });
    if (response.data?.success) {
      return {
        ...response.data,
        fallbackLabel: "AI negotiation suggestion",
      };
    }
    return response.data;
  } catch {
    return {
      success: true,
      suggestionText: NEGOTIATION_FALLBACK_TEXT,
      fallbackLabel: "Fallback negotiation suggestion",
    };
  }
};
