"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getSellerPayoutLedger } from "@/lib/api/seller";

type LedgerEntry = {
  ledgerId: string;
  type: string;
  transactionId: string;
  amountTokens: number;
  settledAt: string;
};

export default function SellerPayoutsWalletPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [totalSettledTokens, setTotalSettledTokens] = useState(0);
  const [entries, setEntries] = useState<LedgerEntry[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        setError("");
        const response = await getSellerPayoutLedger();
        if (!response.success) {
          throw new Error("Failed to load payout ledger");
        }
        setTotalSettledTokens(response.data.totalSettledTokens || 0);
        setEntries(response.data.entries || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load payout ledger");
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, []);

  return (
    <div className="page-shell">
      <div className="page-container">
        <div className="mx-auto max-w-6xl space-y-4">
          <div className="card flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="page-title">Seller Wallet & Payout Ledger</h1>
              <p className="text-secondary">View completed settlements and payout-linked transactions.</p>
            </div>
            <Link href="/user/profile" className="btn-secondary btn-sm">Open profile wallet</Link>
          </div>

          {error && <div className="alert-error">{error}</div>}

          <div className="card">
            <p className="text-xs text-secondary">Total Settled</p>
            <p className="token-text text-2xl">{totalSettledTokens.toLocaleString()} NeoTokens</p>
          </div>

          <div className="space-y-3">
            {loading ? (
              <div className="card text-sm text-secondary">Loading payout ledger…</div>
            ) : entries.length === 0 ? (
              <div className="card empty-state">No payout entries yet.</div>
            ) : (
              entries.map((entry) => (
                <div key={entry.ledgerId} className="card">
                  <p className="text-sm font-medium text-primary">Ledger #{entry.ledgerId.slice(0, 8)}</p>
                  <p className="text-xs text-secondary">Type: {entry.type}</p>
                  <p className="text-xs text-secondary">Transaction: {entry.transactionId}</p>
                  <p className="text-xs text-secondary">Amount: {entry.amountTokens} tokens</p>
                  <p className="text-xs text-muted">Settled: {new Date(entry.settledAt).toLocaleString()}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
