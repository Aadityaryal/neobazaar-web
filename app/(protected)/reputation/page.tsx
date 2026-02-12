"use client";

import { useEffect, useState } from "react";
import { getMe } from "@/lib/api/auth";

type ReputationUser = {
  userId: string;
  name: string;
  xp?: number;
  reputationScore?: number;
  badges?: string[];
  profileCompletenessScore?: number;
};

export default function SharedBadgeReputationPage() {
  const [user, setUser] = useState<ReputationUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        setError("");
        const response = await getMe();
        if (!response.success) {
          throw new Error("Failed to load profile");
        }
        setUser(response.data as ReputationUser);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load profile");
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, []);

  return (
    <div className="page-shell">
      <div className="page-container">
        <div className="mx-auto max-w-5xl space-y-4">
          <div className="card">
            <h1 className="page-title">Badge/Reputation</h1>
            <p className="text-secondary">Review earned badges and reputation signals.</p>
          </div>

          {error && <div className="alert-error">{error}</div>}

          {loading ? (
            <div className="card text-sm text-secondary">Loading reputation…</div>
          ) : user ? (
            <div className="card space-y-2">
              <p className="text-sm text-primary">User: {user.name}</p>
              <p className="text-sm text-secondary">XP: {user.xp ?? 0}</p>
              <p className="text-sm text-secondary">Reputation score: {user.reputationScore ?? 0}</p>
              <p className="text-sm text-secondary">Profile completeness: {user.profileCompletenessScore ?? 0}%</p>
              <p className="text-sm text-secondary">Badges: {user.badges?.length ? user.badges.join(", ") : "No badges yet"}</p>
            </div>
          ) : (
            <div className="card empty-state">No user profile data available.</div>
          )}
        </div>
      </div>
    </div>
  );
}
