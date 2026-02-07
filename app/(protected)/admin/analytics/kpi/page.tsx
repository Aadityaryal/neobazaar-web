"use client";

import { useEffect, useState } from "react";
import { getAdminDisputes, getAdminFlags, getAdminUsers } from "@/lib/api/admin";

export default function AdminMarketplaceKpisPage() {
  const [metrics, setMetrics] = useState<{
    users: number;
    openFlags: number;
    openDisputes: number;
    resolvedDisputes: number;
  } | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        setError("");
        const [usersRes, flagsRes, openDisputesRes, resolvedDisputesRes] = await Promise.all([
          getAdminUsers(undefined, { page: "1", limit: "1" }),
          getAdminFlags(),
          getAdminDisputes({ status: "open", page: 1, limit: 1 }),
          getAdminDisputes({ status: "resolved", page: 1, limit: 1 }),
        ]);

        if (!usersRes.success || !flagsRes.success || !openDisputesRes.success || !resolvedDisputesRes.success) {
          throw new Error("Failed to load KPIs");
        }

        setMetrics({
          users: usersRes.meta?.total || (usersRes.data?.length || 0),
          openFlags: (flagsRes.data as unknown[]).length,
          openDisputes: openDisputesRes.meta?.total || 0,
          resolvedDisputes: resolvedDisputesRes.meta?.total || 0,
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load KPIs");
      }
    };

    void load();
  }, []);

  return (
    <div className="page-shell">
      <div className="page-container">
        <div className="mx-auto max-w-6xl space-y-4">
          <div className="card">
            <h1 className="page-title">Marketplace KPIs</h1>
            <p className="text-secondary">Track macro performance indicators for the marketplace.</p>
          </div>

          {error && <div className="alert-error">{error}</div>}

          {!metrics ? (
            <div className="card text-sm text-secondary">Loading KPI metrics…</div>
          ) : (
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
              <div className="card">
                <p className="text-xs text-secondary">Total Users</p>
                <p className="text-lg font-semibold text-primary">{metrics.users}</p>
              </div>
              <div className="card">
                <p className="text-xs text-secondary">Open Flags</p>
                <p className="text-lg font-semibold text-primary">{metrics.openFlags}</p>
              </div>
              <div className="card">
                <p className="text-xs text-secondary">Open Disputes</p>
                <p className="text-lg font-semibold text-primary">{metrics.openDisputes}</p>
              </div>
              <div className="card">
                <p className="text-xs text-secondary">Resolved Disputes</p>
                <p className="text-lg font-semibold text-primary">{metrics.resolvedDisputes}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
