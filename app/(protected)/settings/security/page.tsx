"use client";

import { useState } from "react";
import { requestVerificationChallenge, submitVerificationChallenge } from "@/lib/api/auth";

export default function SharedSecuritySettingsPage() {
  const [challengeId, setChallengeId] = useState("");
  const [code, setCode] = useState("");
  const [devCode, setDevCode] = useState<string | undefined>(undefined);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const createChallenge = async () => {
    try {
      setLoading(true);
      setError("");
      setMessage("");
      const response = await requestVerificationChallenge("email");
      if (!response.success) {
        throw new Error("Failed to create challenge");
      }
      setChallengeId(response.data.challengeId);
      setDevCode(response.data.devCode);
      setMessage("Verification challenge issued to email channel.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create challenge");
    } finally {
      setLoading(false);
    }
  };

  const verifyChallenge = async () => {
    if (!challengeId || !code.trim()) {
      setError("Challenge ID and verification code are required");
      return;
    }
    try {
      setLoading(true);
      setError("");
      setMessage("");
      const response = await submitVerificationChallenge(challengeId, code.trim());
      if (!response?.success) {
        throw new Error(response?.message || "Verification failed");
      }
      setMessage("Verification successful.");
      setCode("");
      setDevCode(undefined);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-shell">
      <div className="page-container">
        <div className="mx-auto max-w-5xl space-y-4">
          <div className="card">
            <h1 className="page-title">Security Settings</h1>
            <p className="text-secondary">Manage password, security checks, and account hardening.</p>
          </div>

          <div className="card space-y-3">
            <button className="btn-primary btn-sm" onClick={createChallenge} disabled={loading}>
              Request email verification challenge
            </button>
            <input className="input-field" value={challengeId} onChange={(event) => setChallengeId(event.target.value)} placeholder="Challenge ID" />
            <input className="input-field" value={code} onChange={(event) => setCode(event.target.value)} placeholder="Verification code" />
            <button className="btn-secondary btn-sm" onClick={verifyChallenge} disabled={loading}>
              Submit verification code
            </button>
            {typeof devCode === "string" && <p className="text-xs text-secondary">Dev code: {devCode}</p>}
          </div>

          {error && <div className="alert-error">{error}</div>}
          {message && <div className="alert-success">{message}</div>}
        </div>
      </div>
    </div>
  );
}
