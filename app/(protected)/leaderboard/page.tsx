"use client";

import { useEffect, useState } from "react";
import { getLeaderboard, type LeaderboardTab } from "@/lib/api/leaderboard";

type LeaderboardRow = {
  userId: string;
  name?: string;
  xp?: number;
  reputationScore?: number;
  location?: string;
  badges?: string[];
};

export default function SharedLeaderboardPage() {
  const [tab, setTab] = useState<LeaderboardTab>("global");
  const [rows, setRows] = useState<LeaderboardRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadLeaderboard = async (selectedTab: LeaderboardTab) => {
    try {
      setLoading(true);
      setError("");
      const response = await getLeaderboard(selectedTab);
      if (!response?.success) {
        throw new Error(response?.message || "Failed to load leaderboard");
      }
      setRows(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load leaderboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadLeaderboard(tab);
  }, [tab]);

  return (
    <div className="page-shell">
      <div className="page-container">
        <div className="mx-auto max-w-5xl space-y-4">
          <div className="card space-y-3">
            <h1 className="page-title">Leaderboard</h1>
            <p className="text-secondary">Rankings across global and local segments.</p>
            <div className="flex flex-wrap gap-2">
              {(["global", "local"] as LeaderboardTab[]).map((value) => (
                <button
                  key={value}
                  className={value === tab ? "btn-primary btn-sm" : "btn-secondary btn-sm"}
                  onClick={() => setTab(value)}
                >
                  {value}
                </button>
              ))}
            </div>
          </div>

          {error && <div className="alert-error">{error}</div>}

          <div className="space-y-3">
            {loading ? (
              <div className="card text-sm text-secondary">Loading leaderboard…</div>
            ) : rows.length === 0 ? (
              <div className="card empty-state">No leaderboard entries.</div>
            ) : (
              rows.map((row, index) => (
                <div key={row.userId} className="card flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="text-sm font-medium text-primary">#{index + 1} {row.name || row.userId}</p>
                    <p className="text-xs text-secondary">XP: {row.xp ?? 0} · Reputation: {row.reputationScore ?? 0}</p>
                    <p className="text-xs text-muted">{row.location || "Unknown location"}</p>
                    <p className="text-xs text-secondary">Badges: {row.badges?.length ? row.badges.join(", ") : "None"}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
