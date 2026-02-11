"use client";

import { useEffect, useState } from "react";
import { getMe } from "@/lib/api/auth";
import { createNotification, listMyNotifications, markNotificationRead, type NotificationRecord } from "@/lib/api/notification";

export default function SharedNotificationsCenterPage() {
  const [notifications, setNotifications] = useState<NotificationRecord[]>([]);
  const [myUserId, setMyUserId] = useState("");
  const [title, setTitle] = useState("Demo Notification");
  const [body, setBody] = useState("This is a generated demo notification.");
  const [type, setType] = useState("system_demo");
  const [creating, setCreating] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadNotifications = async () => {
    try {
      setError("");
      const response = await listMyNotifications();
      if (!response.success) {
        throw new Error("Failed to load notifications");
      }
      setNotifications(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load notifications");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadNotifications();
    void (async () => {
      try {
        const response = await getMe();
        if (response.success && response.data?.userId) {
          setMyUserId(response.data.userId);
        }
      } catch {
      }
    })();
  }, []);

  const createDemoNotification = async () => {
    if (!myUserId.trim()) {
      setError("Unable to resolve current user ID for notification creation");
      return;
    }

    try {
      setError("");
      setCreating(true);
      const response = await createNotification({
        userId: myUserId,
        type: type.trim() || "system_demo",
        title: title.trim() || "Demo Notification",
        body: body.trim() || "Generated from notifications center",
        routeKey: "dashboard",
      });
      if (!response.success) {
        throw new Error("Failed to create notification");
      }
      setNotifications((prev) => [response.data, ...prev]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create notification");
    } finally {
      setCreating(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      setError("");
      const response = await markNotificationRead(notificationId);
      if (!response.success) {
        throw new Error("Failed to mark notification as read");
      }
      setNotifications((prev) =>
        prev.map((item) => (item.notificationId === notificationId ? response.data : item))
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to mark notification as read");
    }
  };

  return (
    <div className="page-shell">
      <div className="page-container">
        <div className="mx-auto max-w-5xl space-y-4">
          <div className="card">
            <h1 className="page-title">Notifications Center</h1>
            <p className="text-secondary">View and manage in-app notification feed.</p>
          </div>

          {error && <div className="alert-error">{error}</div>}

          <div className="card space-y-3">
            <h2 className="section-title">Create Demo Notification</h2>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <input className="input-field" placeholder="Type" value={type} onChange={(event) => setType(event.target.value)} />
              <input className="input-field" placeholder="Title" value={title} onChange={(event) => setTitle(event.target.value)} />
              <input className="input-field md:col-span-2" placeholder="Body" value={body} onChange={(event) => setBody(event.target.value)} />
            </div>
            <button className="btn-primary btn-sm" onClick={createDemoNotification} disabled={creating}>
              {creating ? "Creating..." : "Create Notification"}
            </button>
          </div>

          <div className="space-y-3">
            {loading ? (
              <div className="card text-sm text-secondary">Loading notifications…</div>
            ) : notifications.length === 0 ? (
              <div className="card empty-state">No notifications yet.</div>
            ) : (
              notifications.map((item) => (
                <div key={item.notificationId} className="card flex flex-wrap items-start justify-between gap-3">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-primary">{item.title}</p>
                    <p className="text-sm text-secondary">{item.body}</p>
                    <p className="text-xs text-muted">{new Date(item.createdAt).toLocaleString()}</p>
                    <p className="text-xs text-secondary">Route: {item.route}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {!item.readAt && (
                      <button className="btn-secondary btn-sm" onClick={() => markAsRead(item.notificationId)}>
                        Mark read
                      </button>
                    )}
                    <button className="btn-primary btn-sm" onClick={() => (window.location.href = item.route)}>
                      Open
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
