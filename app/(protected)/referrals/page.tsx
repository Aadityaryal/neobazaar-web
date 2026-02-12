"use client";

import { useEffect, useState } from "react";
import { createReferralAttribution, listMyReferrals, qualifyReferral, type ReferralRecord } from "@/lib/api/referral";

export default function SharedReferralCenterPage() {
  const [code, setCode] = useState("");
  const [referredUserId, setReferredUserId] = useState("");
  const [rows, setRows] = useState<ReferralRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [qualifyingReferralId, setQualifyingReferralId] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const load = async () => {
    try {
      setError("");
      const response = await listMyReferrals();
      if (!response.success) {
        throw new Error("Failed to load referrals");
      }
      setRows(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load referrals");
    } finally {
      setLoading(false);
    }
  };

  const handleQualify = async (referralId: string) => {
    try {
      setError("");
      setMessage("");
      setQualifyingReferralId(referralId);
      const response = await qualifyReferral(referralId);
      if (!response.success) {
        throw new Error("Failed to qualify referral");
      }
      setRows((prev) => prev.map((item) => (item.referralId === referralId ? response.data : item)));
      setMessage(`Referral ${referralId.slice(0, 8)} qualified.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to qualify referral");
    } finally {
      setQualifyingReferralId("");
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!code.trim() || !referredUserId.trim()) {
      setError("Referral code and referred user ID are required");
      return;
    }
    try {
      setSubmitting(true);
      setMessage("");
      setError("");
      const response = await createReferralAttribution({ code: code.trim(), referredUserId: referredUserId.trim() });
      if (!response.success) {
        throw new Error("Failed to create referral attribution");
      }
      setRows((prev) => [response.data, ...prev]);
      setMessage("Referral attribution created.");
      setCode("");
      setReferredUserId("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create referral attribution");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page-shell">
      <div className="page-container">
        <div className="mx-auto max-w-5xl space-y-4">
          <div className="card">
            <h1 className="page-title">Referral Center</h1>
            <p className="text-secondary">Invite, track attribution, and referral reward progress.</p>
          </div>

          <form className="card grid grid-cols-1 gap-3 md:grid-cols-3" onSubmit={handleSubmit}>
            <input className="input-field" value={code} onChange={(event) => setCode(event.target.value)} placeholder="Referral code" />
            <input className="input-field" value={referredUserId} onChange={(event) => setReferredUserId(event.target.value)} placeholder="Referred user ID" />
            <button className="btn-primary btn-sm" type="submit" disabled={submitting}>
              {submitting ? "Submitting..." : "Create attribution"}
            </button>
          </form>

          {error && <div className="alert-error">{error}</div>}
          {message && <div className="alert-success">{message}</div>}

          <div className="space-y-3">
            {loading ? (
              <div className="card text-sm text-secondary">Loading referrals…</div>
            ) : rows.length === 0 ? (
              <div className="card empty-state">No referral attributions yet.</div>
            ) : (
              rows.map((row) => (
                <div key={row.referralId} className="card">
                  <p className="text-sm font-medium text-primary">Code: {row.code}</p>
                  <p className="text-xs text-secondary">Referred User: {row.referredUserId}</p>
                  <p className="text-xs text-secondary">Status: {row.status}</p>
                  <p className="text-xs text-muted">Created: {new Date(row.createdAt).toLocaleString()}</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {row.status === "pending" && (
                      <button
                        className="btn-secondary btn-sm"
                        onClick={() => handleQualify(row.referralId)}
                        disabled={qualifyingReferralId === row.referralId}
                      >
                        {qualifyingReferralId === row.referralId ? "Qualifying..." : "Mark qualified"}
                      </button>
                    )}
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
