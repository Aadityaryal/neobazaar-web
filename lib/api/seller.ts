import axios from "./axios";
import { API } from "./endpoints";

export type SellerListingPerformance = {
  productId: string;
  title: string;
  mode: "buy_now" | "auction" | "donate";
  salesCount: number;
  revenueTokens: number;
  aiSuggestedPrice: number;
  listedPrice: number;
};

export const getSellerListingAnalytics = async () => {
  const response = await axios.get(API.SELLER.ANALYTICS_LISTINGS);
  return response.data as {
    success: boolean;
    data: {
      totals: { listings: number; completedTransactions: number; revenueTokens: number };
      byProduct: SellerListingPerformance[];
    };
  };
};

export const bulkImportListings = async (items: Array<{
  title: string;
  description: string;
  category: string;
  location: string;
  mode: "buy_now" | "auction" | "donate";
  priceListed: number;
  images?: string[];
}>) => {
  const response = await axios.post(API.SELLER.BULK_IMPORT, { items });
  return response.data as {
    success: boolean;
    data: { createdCount: number; rejectedCount: number; rejected: Array<{ index: number; reason: string }> };
  };
};

export const getSellerPayoutLedger = async () => {
  const response = await axios.get(API.SELLER.PAYOUT_LEDGER);
  return response.data as {
    success: boolean;
    data: {
      totalSettledTokens: number;
      entries: Array<{ ledgerId: string; type: string; transactionId: string; amountTokens: number; settledAt: string }>;
    };
  };
};
