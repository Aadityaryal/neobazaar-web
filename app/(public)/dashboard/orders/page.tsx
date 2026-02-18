"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { listOrders, type OrderItem } from "@/lib/api/order";
import DashboardPageScaffold from "../_components/DashboardPageScaffold";
import { DashboardSection, DashboardStatus, DashboardSurface } from "../_components/DashboardUIPrimitives";

const getOrdersOrThrow = async () => {
  const response = await listOrders();
  if (!response.success) {
    throw new Error(response.message || "Failed to load orders");
  }
  return response.data;
};

export default function BuyerActiveOrdersPage() {
  const ordersQuery = useQuery<OrderItem[]>({
    queryKey: ["dashboard", "orders"],
    queryFn: getOrdersOrThrow,
  });

  const orders = ordersQuery.data ?? [];

  return (
    <DashboardPageScaffold
      title="Active Orders"
      subtitle="Track all in-progress and completed buyer orders."
      routeLabel="Dashboard / Orders"
      actions={
        <>
          <Link href="/dashboard/disputes" className="btn-secondary btn-sm">Disputes</Link>
          <Link href="/dashboard/chat" className="btn-primary btn-sm">Message seller</Link>
        </>
      }
    >

          {ordersQuery.isLoading && (
            <DashboardSurface className="p-4">
              <div className="skeleton h-5 w-1/3 mb-3" />
              <div className="skeleton h-4 w-full mb-2" />
              <div className="skeleton h-4 w-5/6" />
            </DashboardSurface>
          )}

          {ordersQuery.isError && (
            <DashboardStatus tone="error">{ordersQuery.error instanceof Error ? ordersQuery.error.message : "Failed to load orders"}</DashboardStatus>
          )}

          {!ordersQuery.isLoading && !ordersQuery.isError && orders.length === 0 && (
            <DashboardSection title="No Orders Yet" subtitle="Create your first order from marketplace listings.">
              <p className="empty-state">No active orders yet.</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Link href="/dashboard/search" className="btn-primary btn-sm">Browse products</Link>
                <Link href="/dashboard/offers" className="btn-secondary btn-sm">Go to offers</Link>
              </div>
            </DashboardSection>
          )}

          {orders.length > 0 && (
            <div className="space-y-3">
              {orders.map((order) => (
                <Link key={order.orderId} href={`/dashboard/orders/${order.orderId}`} className="neo-surface block p-4 transition hover:scale-[1.01] hover:bg-white/[0.08]">
                  <p className="font-semibold text-white">Order #{order.orderId.slice(0, 8)}</p>
                  <p className="text-sm text-white/65">Product: {order.productId}</p>
                  <p className="text-sm text-white/65">Status: {order.status}</p>
                </Link>
              ))}
            </div>
          )}
    </DashboardPageScaffold>
  );
}
