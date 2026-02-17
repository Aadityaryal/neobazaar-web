"use client";

import { useEffect, useMemo, useState } from "react";
import { getLeaderboard, type LeaderboardTab } from "@/lib/api/leaderboard";
import DashboardPageScaffold from "../_components/DashboardPageScaffold";
import { DashboardSection, DashboardSurface, DashboardStatus } from "../_components/DashboardUIPrimitives";

type BoardUser = {
  userId: string;
  name: string;
  xp: number;
  reputationScore: number;
};

const tabs: LeaderboardTab[] = ["global", "local"];

export default function LeaderboardPage() {
  const [tab, setTab] = useState<LeaderboardTab>("global");
  const [rows, setRows] = useState<BoardUser[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const response = await getLeaderboard(tab);
        if (response.success) {
          setRows(response.data);
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load leaderboard");
      }
    };
    load();
  }, [tab]);

  const ranked = useMemo(() => rows.map((user, index) => ({ ...user, rank: index + 1 })), [rows]);

  return (
    <DashboardPageScaffold
      title="Leaderboard"
      subtitle="Track top users by XP and reputation across global and local pools."
      routeLabel="Dashboard / Leaderboard"
      maxWidth="max-w-4xl"
    >
        {error && <DashboardStatus tone="error">{error}</DashboardStatus>}

        <DashboardSurface className="flex flex-wrap gap-2 p-4">
          {tabs.map((item) => (
            <button
              key={item}
              className={`tab-chip ${tab === item ? "tab-chip-active" : ""}`}
              onClick={() => setTab(item)}
            >
              {item}
            </button>
          ))}
        </DashboardSurface>

        <DashboardSection title="Rankings" subtitle="Sorted by XP, then reputation score." className="p-0">
          <div className="-mt-4 overflow-hidden">
            {ranked.map((user) => (
              <div key={user.userId} className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 px-4 py-3">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white">{user.rank}</div>
                  <div className="h-8 w-8 rounded-full bg-primary-600/30" />
                  <p className="truncate text-white">{user.name}</p>
                </div>
                <div className="text-sm text-white/65">XP: {user.xp} · Reputation: {user.reputationScore}</div>
              </div>
            ))}
            {ranked.length === 0 && <p className="px-4 py-5 text-white/40">No users found.</p>}
          </div>
        </DashboardSection>
    </DashboardPageScaffold>
  );
}
