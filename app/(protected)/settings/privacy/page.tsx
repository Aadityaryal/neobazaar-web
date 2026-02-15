"use client";

import { useEffect, useState } from "react";
import { getMe } from "@/lib/api/auth";

type PrivacyUser = {
  email: string;
  location?: string;
  emailVerified?: boolean;
  kycStatus?: string;
  profileCompletenessScore?: number;
};

export default function SharedPrivacySettingsPage() {
  const [user, setUser] = useState<PrivacyUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        setError("");
        const response = await getMe();
        if (!response.success) {
          throw new Error("Failed to load privacy data");
        }
        setUser(response.data as PrivacyUser);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load privacy data");
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
            <h1 className="page-title">Privacy Settings</h1>
            <p className="text-secondary">Configure data visibility and privacy controls.</p>
          </div>

          {error && <div className="alert-error">{error}</div>}

          {loading ? (
            <div className="card text-sm text-secondary">Loading privacy data…</div>
          ) : user ? (
            <div className="card space-y-2">
              <p className="text-sm text-primary">Email: {user.email}</p>
              <p className="text-sm text-secondary">Email verified: {user.emailVerified ? "Yes" : "No"}</p>
              <p className="text-sm text-secondary">Location: {user.location || "Not set"}</p>
              <p className="text-sm text-secondary">KYC status: {user.kycStatus || "Unknown"}</p>
              <p className="text-sm text-secondary">Profile completeness: {user.profileCompletenessScore ?? 0}%</p>
            </div>
          ) : (
            <div className="card empty-state">No privacy profile data available.</div>
          )}
        </div>
      </div>
    </div>
  );
}
