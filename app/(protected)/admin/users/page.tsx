"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { deleteAdminUser, getAdminUsers } from "@/lib/api/admin";

type AdminUserRow = {
  userId: string;
  name: string;
  firstName?: string;
  lastName?: string;
  email: string;
  role: string;
  location?: string;
  createdAt?: string;
};

export default function AdminUsersPage() {
  const [rows, setRows] = useState<AdminUserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionMessage, setActionMessage] = useState("");

  const load = async () => {
    try {
      setError("");
      const response = await getAdminUsers();
      if (!response.success) {
        throw new Error(response.message || "Failed to load users");
      }
      setRows((response.data || []) as AdminUserRow[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const remove = async (userId: string) => {
    if (!window.confirm(`Delete user ${userId}?`)) {
      return;
    }

    try {
      setError("");
      setActionMessage("");
      const response = await deleteAdminUser(userId);
      if (!response.success) {
        throw new Error(response.message || "Failed to delete user");
      }
      setRows((prev) => prev.filter((item) => item.userId !== userId));
      setActionMessage(`Deleted user ${userId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete user");
    }
  };

  return (
    <div className="page-shell">
      <div className="page-container">
        <div className="mx-auto max-w-6xl space-y-4">
          <div className="card flex flex-wrap items-center justify-between gap-2">
            <div>
              <h1 className="page-title">Admin Users</h1>
              <p className="text-secondary">Create, inspect, edit, and remove user accounts.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link href="/admin/users/create" className="btn-primary btn-sm">Create user</Link>
              <Link href="/admin" className="btn-secondary btn-sm">Back to admin</Link>
            </div>
          </div>

          {error && <div className="alert-error">{error}</div>}
          {actionMessage && <div className="alert-success">{actionMessage}</div>}

          <div className="space-y-3">
            {loading ? (
              <div className="card text-sm text-secondary">Loading users…</div>
            ) : rows.length === 0 ? (
              <div className="card empty-state">No users found.</div>
            ) : (
              rows.map((row) => (
                <div key={row.userId} className="card flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-primary">{row.name || [row.firstName, row.lastName].filter(Boolean).join(" ") || "Unnamed"}</p>
                    <p className="text-xs text-secondary">User ID: {row.userId}</p>
                    <p className="text-xs text-secondary">Email: {row.email}</p>
                    <p className="text-xs text-secondary">Role: {row.role}</p>
                    <p className="text-xs text-secondary">Location: {row.location || "-"}</p>
                    {row.createdAt && <p className="text-xs text-muted">Created: {new Date(row.createdAt).toLocaleString()}</p>}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Link href={`/admin/users/${row.userId}`} className="btn-secondary btn-sm">Open</Link>
                    <button className="btn-secondary btn-sm" onClick={() => remove(row.userId)}>Delete</button>
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
