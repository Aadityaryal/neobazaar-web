"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { listOrders, type OrderItem } from "@/lib/api/order";
import DashboardPageScaffold from "../_components/DashboardPageScaffold";
import { DashboardStatus, DashboardSurface } from "../_components/DashboardUIPrimitives";

export default function BuyerEscrowCheckoutPage() {
  const ordersQuery = useQuery<OrderItem[]>({
    queryKey: ["dashboard", "checkout-orders"],
    queryFn: async () => {
      const response = await listOrders();
      if (!response.success) {
        throw new Error(response.message || "Failed to load orders");
      }
      return response.data;
    },
  });

  const latestOrder = (ordersQuery.data ?? [])[0];

  return (
    <DashboardPageScaffold
      title="Escrow Checkout"
      subtitle="Review order details and lock buyer funds in escrow."
      routeLabel="Dashboard / Checkout"
      maxWidth="max-w-5xl"
      actions={
        <>
          <Link href="/dashboard/payment-method" className="btn-primary btn-sm">Payment method</Link>
          <Link href="/dashboard/orders/confirmation" className="btn-secondary btn-sm">Confirmation</Link>
        </>
      }
    >
      {ordersQuery.isError && <DashboardStatus tone="error">{(ordersQuery.error as Error).message}</DashboardStatus>}

      <DashboardSurface className="space-y-3 p-4">
        {ordersQuery.isLoading ? (
          <p className="text-sm text-white/70">Loading escrow summary...</p>
        ) : !latestOrder ? (
          <p className="text-sm text-white/70">No active order available for checkout. Browse products to start a transaction.</p>
        ) : (
          <>
            <p className="text-sm text-white">Order #{latestOrder.orderId.slice(0, 8)}</p>
            <p className="text-sm text-white/70">Transaction: {latestOrder.transactionId}</p>
            <p className="text-sm text-white/70">Status: {latestOrder.status}</p>
            <p className="text-xs text-white/55">Escrow release happens after both sides confirm completion.</p>
          </>
        )}
      </DashboardSurface>
    </DashboardPageScaffold>
  );
}
