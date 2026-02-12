"use client";

import { useEffect, useState } from "react";
import { confirmTransaction, listTransactions } from "@/lib/api/transaction";
import { getMe } from "@/lib/api/auth";

type Txn = {
  txnId: string;
  buyerId: string;
  sellerId: string;
  productId: string;
  tokenAmount: number;
  status: string;
  buyerConfirmed?: boolean;
  sellerConfirmed?: boolean;
  createdAt?: string;
};

export default function SellerEscrowReleaseCenterPage() {
  const [rows, setRows] = useState<Txn[]>([]);
  const [error, setError] = useState("");

  const load = async () => {
    try {
      setError("");
      const me = await getMe();
      if (!me.success || !me.data?.userId) {
        throw new Error("Unauthorized");
      }
      const response = await listTransactions();
      if (!response.success) {
        throw new Error(response.message || "Failed to load escrow queue");
      }
      const mine = (response.data as Txn[]).filter((item) => item.sellerId === me.data.userId && item.status === "escrow");
      setRows(mine);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load escrow queue");
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const release = async (txnId: string) => {
    try {
      setError("");
      const response = await confirmTransaction(txnId, "seller");
      if (!response.success) {
        throw new Error(response.message || "Failed to confirm transaction");
      }
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to confirm transaction");
    }
  };

  return (
    <div className="page-shell">
      <div className="page-container">
        <div className="mx-auto max-w-5xl space-y-4">
          <div className="card">
            <h1 className="page-title">Escrow Release Center</h1>
            <p className="text-secondary">Review confirmations and release-ready escrow transactions.</p>
          </div>

          {error && <div className="alert-error">{error}</div>}

          <div className="space-y-3">
            {rows.length === 0 ? (
              <div className="card empty-state">No escrow transactions pending seller confirmation.</div>
            ) : (
              rows.map((row) => (
                <div key={row.txnId} className="card flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="text-sm text-primary">Txn {row.txnId}</p>
                    <p className="text-xs text-secondary">Product: {row.productId}</p>
                    <p className="text-xs text-secondary">Amount: {row.tokenAmount} tokens</p>
                    <p className="text-xs text-secondary">Buyer confirmed: {row.buyerConfirmed ? "Yes" : "No"}</p>
                  </div>
                  <button className="btn-primary btn-sm" onClick={() => release(row.txnId)}>
                    Confirm release
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
