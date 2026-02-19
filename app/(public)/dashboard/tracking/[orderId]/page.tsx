"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { getOrderTimeline } from "@/lib/api/order";
import DashboardPageScaffold from "../../_components/DashboardPageScaffold";
import { DashboardStatus, DashboardSurface } from "../../_components/DashboardUIPrimitives";

type OrderTimelineEvent = {
  at: string;
  status: string;
  actor: string;
  note?: string;
};

export default function BuyerDeliveryTrackingPage() {
  const params = useParams<{ orderId: string }>();

  const timelineQuery = useQuery<{ events: OrderTimelineEvent[]; orderStatus?: string }>({
    queryKey: ["order-tracking", params.orderId],
    queryFn: async () => {
      const response = await getOrderTimeline(params.orderId);
      if (!response.success) {
        throw new Error(response.message || "Failed to load order tracking");
      }
      const orderStatus =
        typeof response.meta === "object" &&
        response.meta !== null &&
        "orderStatus" in response.meta &&
        typeof (response.meta as { orderStatus?: unknown }).orderStatus === "string"
          ? (response.meta as { orderStatus: string }).orderStatus
          : undefined;

      return {
        events: response.data,
        orderStatus,
      };
    },
  });

  const events = timelineQuery.data?.events ?? [];

  return (
    <DashboardPageScaffold
      title="Delivery/Meetup Tracking"
      subtitle={`Tracking order: ${params.orderId}`}
      routeLabel="Dashboard / Tracking"
      actions={
        <>
          <Link href="/dashboard/orders" className="btn-secondary btn-sm">Back to orders</Link>
          <Link href="/dashboard/chat" className="btn-primary btn-sm">Message seller</Link>
        </>
      }
    >
      {timelineQuery.isError && <DashboardStatus tone="error">{(timelineQuery.error as Error).message}</DashboardStatus>}

      <DashboardSurface className="space-y-3 p-4">
        <p className="text-sm text-white/70">Current status: <span className="text-white">{timelineQuery.data?.orderStatus || "unknown"}</span></p>

        {timelineQuery.isLoading ? (
          <p className="text-sm text-white/60">Loading tracking timeline...</p>
        ) : events.length === 0 ? (
          <p className="text-sm text-white/60">No tracking events yet.</p>
        ) : (
          <div className="space-y-2">
            {events.map((event, index) => (
              <div key={`${event.at}-${event.status}-${index}`} className="rounded-lg border border-white/10 bg-white/[0.03] p-3">
                <p className="text-sm text-white">{event.status}</p>
                <p className="text-xs text-white/60">{new Date(event.at).toLocaleString()} · {event.actor}</p>
                {event.note && <p className="mt-1 text-xs text-white/70">{event.note}</p>}
              </div>
            ))}
          </div>
        )}
      </DashboardSurface>
    </DashboardPageScaffold>
  );
}
