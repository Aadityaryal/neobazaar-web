"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getSellerListingAnalytics, type SellerListingPerformance } from "@/lib/api/seller";

export default function SellerListingAnalyticsDetailPage() {
  const params = useParams<{ listingId: string }>();
  const [row, setRow] = useState<SellerListingPerformance | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        setError("");
        const response = await getSellerListingAnalytics();
        if (!response.success) {
          throw new Error("Failed to load listing analytics");
        }
        const match = response.data.byProduct.find((item) => item.productId === params.listingId) || null;
        setRow(match);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load listing analytics");
      }
    };

    void load();
  }, [params.listingId]);

  return (
    <div className="page-shell">
      <div className="page-container">
        <div className="mx-auto max-w-5xl space-y-4">
          <div className="card">
            <h1 className="page-title">Listing Analytics Detail</h1>
            <p className="text-secondary">Listing ID: {params.listingId}</p>
          </div>
          {error && <div className="alert-error">{error}</div>}
          {row ? (
            <div className="card space-y-1">
              <p className="text-sm text-primary">Title: {row.title}</p>
              <p className="text-xs text-secondary">Mode: {row.mode}</p>
              <p className="text-xs text-secondary">Sales: {row.salesCount}</p>
              <p className="text-xs text-secondary">Revenue: {row.revenueTokens} tokens</p>
              <p className="text-xs text-secondary">Listed price: {row.listedPrice}</p>
              <p className="text-xs text-secondary">AI suggested price: {row.aiSuggestedPrice}</p>
            </div>
          ) : (
            <div className="card empty-state">No analytics found for this listing.</div>
          )}
        </div>
      </div>
    </div>
  );
}
