"use client";

import { useEffect, useState } from "react";
import { getAdminUsers } from "@/lib/api/admin";

type AdminUser = {
  userId: string;
  name: string;
  email: string;
  role: string;
  location?: string;
  createdAt: string;
};

export default function AdminUserModerationQueuePage() {
  const [search, setSearch] = useState("");
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async (query = "") => {
    try {
      setError("");
      const response = await getAdminUsers(undefined, query ? { search: query } : undefined);
      if (!response.success) {
        throw new Error(response.message || "Failed to load users");
      }
      setUsers(response.data as AdminUser[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  return (
    <div className="page-shell">
      <div className="page-container">
        <div className="mx-auto max-w-6xl space-y-4">
          <div className="card">
            <h1 className="page-title">User Moderation Queue</h1>
            <p className="text-secondary">Review and action user moderation cases.</p>
          </div>
          <div className="card flex flex-wrap items-center gap-2">
            <input className="input-field max-w-lg" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search by name or email" />
            <button className="btn-secondary btn-sm" onClick={() => load(search)}>Search</button>
          </div>
          {error && <div className="alert-error">{error}</div>}
          <div className="space-y-2">
            {loading ? (
              <div className="card text-sm text-secondary">Loading users…</div>
            ) : users.length === 0 ? (
              <div className="card empty-state">No users found.</div>
            ) : (
              users.map((user) => (
                <div key={user.userId} className="card">
                  <p className="text-sm text-primary">{user.name} ({user.role})</p>
                  <p className="text-xs text-secondary">{user.email}</p>
                  <p className="text-xs text-secondary">{user.location || "Unknown"}</p>
                  <p className="text-xs text-muted">Created: {new Date(user.createdAt).toLocaleString()}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
