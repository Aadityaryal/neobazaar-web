"use client";

import { useEffect, useState } from "react";
import { getAdminFlags, resolveAdminFlag } from "@/lib/api/admin";

type AdminFlag = {
  flagId: string;
  productId: string;
  sellerId: string;
  reason: "duplicate_image" | "transaction_dispute";
  detectedAt: string;
  resolved: boolean;
};

export default function AdminProductModerationQueuePage() {
  const [flags, setFlags] = useState<AdminFlag[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        setError("");
        const response = await getAdminFlags();
        if (!response.success) {
          throw new Error(response.message || "Failed to load moderation queue");
        }
        setFlags((response.data as AdminFlag[]).filter((item) => item.productId));
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load moderation queue");
      }
    };

    void load();
  }, []);

  const resolve = async (flagId: string) => {
    try {
      setError("");
      const response = await resolveAdminFlag(flagId);
      if (!response.success) {
        throw new Error(response.message || "Failed to resolve flag");
      }
      setFlags((prev) => prev.filter((item) => item.flagId !== flagId));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to resolve flag");
    }
  };

  return (
    <div className="page-shell">
      <div className="page-container">
        <div className="mx-auto max-w-6xl space-y-4">
          <div className="card">
            <h1 className="page-title">Product Moderation Queue</h1>
            <p className="text-secondary">Inspect flagged products and moderation decisions.</p>
          </div>
          {error && <div className="alert-error">{error}</div>}
          <div className="space-y-3">
            {flags.length === 0 ? (
              <div className="card empty-state">No flagged products in queue.</div>
            ) : (
              flags.map((item) => (
                <div key={item.flagId} className="card">
                  <p className="text-sm text-primary">Product {item.productId}</p>
                  <p className="text-xs text-secondary">Reason: {item.reason}</p>
                  <p className="text-xs text-secondary">Seller: {item.sellerId}</p>
                  <button className="btn-primary btn-sm mt-2" onClick={() => resolve(item.flagId)}>Resolve</button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
