"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { getMe, listWalletTopups, updateProfile, walletTopup } from "@/lib/api/auth";
import { listTransactions } from "@/lib/api/transaction";
import { io, type Socket } from "socket.io-client";
import { REALTIME_EVENTS } from "@/lib/realtime/events";
import { ORDER_STATUS_LABEL, type OrderStatus } from "@/lib/orders/status";

type ProfileUser = {
  userId: string;
  name: string;
  location: string;
  neoTokens: number;
  kycVerified: boolean;
  profileCompletenessScore?: number;
};

type WalletTransaction = {
  txnId: string;
  tokenAmount: number;
  status: OrderStatus;
  createdAt?: string;
};

type WalletTopup = {
  topUpId: string;
  provider: "esewa" | "khalti" | "imepay";
  tokensCredited: number;
  createdAt: string;
};

export default function UserProfilePage() {
  const [user, setUser] = useState<ProfileUser | null>(null);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [topups, setTopups] = useState<WalletTopup[]>([]);
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [lang, setLang] = useState("en");
  const [theme, setTheme] = useState("default");
  const [topupAmount, setTopupAmount] = useState(100);

  const load = useCallback(async () => {
    try {
      const meResponse = await getMe();
      if (!meResponse.success) {
        throw new Error(meResponse.message || "Unauthorized");
      }

      setUser(meResponse.data);
      setName(meResponse.data.name || "");
      setLocation(meResponse.data.location || "");

      const [txResponse, topupResponse] = await Promise.all([listTransactions(), listWalletTopups()]);
      if (txResponse.success) setTransactions(txResponse.data);
      if (topupResponse.success) setTopups(topupResponse.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Connection error — please retry");
    }
  }, []);

  useEffect(() => {
    load();
    const langCookie = document.cookie.match(/(?:^|; )lang=(en|ne)/)?.[1] ?? "en";
    const themeCookie = document.cookie.match(/(?:^|; )theme=(default|festival)/)?.[1] ?? "default";
    setLang(langCookie);
    setTheme(themeCookie);
  }, [load]);

  useEffect(() => {
    const socket: Socket = io(process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5050", {
      transports: ["websocket"],
      withCredentials: true,
    });

    const onFlagUpdate = async (payload: { sellerId: string; resolved: boolean }) => {
      if (!user || payload.sellerId !== user.userId) {
        return;
      }

      setNotice(payload.resolved ? "Admin action update: one account flag was resolved." : "Admin action update: one account flag was reopened.");
      await load();
    };

    const onDisputeDecision = async (payload: { buyerId: string; sellerId: string; outcome: string }) => {
      if (!user) {
        return;
      }

      if (payload.buyerId !== user.userId && payload.sellerId !== user.userId) {
        return;
      }

      setNotice(`Dispute decision posted: ${payload.outcome.replace("_", " ")}.`);
      await load();
    };

    socket.on(REALTIME_EVENTS.ADMIN_FLAG_UPDATED_V1, onFlagUpdate);
    socket.on(REALTIME_EVENTS.ADMIN_DISPUTE_DECIDED_V1, onDisputeDecision);

    return () => {
      socket.off(REALTIME_EVENTS.ADMIN_FLAG_UPDATED_V1, onFlagUpdate);
      socket.off(REALTIME_EVENTS.ADMIN_DISPUTE_DECIDED_V1, onDisputeDecision);
      socket.disconnect();
    };
  }, [load, user]);

  const setCookie = (key: string, value: string) => {
    document.cookie = `${key}=${value}; path=/; max-age=${60 * 60 * 24 * 365}`;
  };

  const topup = async (provider: "esewa" | "khalti" | "imepay") => {
    try {
      const response = await walletTopup(provider, topupAmount);
      if (!response.success) {
        throw new Error(response.message || "Top-up failed");
      }
      setUser(response.data);
      setNotice(`Wallet credited with ${topupAmount} NeoTokens via ${provider}`);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Top-up failed");
    }
  };

  const save = async () => {
    if (!user) return;
    try {
      setError("");
      const response = await updateProfile(user.userId, { name, location });
      if (!response.success) {
        throw new Error(response.message || "Failed to save profile");
      }
      setUser(response.data);
      setNotice("Profile updated");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Connection error — please retry");
    }
  };

  const setKyc = async () => {
    if (!user) return;
    try {
      setError("");
      const response = await updateProfile(user.userId, { kycVerified: true });
      if (!response.success) {
        throw new Error(response.message || "Failed to update KYC");
      }
      setUser(response.data);
      setNotice("KYC updated");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Connection error — please retry");
    }
  };

  return (
    <div className="page-shell">
      <div className="page-container">
      <div className="mx-auto w-full max-w-6xl space-y-6">
        <h1 className="page-title">Profile & Wallet</h1>

        {error && <div className="alert-error">{error}</div>}
        {notice && <div className="alert-success">{notice}</div>}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="card space-y-4">
            <div className="rounded-lg border border-dark-border p-3 text-sm text-secondary">
              <p>Profile completeness: <span className="font-semibold text-primary">{user?.profileCompletenessScore ?? 0}%</span></p>
            </div>
            <div>
              <label className="label-text">Name</label>
              <input className="input-field" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div>
              <label className="label-text">Location</label>
              <input className="input-field" value={location} onChange={(e) => setLocation(e.target.value)} />
            </div>
            <div className="flex flex-wrap gap-2">
              <button className="btn-primary btn-sm px-6" onClick={save}>Save</button>
              <button className="btn-secondary btn-sm px-6" onClick={setKyc}>Set KYC Verified</button>
              <Link href="/dashboard/leaderboard" className="btn-secondary btn-sm px-6">Leaderboard</Link>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className="label-text">Language</label>
                <select
                  className="input-field"
                  value={lang}
                  onChange={(e) => {
                    setLang(e.target.value);
                    setCookie("lang", e.target.value);
                    window.dispatchEvent(new CustomEvent("nb:lang-changed", { detail: e.target.value }));
                  }}
                >
                  <option value="en">English</option>
                  <option value="ne">Nepali</option>
                </select>
              </div>
              <div>
                <label className="label-text">Theme</label>
                <select
                  className="input-field"
                  value={theme}
                  onChange={(e) => {
                    setTheme(e.target.value);
                    setCookie("theme", e.target.value);
                    document.documentElement.setAttribute("data-theme", e.target.value);
                    window.dispatchEvent(new CustomEvent("nb:theme-changed", { detail: e.target.value }));
                  }}
                >
                  <option value="default">default</option>
                  <option value="festival">festival</option>
                </select>
              </div>
            </div>
          </div>

          <div className="card">
            <h2 className="section-title mb-3">Wallet</h2>
            <p className="mb-4 token-text text-2xl">NeoTokens: {user?.neoTokens ?? 0}</p>
            <div className="mb-3">
              <label className="label-text">Top-up Amount</label>
              <input
                className="input-field"
                type="number"
                min={1}
                value={topupAmount}
                onChange={(e) => setTopupAmount(Math.max(1, Math.floor(Number(e.target.value) || 1)))}
              />
            </div>
            <div className="mb-4 flex flex-wrap gap-2">
              <button className="btn-primary btn-sm" onClick={() => topup("esewa")}>eSewa Top-up</button>
              <button className="btn-secondary btn-sm" onClick={() => topup("khalti")}>Khalti Top-up</button>
              <button className="btn-secondary btn-sm" onClick={() => topup("imepay")}>IME Pay Top-up</button>
            </div>
            <h3 className="mb-2 text-lg text-primary">Transaction History</h3>
            <div className="max-h-[380px] space-y-2 overflow-y-auto pr-1">
              {topups.map((entry) => (
                <div key={entry.topUpId} className="rounded-lg border border-dark-border p-3 text-sm text-secondary">
                  <p className="truncate">Top-up: {entry.topUpId}</p>
                  <p>Provider: {entry.provider}</p>
                  <p>Credited: +{entry.tokensCredited}</p>
                  <p>Status: completed</p>
                  {entry.createdAt && <p>At: {new Date(entry.createdAt).toLocaleString()}</p>}
                </div>
              ))}
              {transactions.map((tx) => (
                <div key={tx.txnId} className="rounded-lg border border-dark-border p-3 text-sm text-secondary">
                  <p className="truncate">Transaction: {tx.txnId}</p>
                  <p>Amount: {tx.tokenAmount}</p>
                  <p>Status: {ORDER_STATUS_LABEL[tx.status]}</p>
                  {tx.createdAt && <p>At: {new Date(tx.createdAt).toLocaleString()}</p>}
                </div>
              ))}
              {transactions.length === 0 && topups.length === 0 && <p className="empty-state">No wallet activity yet.</p>}
            </div>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}
