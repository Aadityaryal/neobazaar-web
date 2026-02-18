"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { listOrders, type OrderItem } from "@/lib/api/order";
import DashboardPageScaffold from "../../_components/DashboardPageScaffold";
import { DashboardStatus, DashboardSurface } from "../../_components/DashboardUIPrimitives";

export default function BuyerOrderConfirmationPage() {
  const ordersQuery = useQuery<OrderItem[]>({
    queryKey: ["orders", "latest-confirmation"],
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
      title="Order Confirmation"
      subtitle="Finalize purchase confirmation details and next steps."
      routeLabel="Dashboard / Orders / Confirmation"
      maxWidth="max-w-5xl"
      actions={
        <>
          <Link href="/dashboard/orders" className="btn-secondary btn-sm">View orders</Link>
          {latestOrder ? (
            <Link href={`/dashboard/tracking/${latestOrder.orderId}`} className="btn-primary btn-sm">Track shipment</Link>
          ) : (
            <Link href="/dashboard/orders" className="btn-primary btn-sm">Track shipment</Link>
          )}
        </>
      }
    >
      {ordersQuery.isError && <DashboardStatus tone="error">{(ordersQuery.error as Error).message}</DashboardStatus>}

      <DashboardSurface className="space-y-3 p-4">
        {ordersQuery.isLoading ? (
          <p className="text-sm text-white/70">Loading confirmation...</p>
        ) : !latestOrder ? (
          <p className="text-sm text-white/70">No recent order found. Start from listings to create your first order.</p>
        ) : (
          <>
            <p className="text-sm text-white">Latest order: <span className="text-white/80">#{latestOrder.orderId.slice(0, 8)}</span></p>
            <p className="text-sm text-white/70">Product: {latestOrder.productId}</p>
            <p className="text-sm text-white/70">Status: {latestOrder.status}</p>
            <div className="flex flex-wrap gap-2 pt-1">
              <Link href={`/dashboard/orders/${latestOrder.orderId}`} className="btn-secondary btn-sm">Open timeline</Link>
              <Link href={`/dashboard/tracking/${latestOrder.orderId}`} className="btn-primary btn-sm">Track shipment</Link>
            </div>
          </>
        )}
      </DashboardSurface>
    </DashboardPageScaffold>
  );
}
