"use client";

import { useEffect, useState } from "react";
import { appendOrderTimeline, listOrders, type OrderItem } from "@/lib/api/order";

export default function SellerProcessingQueuePage() {
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [error, setError] = useState("");

  const load = async () => {
    try {
      setError("");
      const response = await listOrders();
      if (!response.success) {
        throw new Error(response.message || "Failed to load processing queue");
      }
      setOrders(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load processing queue");
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const markFulfilled = async (orderId: string) => {
    try {
      setError("");
      const response = await appendOrderTimeline(orderId, {
        status: "fulfilled",
        note: "Seller marked order as fulfilled",
      });
      if (!response.success) {
        throw new Error(response.message || "Failed to update order");
      }
      setOrders((prev) => prev.map((item) => (item.orderId === orderId ? response.data : item)));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update order");
    }
  };

  return (
    <div className="page-shell">
      <div className="page-container">
        <div className="mx-auto max-w-5xl space-y-4">
          <div className="card">
            <h1 className="page-title">Processing Queue</h1>
            <p className="text-secondary">Track accepted orders moving through fulfillment steps.</p>
          </div>

          {error && <div className="alert-error">{error}</div>}

          <div className="space-y-3">
            {orders.map((order) => (
              <div key={order.orderId} className="card flex items-center justify-between gap-3">
                <div>
                  <p className="text-primary font-medium">Order #{order.orderId.slice(0, 8)}</p>
                  <p className="text-sm text-secondary">Status: {order.status}</p>
                  <p className="text-xs text-muted">Timeline events: {order.timeline.length}</p>
                </div>
                <button className="btn-primary btn-sm" onClick={() => markFulfilled(order.orderId)}>
                  Mark Fulfilled
                </button>
              </div>
            ))}
            {orders.length === 0 && <div className="card empty-state">No orders in queue.</div>}
          </div>
        </div>
      </div>
    </div>
  );
}
