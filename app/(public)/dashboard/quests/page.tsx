"use client";

import { useEffect, useState } from "react";
import { completeQuest, listQuests, type Quest } from "@/lib/api/quest";
import DashboardPageScaffold from "../_components/DashboardPageScaffold";
import { DashboardSection, DashboardStatus } from "../_components/DashboardUIPrimitives";

export default function QuestsPage() {
  const [quests, setQuests] = useState<Quest[]>([]);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const response = await listQuests();
        if (response.success) {
          setQuests(response.data);
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load quests");
      }
    };
    load();
  }, []);

  const complete = async (questId: string) => {
    try {
      const response = await completeQuest(questId);
      if (!response.success) throw new Error(response.message || "Quest failed");
      setNotice("🎉 Quest completed!");
      setQuests((prev) => prev.filter((item) => item.questId !== questId));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Quest failed");
    }
  };

  return (
    <DashboardPageScaffold
      title="Quests"
      subtitle="Complete active quests to earn NeoTokens and XP rewards."
      routeLabel="Dashboard / Quests"
      maxWidth="max-w-4xl"
    >
        {error && <DashboardStatus tone="error">{error}</DashboardStatus>}
        {notice && <DashboardStatus tone="success">{notice}</DashboardStatus>}

        <DashboardSection title="Active Quests" subtitle="Claim rewards by completing eligible quest objectives.">
          {quests.map((quest) => (
            <div key={quest.questId} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-white/10 bg-white/[0.04] p-4">
              <div className="min-w-0">
                <p className="font-semibold text-white">{quest.title}</p>
                <p className="text-sm text-white/65">{quest.description}</p>
                <p className="text-xs text-white/55">Reward: {quest.rewardTokens} NeoTokens + {quest.rewardXP} XP</p>
              </div>
              <button className="btn-primary btn-sm" onClick={() => complete(quest.questId)}>
                Complete
              </button>
            </div>
          ))}
          {quests.length === 0 && <p className="empty-state">No active quests.</p>}
        </DashboardSection>
    </DashboardPageScaffold>
  );
}
