import { API } from "./endpoints";
import { NotificationRouteKey, NotificationRouteParams } from "../notifications/routes";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5050";

export type NotificationRecord = {
  notificationId: string;
  userId: string;
  type: string;
  title: string;
  body: string;
  route: string;
  readAt?: string;
  createdAt: string;
  updatedAt: string;
};

export const listMyNotifications = async () => {
  const response = await fetch(`${BASE_URL}${API.NOTIFICATIONS.LIST}`, {
    credentials: "include",
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data?.message || "Failed to load notifications");
  }
  return data as { success: boolean; data: NotificationRecord[] };
};

export const createNotification = async (input: {
  userId: string;
  type: string;
  title: string;
  body: string;
  routeKey: NotificationRouteKey;
  routeParams?: NotificationRouteParams;
}) => {
  const response = await fetch(`${BASE_URL}${API.NOTIFICATIONS.CREATE}`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data?.message || "Failed to create notification");
  }
  return data as { success: boolean; data: NotificationRecord };
};

export const markNotificationRead = async (notificationId: string) => {
  const response = await fetch(`${BASE_URL}${API.NOTIFICATIONS.MARK_READ(notificationId)}`, {
    method: "POST",
    credentials: "include",
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data?.message || "Failed to mark notification as read");
  }
  return data as { success: boolean; data: NotificationRecord };
};
