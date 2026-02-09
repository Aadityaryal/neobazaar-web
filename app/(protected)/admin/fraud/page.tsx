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

export default function AdminFraudSignalsDashboardPage() {
  const [flags, setFlags] = useState<AdminFlag[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async () => {
    try {
      setError("");
      const response = await getAdminFlags();
      if (!response.success) {
        throw new Error(response.message || "Failed to load fraud signals");
      }
      setFlags(response.data as AdminFlag[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load fraud signals");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const resolve = async (flagId: string) => {
    try {
      setError("");
      const response = await resolveAdminFlag(flagId);
      if (!response.success) {
        throw new Error(response.message || "Failed to resolve signal");
      }
      setFlags((prev) => prev.filter((item) => item.flagId !== flagId));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to resolve signal");
    }
  };

  return (
    <div className="page-shell">
      <div className="page-container">
        <div className="mx-auto max-w-6xl space-y-4">
          <div className="card">
            <h1 className="page-title">Fraud Signals Dashboard</h1>
            <p className="text-secondary">Monitor fraud detections and escalation alerts.</p>
          </div>
          {error && <div className="alert-error">{error}</div>}
          <div className="space-y-3">
            {loading ? (
              <div className="card text-sm text-secondary">Loading fraud signals…</div>
            ) : flags.length === 0 ? (
              <div className="card empty-state">No active fraud signals.</div>
            ) : (
              flags.map((item) => (
                <div key={item.flagId} className="card">
                  <p className="text-sm text-primary">{item.reason}</p>
                  <p className="text-xs text-secondary">Flag: {item.flagId}</p>
                  <p className="text-xs text-secondary">Seller: {item.sellerId}</p>
                  <p className="text-xs text-secondary">Product: {item.productId}</p>
                  <p className="text-xs text-muted">Detected: {new Date(item.detectedAt).toLocaleString()}</p>
                  <button className="btn-secondary btn-sm mt-2" onClick={() => resolve(item.flagId)}>Resolve</button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
