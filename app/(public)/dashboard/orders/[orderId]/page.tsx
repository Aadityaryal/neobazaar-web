"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getOrderTimeline } from "@/lib/api/order";
import DashboardPageScaffold from "../../_components/DashboardPageScaffold";
import { DashboardStatus, DashboardSurface } from "../../_components/DashboardUIPrimitives";

export default function BuyerOrderTimelineDetailPage() {
  const params = useParams<{ orderId: string }>();
  const [events, setEvents] = useState<Array<{ at: string; status: string; actor: string; note?: string }>>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const response = await getOrderTimeline(params.orderId);
        if (!mounted) {
          return;
        }
        if (!response.success) {
          throw new Error(response.message || "Failed to load timeline");
        }
        setEvents(response.data);
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err.message : "Failed to load timeline");
        }
      }
    };

    void load();
    const interval = setInterval(() => void load(), 4000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [params.orderId]);

  return (
    <DashboardPageScaffold
      title="Order Timeline/Detail"
      subtitle={`Order ID: ${params.orderId}`}
      routeLabel="Dashboard / Orders / Detail"
    >

          {error && <DashboardStatus tone="error">{error}</DashboardStatus>}

          <div className="space-y-2">
            {events.map((event, index) => (
              <DashboardSurface key={`${event.at}-${event.status}-${index}`} className="p-4">
                <p className="text-sm text-white">{event.status}</p>
                <p className="text-xs text-white/65">{event.note || "No note"}</p>
                <p className="text-xs text-white/45">{new Date(event.at).toLocaleString()} · {event.actor}</p>
              </DashboardSurface>
            ))}
            {events.length === 0 && <DashboardSurface className="p-4 empty-state">No timeline events yet.</DashboardSurface>}
          </div>
    </DashboardPageScaffold>
  );
}
