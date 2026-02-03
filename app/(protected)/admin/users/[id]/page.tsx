"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { deleteAdminUser, getAdminUserById } from "@/lib/api/admin";

type AdminUserDetail = {
  userId: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  role?: string;
  location?: string;
  createdAt?: string;
};

export default function AdminUserDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [row, setRow] = useState<AdminUserDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        setError("");
        const response = await getAdminUserById(params.id);
        if (!response.success) {
          throw new Error(response.message || "Failed to load user");
        }
        setRow(response.data as AdminUserDetail);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load user");
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [params.id]);

  const remove = async () => {
    if (!row?.userId || !window.confirm(`Delete user ${row.userId}?`)) {
      return;
    }
    try {
      const response = await deleteAdminUser(row.userId);
      if (!response.success) {
        throw new Error(response.message || "Failed to delete user");
      }
      router.push("/admin/users");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete user");
    }
  };

  return (
    <div className="page-shell">
      <div className="page-container">
        <div className="mx-auto max-w-4xl space-y-4">
          <div className="card flex flex-wrap items-center justify-between gap-2">
            <div>
              <h1 className="page-title">User Detail</h1>
              <p className="text-secondary">Admin user detail and management actions.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link href="/admin/users" className="btn-secondary btn-sm">Back</Link>
              <Link href={`/admin/users/${params.id}/edit`} className="btn-primary btn-sm">Edit</Link>
              <button className="btn-secondary btn-sm" onClick={remove}>Delete</button>
            </div>
          </div>

          {error && <div className="alert-error">{error}</div>}

          {loading ? (
            <div className="card text-sm text-secondary">Loading user…</div>
          ) : !row ? (
            <div className="card empty-state">User not found.</div>
          ) : (
            <div className="card space-y-1">
              <p className="text-sm text-primary">Name: {row.name || [row.firstName, row.lastName].filter(Boolean).join(" ") || "-"}</p>
              <p className="text-sm text-secondary">User ID: {row.userId}</p>
              <p className="text-sm text-secondary">Email: {row.email || "-"}</p>
              <p className="text-sm text-secondary">Role: {row.role || "-"}</p>
              <p className="text-sm text-secondary">Location: {row.location || "-"}</p>
              {row.createdAt && <p className="text-xs text-muted">Created: {new Date(row.createdAt).toLocaleString()}</p>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
