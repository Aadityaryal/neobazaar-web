"use client";

import { useState } from "react";
import { requestVerificationChallenge, submitVerificationChallenge } from "@/lib/api/auth";

export default function VerifyPage() {
	const [challengeId, setChallengeId] = useState("");
	const [code, setCode] = useState("");
	const [devCode, setDevCode] = useState<string | undefined>(undefined);
	const [message, setMessage] = useState("");
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);

	const issueChallenge = async () => {
		try {
			setLoading(true);
			setError("");
			setMessage("");
			const response = await requestVerificationChallenge("email");
			if (!response.success) {
				throw new Error("Failed to issue verification challenge");
			}
			setChallengeId(response.data.challengeId);
			setDevCode(response.data.devCode);
			setMessage("Verification challenge sent.");
		} catch (err) {
			setError(err instanceof Error ? err.message : "Failed to issue verification challenge");
		} finally {
			setLoading(false);
		}
	};

	const submitCode = async () => {
		if (!challengeId.trim() || !code.trim()) {
			setError("Challenge ID and code are required");
			return;
		}

		try {
			setLoading(true);
			setError("");
			setMessage("");
			const response = await submitVerificationChallenge(challengeId.trim(), code.trim());
			if (!response.success) {
				throw new Error(response.message || "Verification failed");
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
		<div className="page-shell py-8">
			<div className="page-container">
				<div className="mx-auto max-w-xl space-y-4">
					<div className="card">
						<h1 className="page-title">Verify Account</h1>
						<p className="text-secondary">Complete email verification to secure account access.</p>
					</div>

					<div className="card space-y-3">
						<button className="btn-primary btn-sm" onClick={issueChallenge} disabled={loading}>
							Request verification challenge
						</button>
						<input className="input-field" value={challengeId} onChange={(event) => setChallengeId(event.target.value)} placeholder="Challenge ID" />
						<input className="input-field" value={code} onChange={(event) => setCode(event.target.value)} placeholder="6-digit code" />
						<button className="btn-secondary btn-sm" onClick={submitCode} disabled={loading}>
							Submit code
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
