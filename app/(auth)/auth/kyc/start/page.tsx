"use client";

import { useEffect, useState } from "react";
import { getMe, submitKyc, type AuthUserProfile } from "@/lib/api/auth";

export default function KycStartPage() {
	const [user, setUser] = useState<AuthUserProfile | null>(null);
	const [note, setNote] = useState("");
	const [error, setError] = useState("");
	const [message, setMessage] = useState("");
	const [submitting, setSubmitting] = useState(false);

	useEffect(() => {
		const load = async () => {
			try {
				setError("");
				const response = await getMe();
				if (!response.success) {
					throw new Error(response.message || "Failed to load account");
				}
				setUser(response.data as AuthUserProfile);
			} catch (err) {
				setError(err instanceof Error ? err.message : "Failed to load account");
			}
		};

		void load();
	}, []);

	const startKyc = async () => {
		if (!user?.userId) {
			setError("No authenticated user found");
			return;
		}

		try {
			setSubmitting(true);
			setError("");
			setMessage("");
			const response = await submitKyc(user.userId, note);
			if (!response.success) {
				throw new Error("Failed to submit KYC");
			}
			setUser(response.data);
			setMessage("KYC submitted successfully.");
		} catch (err) {
			setError(err instanceof Error ? err.message : "Failed to submit KYC");
		} finally {
			setSubmitting(false);
		}
	};

	return (
		<div className="page-shell py-8">
			<div className="page-container">
				<div className="mx-auto max-w-xl space-y-4">
					<div className="card">
						<h1 className="page-title">KYC Start</h1>
						<p className="text-secondary">Submit your account for KYC verification.</p>
					</div>

					<div className="card space-y-3">
						<p className="text-sm text-secondary">Current KYC status: {user?.kycStatus || "unknown"}</p>
						<textarea className="input-field min-h-24" value={note} onChange={(event) => setNote(event.target.value)} placeholder="Optional note for KYC review" />
						<button className="btn-primary btn-sm" onClick={startKyc} disabled={submitting || user?.kycStatus === "submitted" || user?.kycStatus === "verified"}>
							{submitting ? "Submitting..." : "Submit KYC"}
						</button>
					</div>

					{error && <div className="alert-error">{error}</div>}
					{message && <div className="alert-success">{message}</div>}
				</div>
			</div>
		</div>
	);
}
