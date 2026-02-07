"use client";

import { useEffect, useState } from "react";
import { getAdminAuditLogs, runAdminAuditRetention } from "@/lib/api/admin";

type AuditRow = {
  auditId: string;
  actorUserId: string;
  action: string;
  entityType: string;
  entityId: string;
  at: string;
};

export default function AdminAuditLogsPage() {
  const [rows, setRows] = useState<AuditRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const load = async () => {
    try {
      setError("");
      const response = await getAdminAuditLogs({ page: 1, limit: 50 });
      if (!response.success) {
        throw new Error(response.message || "Failed to load audit logs");
      }
      setRows(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load audit logs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const runRetention = async () => {
    try {
      setRunning(true);
      setError("");
      setMessage("");
      const response = await runAdminAuditRetention();
      if (!response.success) {
        throw new Error(response.message || "Failed to run retention");
      }
      setMessage("Audit retention run completed.");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to run retention");
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="page-shell">
      <div className="page-container">
        <div className="mx-auto max-w-6xl space-y-4">
          <div className="card flex flex-wrap items-center justify-between gap-2">
            <div>
              <h1 className="page-title">Audit Logs</h1>
              <p className="text-secondary">Review append-only governance and system audit records.</p>
            </div>
            <button className="btn-primary btn-sm" onClick={runRetention} disabled={running}>
              {running ? "Running..." : "Run retention"}
            </button>
          </div>

          {error && <div className="alert-error">{error}</div>}
          {message && <div className="alert-success">{message}</div>}

          <div className="space-y-2">
            {loading ? (
              <div className="card text-sm text-secondary">Loading audit logs…</div>
            ) : rows.length === 0 ? (
              <div className="card empty-state">No audit logs found.</div>
            ) : (
              rows.map((row) => (
                <div key={row.auditId} className="card">
                  <p className="text-sm font-medium text-primary">{row.action}</p>
                  <p className="text-xs text-secondary">Actor: {row.actorUserId}</p>
                  <p className="text-xs text-secondary">Entity: {row.entityType} · {row.entityId}</p>
                  <p className="text-xs text-muted">At: {new Date(row.at).toLocaleString()}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
