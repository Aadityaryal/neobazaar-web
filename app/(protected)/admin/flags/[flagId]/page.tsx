"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getAdminFlags, resolveAdminFlag } from "@/lib/api/admin";

type AdminFlag = {
  flagId: string;
  productId: string;
  sellerId: string;
  reason: "duplicate_image" | "transaction_dispute";
  detectedAt: string;
  resolved: boolean;
};

export default function AdminFlagTriageDetailPage() {
  const params = useParams<{ flagId: string }>();
  const [flag, setFlag] = useState<AdminFlag | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        setError("");
        const response = await getAdminFlags();
        if (!response.success) {
          throw new Error(response.message || "Failed to load flags");
        }
        const match = (response.data as AdminFlag[]).find((item) => item.flagId === params.flagId) || null;
        setFlag(match);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load flags");
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [params.flagId]);

  const resolve = async () => {
    if (!flag) {
      return;
    }
    try {
      setError("");
      const response = await resolveAdminFlag(flag.flagId);
      if (!response.success) {
        throw new Error(response.message || "Failed to resolve flag");
      }
      setFlag(response.data as AdminFlag);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to resolve flag");
    }
  };

  return (
    <div className="page-shell">
      <div className="page-container">
        <div className="mx-auto max-w-6xl space-y-4">
          <div className="card">
            <h1 className="page-title">Flag Triage Detail</h1>
            <p className="text-secondary">Flag ID: {params.flagId}</p>
          </div>

          {error && <div className="alert-error">{error}</div>}

          {loading ? (
            <div className="card text-sm text-secondary">Loading flag…</div>
          ) : !flag ? (
            <div className="card empty-state">Flag not found in unresolved queue.</div>
          ) : (
            <div className="card space-y-2">
              <p className="text-sm text-primary">Reason: {flag.reason}</p>
              <p className="text-xs text-secondary">Product: {flag.productId}</p>
              <p className="text-xs text-secondary">Seller: {flag.sellerId}</p>
              <p className="text-xs text-muted">Detected: {new Date(flag.detectedAt).toLocaleString()}</p>
              <p className="text-xs text-secondary">Resolved: {flag.resolved ? "Yes" : "No"}</p>
              {!flag.resolved && (
                <button className="btn-primary btn-sm" onClick={resolve}>
                  Resolve flag
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
