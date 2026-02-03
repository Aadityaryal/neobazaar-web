"use client";

import { useEffect, useState } from "react";
import { getMe, type AuthUserProfile } from "@/lib/api/auth";

export default function KycStatusPage() {
	const [user, setUser] = useState<AuthUserProfile | null>(null);
	const [error, setError] = useState("");

	useEffect(() => {
		const load = async () => {
			try {
				setError("");
				const response = await getMe();
				if (!response.success) {
					throw new Error(response.message || "Failed to load KYC status");
				}
				setUser(response.data as AuthUserProfile);
			} catch (err) {
				setError(err instanceof Error ? err.message : "Failed to load KYC status");
			}
		};

		void load();
	}, []);

	return (
		<div className="page-shell py-8">
			<div className="page-container">
				<div className="mx-auto max-w-xl space-y-4">
					<div className="card">
						<h1 className="page-title">KYC Status</h1>
						<p className="text-secondary">Track KYC state transitions.</p>
					</div>

					{error && <div className="alert-error">{error}</div>}

					<div className="card space-y-2">
						<p className="text-sm text-primary">User: {user?.name || "Unknown"}</p>
						<p className="text-sm text-secondary">Email: {user?.email || "Unknown"}</p>
						<p className="text-sm text-secondary">KYC Status: {user?.kycStatus || "unknown"}</p>
						<p className="text-sm text-secondary">Verified: {user?.kycVerified ? "Yes" : "No"}</p>
					</div>
				</div>
			</div>
		</div>
	);
}
