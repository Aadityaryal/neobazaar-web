"use client";

import { useState } from "react";
import { getRiskScoreForUser, type RiskScorePayload } from "@/lib/api/risk";

export default function AdminRiskScoringMonitorPage() {
  const [userId, setUserId] = useState("");
  const [result, setResult] = useState<RiskScorePayload | null>(null);
  const [error, setError] = useState("");

  const runScore = async () => {
    if (!userId.trim()) {
      setError("User ID is required");
      return;
    }
    try {
      setError("");
      const response = await getRiskScoreForUser(userId.trim());
      if (!response.success) {
        throw new Error("Failed to score user risk");
      }
      setResult(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to score user risk");
    }
  };

  return (
    <div className="page-shell">
      <div className="page-container">
        <div className="mx-auto max-w-6xl space-y-4">
          <div className="card">
            <h1 className="page-title">Risk Scoring Monitor</h1>
            <p className="text-secondary">Observe risk scoring distribution and high-risk entities.</p>
          </div>
          <div className="card flex flex-wrap items-center gap-2">
            <input className="input-field max-w-lg" value={userId} onChange={(event) => setUserId(event.target.value)} placeholder="User ID" />
            <button className="btn-primary btn-sm" onClick={runScore}>Score user</button>
          </div>
          {error && <div className="alert-error">{error}</div>}
          {result && (
            <div className="card space-y-1">
              <p className="text-sm text-primary">User: {result.userId}</p>
              <p className="text-sm text-secondary">Risk score: {result.score} ({result.band})</p>
              <p className="text-xs text-secondary">Open flags: {result.factors.openFlags}</p>
              <p className="text-xs text-secondary">Disputes: {result.factors.disputes}</p>
              <p className="text-xs text-secondary">Completed txns: {result.factors.completedTransactions}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
