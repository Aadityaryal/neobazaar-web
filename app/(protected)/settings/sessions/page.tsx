"use client";

import { useEffect, useState } from "react";
import { listSessions, revokeAllSessions, revokeCurrentSession, type AuthSessionRecord } from "@/lib/api/auth";

export default function SharedDeviceSessionsPage() {
  const [sessions, setSessions] = useState<AuthSessionRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [runningAction, setRunningAction] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const loadSessions = async () => {
    try {
      setError("");
      const response = await listSessions();
      if (!response.success) {
        throw new Error("Failed to load sessions");
      }
      setSessions(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load sessions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadSessions();
  }, []);

  const runAction = async (action: "current" | "all") => {
    try {
      setRunningAction(true);
      setError("");
      setMessage("");
      const response = action === "current" ? await revokeCurrentSession() : await revokeAllSessions();
      if (!response?.success) {
        throw new Error(response?.message || "Session action failed");
      }
      setMessage(action === "current" ? "Current session revoked." : "All sessions revoked.");
      setSessions([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Session action failed");
    } finally {
      setRunningAction(false);
    }
  };

  return (
    <div className="page-shell">
      <div className="page-container">
        <div className="mx-auto max-w-5xl space-y-4">
          <div className="card space-y-3">
            <h1 className="page-title">Device/Session Management</h1>
            <p className="text-secondary">Inspect and revoke active sessions/devices.</p>
            <div className="flex flex-wrap gap-2">
              <button className="btn-secondary btn-sm" onClick={() => runAction("current")} disabled={runningAction}>
                Revoke current session
              </button>
              <button className="btn-primary btn-sm" onClick={() => runAction("all")} disabled={runningAction}>
                Revoke all sessions
              </button>
            </div>
          </div>

          {error && <div className="alert-error">{error}</div>}
          {message && <div className="alert-success">{message}</div>}

          <div className="space-y-3">
            {loading ? (
              <div className="card text-sm text-secondary">Loading sessions…</div>
            ) : sessions.length === 0 ? (
              <div className="card empty-state">No active sessions found.</div>
            ) : (
              sessions.map((session) => (
                <div key={session.sessionId} className="card">
                  <p className="text-sm font-medium text-primary">Session {session.sessionId}</p>
                  <p className="text-xs text-secondary">Device: {session.deviceLabel}</p>
                  <p className="text-xs text-secondary">Issued: {session.issuedAt ? new Date(session.issuedAt).toLocaleString() : "Unknown"}</p>
                  <p className="text-xs text-secondary">Expires: {session.expiresAt ? new Date(session.expiresAt).toLocaleString() : "Unknown"}</p>
                  <p className="text-xs text-muted">{session.current ? "Current session" : "Other session"}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
