"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { getMe } from "@/lib/api/auth";
import { listQuests } from "@/lib/api/quest";
import DashboardPageScaffold from "../_components/DashboardPageScaffold";
import { DashboardStatus, DashboardSurface } from "../_components/DashboardUIPrimitives";

export default function BuyerRewardsCenterPage() {
  const rewardsQuery = useQuery<{ streak: number; tokens: number; badges: number }>({
    queryKey: ["dashboard", "rewards"],
    queryFn: async () => {
      const [meResponse, questsResponse] = await Promise.all([getMe(), listQuests()]);
      if (!meResponse.success) {
        throw new Error(meResponse.message || "Failed to load profile");
      }
      if (!questsResponse.success) {
        throw new Error(questsResponse.message || "Failed to load quests");
      }

      const user = meResponse.data as { neoTokens?: number; badges?: string[]; completedQuests?: number };
      const quests = questsResponse.data as Array<{ rewardTokens?: number }>;
      const totalQuestRewardTokens = quests.reduce((sum, item) => sum + Number(item.rewardTokens ?? 0), 0);

      return {
        streak: Number(user.completedQuests ?? 0),
        tokens: Number(user.neoTokens ?? 0) + totalQuestRewardTokens,
        badges: Array.isArray(user.badges) ? user.badges.length : 0,
      };
    },
  });

  return (
    <DashboardPageScaffold
      title="Rewards Center"
      subtitle="Track quest progress, token rewards, and badge unlocks."
      routeLabel="Dashboard / Rewards"
      actions={
        <>
          <Link href="/dashboard/quests" className="btn-primary btn-sm">Open quests</Link>
          <Link href="/dashboard/leaderboard" className="btn-secondary btn-sm">Leaderboard</Link>
        </>
      }
    >
      {rewardsQuery.isError && <DashboardStatus tone="error">{(rewardsQuery.error as Error).message}</DashboardStatus>}

      <section className="grid gap-3 sm:grid-cols-3">
        <DashboardSurface className="p-4">
          <p className="text-xs text-white/45">Current Streak</p>
          <p className="mt-1 text-lg font-bold text-white">{rewardsQuery.data?.streak ?? 0} Days</p>
        </DashboardSurface>
        <DashboardSurface className="p-4">
          <p className="text-xs text-white/45">Token Rewards</p>
          <p className="mt-1 text-lg font-bold text-white">{rewardsQuery.data?.tokens ?? 0} NBT</p>
        </DashboardSurface>
        <DashboardSurface className="p-4">
          <p className="text-xs text-white/45">Badges Unlocked</p>
          <p className="mt-1 text-lg font-bold text-amber-300">{(rewardsQuery.data?.badges ?? 0) > 0 ? rewardsQuery.data?.badges : "None yet"}</p>
        </DashboardSurface>
      </section>
    </DashboardPageScaffold>
  );
}
