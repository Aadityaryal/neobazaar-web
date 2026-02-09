"use client";

import { useEffect, useState } from "react";
import { decideAdminDispute, getAdminDisputes } from "@/lib/api/admin";

const RESOLUTION_NOTE_MAX_LENGTH = 500;

type DisputeRow = {
  disputeId: string;
  transactionId: string;
  orderId?: string;
  openedByUserId: string;
  againstUserId: string;
  reason: string;
  evidenceUrls: string[];
  status: "open" | "under_review" | "resolved" | "rejected";
  resolutionNote?: string;
  createdAt: string;
};

export default function AdminDisputeArbitrationBoardPage() {
  const [rows, setRows] = useState<DisputeRow[]>([]);
  const [status, setStatus] = useState<"open" | "under_review" | "resolved" | "rejected">("open");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionMessage, setActionMessage] = useState("");
  const [resolutionNotes, setResolutionNotes] = useState<Record<string, string>>({});
  const [submittingById, setSubmittingById] = useState<Record<string, boolean>>({});

  const load = async (nextStatus = status) => {
    try {
      setLoading(true);
      setError("");
      const response = await getAdminDisputes({ status: nextStatus, page: 1, limit: 50 });
      if (!response.success) {
        throw new Error(response.message || "Failed to load disputes");
      }
      setRows(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load disputes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load(status);
  }, [status]);

  useEffect(() => {
    setResolutionNotes((previous) => {
      const next = { ...previous };
      for (const row of rows) {
        if (next[row.disputeId] === undefined) {
          next[row.disputeId] = row.resolutionNote || "";
        }
      }
      return next;
    });
  }, [rows]);

  const decide = async (disputeId: string, outcome: "refund_buyer" | "release_seller") => {
    try {
      setError("");
      setActionMessage("");
      setSubmittingById((previous) => ({ ...previous, [disputeId]: true }));
      const note = resolutionNotes[disputeId]?.trim();
      if (note && note.length > RESOLUTION_NOTE_MAX_LENGTH) {
        throw new Error(`Resolution note must be ${RESOLUTION_NOTE_MAX_LENGTH} characters or less`);
      }
      const response = await decideAdminDispute(disputeId, {
        outcome,
        ...(note ? { resolutionNote: note } : {}),
      });
      if (!response.success) {
        throw new Error(response.message || "Failed to decide dispute");
      }
      setActionMessage(`Decision saved for ${disputeId}`);
      await load(status);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to decide dispute");
    } finally {
      setSubmittingById((previous) => ({ ...previous, [disputeId]: false }));
    }
  };

  return (
    <div className="page-shell">
      <div className="page-container">
        <div className="mx-auto max-w-6xl space-y-4">
          <div className="card space-y-2">
            <h1 className="page-title">Dispute Arbitration Board</h1>
            <p className="text-secondary">Review and decide marketplace dispute outcomes.</p>
            <div className="flex flex-wrap gap-2">
              {(["open", "under_review", "resolved", "rejected"] as const).map((value) => (
                <button
                  key={value}
                  className={value === status ? "btn-primary btn-sm" : "btn-secondary btn-sm"}
                  onClick={() => setStatus(value)}
                >
                  {value}
                </button>
              ))}
            </div>
          </div>

          {error && <div className="alert-error">{error}</div>}
          {actionMessage && <div className="alert-success">{actionMessage}</div>}

          <div className="space-y-3">
            {loading ? (
              <div className="card text-sm text-secondary">Loading disputes…</div>
            ) : rows.length === 0 ? (
              <div className="card empty-state">No disputes found for this status.</div>
            ) : (
              rows.map((row) => (
                <div key={row.disputeId} className="card space-y-2">
                  <p className="text-sm font-medium text-primary">Dispute {row.disputeId}</p>
                  <p className="text-xs text-secondary">Transaction: {row.transactionId}</p>
                  <p className="text-xs text-secondary">Opened by: {row.openedByUserId} · Against: {row.againstUserId}</p>
                  <p className="text-xs text-secondary">Reason: {row.reason}</p>
                  <p className="text-xs text-secondary">Evidence count: {row.evidenceUrls?.length || 0}</p>
                  <div className="space-y-1">
                    <label className="text-xs text-secondary" htmlFor={`resolution-note-${row.disputeId}`}>
                      Resolution note
                    </label>
                    <p className={`text-xs ${(resolutionNotes[row.disputeId] ?? "").length >= RESOLUTION_NOTE_MAX_LENGTH ? "text-red-300" : "text-muted"}`}>
                      {(resolutionNotes[row.disputeId] ?? "").length}/{RESOLUTION_NOTE_MAX_LENGTH}
                    </p>
                    <textarea
                      id={`resolution-note-${row.disputeId}`}
                      className="input-field min-h-20"
                      placeholder="Optional note shown in dispute record"
                      value={resolutionNotes[row.disputeId] ?? ""}
                      maxLength={RESOLUTION_NOTE_MAX_LENGTH}
                      onChange={(event) => {
                        const value = event.target.value;
                        setResolutionNotes((previous) => ({ ...previous, [row.disputeId]: value }));
                      }}
                    />
                  </div>
                  <p className="text-xs text-muted">Created: {new Date(row.createdAt).toLocaleString()}</p>
                  {(row.status === "open" || row.status === "under_review") && (
                    <div className="flex flex-wrap gap-2">
                      <button
                        className="btn-secondary btn-sm"
                        disabled={Boolean(submittingById[row.disputeId])}
                        onClick={() => decide(row.disputeId, "refund_buyer")}
                      >
                        {submittingById[row.disputeId] ? "Saving..." : "Refund buyer"}
                      </button>
                      <button
                        className="btn-primary btn-sm"
                        disabled={Boolean(submittingById[row.disputeId])}
                        onClick={() => decide(row.disputeId, "release_seller")}
                      >
                        {submittingById[row.disputeId] ? "Saving..." : "Release seller"}
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
