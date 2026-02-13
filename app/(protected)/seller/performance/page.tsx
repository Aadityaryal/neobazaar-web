"use client";

import { useEffect, useState } from "react";
import { getSellerListingAnalytics, type SellerListingPerformance } from "@/lib/api/seller";

export default function SellerPerformanceDashboardPage() {
  const [totals, setTotals] = useState<{ listings: number; completedTransactions: number; revenueTokens: number } | null>(null);
  const [rows, setRows] = useState<SellerListingPerformance[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        setError("");
        const response = await getSellerListingAnalytics();
        if (!response.success) {
          throw new Error("Failed to load performance metrics");
        }
        setTotals(response.data.totals);
        setRows(response.data.byProduct || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load performance metrics");
      }
    };

    void load();
  }, []);

  return (
    <div className="page-shell">
      <div className="page-container">
        <div className="mx-auto max-w-5xl space-y-4">
          <div className="card">
            <h1 className="page-title">Performance Dashboard</h1>
            <p className="text-secondary">Track listing performance, conversion signals, and seller KPIs.</p>
          </div>

          {error && <div className="alert-error">{error}</div>}

          {totals && (
            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
              <div className="card"><p className="text-xs text-secondary">Listings</p><p className="text-lg font-semibold text-primary">{totals.listings}</p></div>
              <div className="card"><p className="text-xs text-secondary">Completed Transactions</p><p className="text-lg font-semibold text-primary">{totals.completedTransactions}</p></div>
              <div className="card"><p className="text-xs text-secondary">Revenue Tokens</p><p className="text-lg font-semibold text-primary">{totals.revenueTokens}</p></div>
            </div>
          )}

          <div className="space-y-2">
            {rows.length === 0 ? (
              <div className="card empty-state">No listing analytics available.</div>
            ) : (
              rows.map((row) => (
                <div key={row.productId} className="card">
                  <p className="text-sm text-primary">{row.title}</p>
                  <p className="text-xs text-secondary">Mode: {row.mode}</p>
                  <p className="text-xs text-secondary">Sales: {row.salesCount} · Revenue: {row.revenueTokens}</p>
                  <p className="text-xs text-secondary">Listed: {row.listedPrice} · AI Suggested: {row.aiSuggestedPrice}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
