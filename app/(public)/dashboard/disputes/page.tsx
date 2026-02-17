"use client";

import Link from "next/link";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getMe } from "@/lib/api/auth";
import { appendDisputeEvidence, disputeTransaction, listTransactions } from "@/lib/api/transaction";
import DashboardPageScaffold from "../_components/DashboardPageScaffold";
import { DashboardStatus, DashboardSurface } from "../_components/DashboardUIPrimitives";

type TransactionItem = {
  txnId: string;
  tokenAmount: number;
  status: string;
};

export default function BuyerReturnDisputeCenterPage() {
  const [actionError, setActionError] = useState("");
  const [actionNotice, setActionNotice] = useState("");
  const [evidenceByTxn, setEvidenceByTxn] = useState<Record<string, string>>({});

  const disputesQuery = useQuery<TransactionItem[]>({
    queryKey: ["dashboard", "disputes"],
    queryFn: async () => {
      const response = await listTransactions();
      if (!response.success) {
        throw new Error(response.message || "Failed to load transactions");
      }

      return (response.data ?? []).filter((item) => item.status === "disputed");
    },
  });

  const openDisputes = disputesQuery.data ?? [];

  const addEvidence = async (txnId: string) => {
    const evidence = evidenceByTxn[txnId]?.trim();
    if (!evidence) {
      setActionError("Provide an evidence URL or reference before attaching evidence");
      return;
    }

    try {
      setActionError("");
      setActionNotice("");
      const response = await appendDisputeEvidence(txnId, [evidence]);
      if (!response.success) {
        throw new Error(response.message || "Failed to append dispute evidence");
      }
      setEvidenceByTxn((prev) => ({ ...prev, [txnId]: "" }));
      setActionNotice(`Evidence added for transaction ${txnId.slice(0, 8)}`);
      await disputesQuery.refetch();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Failed to append dispute evidence");
    }
  };

  const openDispute = async (txnId: string) => {
    try {
      setActionError("");
      setActionNotice("");
      const response = await disputeTransaction(txnId, { reason: "Buyer reported issue", evidenceUrls: [] });
      if (!response.success) {
        throw new Error(response.message || "Failed to open dispute");
      }
      setActionNotice(`Dispute opened for transaction ${txnId.slice(0, 8)}`);
      await disputesQuery.refetch();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Failed to open dispute");
    }
  };

  return (
    <DashboardPageScaffold
      title="Return/Dispute Center"
      subtitle="Open, track, and update return or dispute requests."
      routeLabel="Dashboard / Disputes"
      actions={
        <>
          <Link href="/dashboard/orders" className="btn-secondary btn-sm">Orders</Link>
          <Link href="/dashboard/chat" className="btn-primary btn-sm">Contact seller</Link>
        </>
      }
    >
      {disputesQuery.isError && <DashboardStatus tone="error">{(disputesQuery.error as Error).message}</DashboardStatus>}
      {actionError && <DashboardStatus tone="error">{actionError}</DashboardStatus>}
      {actionNotice && <DashboardStatus tone="success">{actionNotice}</DashboardStatus>}

      <DashboardSurface className="space-y-3 p-4">
        {disputesQuery.isLoading ? (
          <p className="text-sm text-white/70">Loading disputes...</p>
        ) : openDisputes.length === 0 ? (
          <p className="text-sm text-white/70">No open disputes. You can open one from an order transaction if needed.</p>
        ) : (
          openDisputes.map((txn) => (
            <div key={txn.txnId} className="rounded-lg border border-white/10 bg-white/[0.03] p-3">
              <p className="text-sm text-white">Txn #{txn.txnId.slice(0, 8)}</p>
              <p className="text-xs text-white/65">Status: {txn.status} · Amount: {txn.tokenAmount} tokens</p>
              <div className="mt-2">
                <input
                  className="input-field"
                  placeholder="Evidence URL or reference"
                  value={evidenceByTxn[txn.txnId] ?? ""}
                  onChange={(event) =>
                    setEvidenceByTxn((prev) => ({
                      ...prev,
                      [txn.txnId]: event.target.value,
                    }))
                  }
                />
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                <button className="btn-secondary btn-sm" onClick={() => addEvidence(txn.txnId)}>Add evidence</button>
              </div>
            </div>
          ))
        )}

        {openDisputes.length === 0 && (
          <div className="pt-2">
            <button
              className="btn-primary btn-sm"
              onClick={async () => {
                const txns = await listTransactions();
                const candidate = txns.data?.find((item) => item.status === "escrow" || item.status === "completed");
                if (candidate) {
                  await openDispute(candidate.txnId);
                }
              }}
            >
              Open dispute from latest eligible transaction
            </button>
          </div>
        )}
      </DashboardSurface>
    </DashboardPageScaffold>
  );
}
