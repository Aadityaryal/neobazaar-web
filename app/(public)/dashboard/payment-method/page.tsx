"use client";

import Link from "next/link";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getMe, walletTopup } from "@/lib/api/auth";
import DashboardPageScaffold from "../_components/DashboardPageScaffold";
import { DashboardStatus, DashboardSurface } from "../_components/DashboardUIPrimitives";

export default function BuyerPaymentMethodPage() {
  const queryClient = useQueryClient();
  const [provider, setProvider] = useState<"esewa" | "khalti" | "imepay">("esewa");
  const [amount, setAmount] = useState(100);

  const profileQuery = useQuery({
    queryKey: ["dashboard", "payment", "profile"],
    queryFn: async () => {
      const response = await getMe();
      if (!response.success) {
        throw new Error(response.message || "Failed to load wallet balance");
      }
      return response.data;
    },
  });

  const topupMutation = useMutation({
    mutationFn: async () => {
      const response = await walletTopup(provider, amount);
      if (!response.success) {
        throw new Error(response.message || "Top-up failed");
      }
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dashboard", "payment", "profile"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard", "rewards"] });
    },
  });

  return (
    <DashboardPageScaffold
      title="Payment Method"
      subtitle="Configure preferred payment and token funding method."
      routeLabel="Dashboard / Payment"
      maxWidth="max-w-5xl"
      actions={
        <>
          <Link href="/dashboard/checkout" className="btn-secondary btn-sm">Back to checkout</Link>
          <Link href="/dashboard/orders/confirmation" className="btn-primary btn-sm">Continue</Link>
        </>
      }
    >
      <DashboardSurface className="p-4">
        {profileQuery.isLoading && (
          <div className="space-y-2">
            <div className="skeleton h-4 w-1/3" />
            <div className="skeleton h-5 w-1/2" />
          </div>
        )}

        {profileQuery.isError && (
          <DashboardStatus tone="error">
            {profileQuery.error instanceof Error ? profileQuery.error.message : "Failed to load payment profile"}
          </DashboardStatus>
        )}

        {!profileQuery.isLoading && !profileQuery.isError && (
          <div className="space-y-4">
            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
              <p className="text-xs text-white/55">Current NeoTokens</p>
              <p className="mt-1 text-xl font-bold text-emerald-300">{Number(profileQuery.data.neoTokens ?? 0)}</p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <label className="text-sm text-white/80">
                Provider
                <select
                  className="input-field mt-1"
                  value={provider}
                  onChange={(event) => setProvider(event.target.value as "esewa" | "khalti" | "imepay")}
                >
                  <option value="esewa">eSewa</option>
                  <option value="khalti">Khalti</option>
                  <option value="imepay">IME Pay</option>
                </select>
              </label>

              <label className="text-sm text-white/80">
                Top-up amount (tokens)
                <input
                  className="input-field mt-1"
                  type="number"
                  min={1}
                  value={amount}
                  onChange={(event) => setAmount(Math.max(1, Math.floor(Number(event.target.value) || 1)))}
                />
              </label>
            </div>

            <button
              type="button"
              className="btn-primary btn-sm"
              disabled={topupMutation.isPending}
              onClick={() => topupMutation.mutate()}
            >
              {topupMutation.isPending ? "Processing..." : "Top up wallet"}
            </button>

            {topupMutation.isError && (
              <DashboardStatus tone="error">
                {topupMutation.error instanceof Error ? topupMutation.error.message : "Top-up failed"}
              </DashboardStatus>
            )}
            {topupMutation.isSuccess && (
              <DashboardStatus tone="success">Wallet top-up completed successfully.</DashboardStatus>
            )}
          </div>
        )}
      </DashboardSurface>
    </DashboardPageScaffold>
  );
}
