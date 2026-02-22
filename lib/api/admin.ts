import { API } from "./endpoints";

export const getAdminHeatmap = async () => {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5050"}${API.ADMIN.HEATMAP}`, {
    credentials: "include",
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data?.message || "Failed to load heatmap");
  }
  return data;
};

export const getAdminExportUrl = (format: "csv" | "pdf") => `${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5050"}${API.ADMIN.EXPORT}?format=${format}`;

export const createAdminExportJob = async (format: "csv" | "pdf") => {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5050"}${API.ADMIN.EXPORT_JOBS}?format=${format}`, {
    method: "POST",
    credentials: "include",
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data?.message || "Failed to create export job");
  }
  return data;
};

export const getAdminExportJob = async (exportJobId: string) => {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5050"}${API.ADMIN.EXPORT_JOB_DETAIL(exportJobId)}`, {
    credentials: "include",
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data?.message || "Failed to load export job");
  }
  return data;
};

export const getAdminAuditLogs = async (query?: { page?: number; limit?: number; actorUserId?: string; action?: string; entityType?: string }) => {
  const params = new URLSearchParams();
  if (query?.page) params.set("page", String(query.page));
  if (query?.limit) params.set("limit", String(query.limit));
  if (query?.actorUserId) params.set("actorUserId", query.actorUserId);
  if (query?.action) params.set("action", query.action);
  if (query?.entityType) params.set("entityType", query.entityType);

  const suffix = params.toString() ? `?${params.toString()}` : "";
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5050"}${API.ADMIN.AUDIT_LOGS}${suffix}`, {
    credentials: "include",
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data?.message || "Failed to load audit logs");
  }
  return data;
};

export const runAdminAuditRetention = async () => {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5050"}${API.ADMIN.AUDIT_RETENTION_RUN}`, {
    method: "POST",
    credentials: "include",
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data?.message || "Failed to run audit retention");
  }
  return data;
};

export const getAdminFlags = async () => {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5050"}${API.ADMIN.FLAGS}`, {
    credentials: "include",
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data?.message || "Failed to load admin flags");
  }
  return data;
};

export const getAdminDisputes = async (query?: { status?: "open" | "under_review" | "resolved" | "rejected"; page?: number; limit?: number }) => {
  const params = new URLSearchParams();
  if (query?.status) params.set("status", query.status);
  if (query?.page) params.set("page", String(query.page));
  if (query?.limit) params.set("limit", String(query.limit));
  const suffix = params.toString() ? `?${params.toString()}` : "";

  const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5050"}${API.ADMIN.DISPUTES}${suffix}`, {
    credentials: "include",
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data?.message || "Failed to load disputes");
  }
  return data;
};

export const resolveAdminFlag = async (flagId: string) => {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5050"}${API.ADMIN.RESOLVE_FLAG(flagId)}`, {
    method: "PATCH",
    credentials: "include",
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data?.message || "Failed to resolve flag");
  }
  return data;
};

export const decideAdminDispute = async (disputeId: string, input: { outcome: "refund_buyer" | "release_seller"; resolutionNote?: string }) => {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5050"}${API.ADMIN.DECIDE_DISPUTE(disputeId)}`, {
    method: "PATCH",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data?.message || "Failed to decide dispute");
  }
  return data;
};

export const undoAdminModeration = async (actionId: string) => {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5050"}${API.ADMIN.MODERATION_UNDO(actionId)}`, {
    method: "POST",
    credentials: "include",
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data?.message || "Failed to undo moderation action");
  }
  return data;
};

function formDataToJson(formData: FormData) {
  const payload: Record<string, unknown> = {};
  for (const [key, value] of formData.entries()) {
    if (value instanceof File) {
      continue;
    }
    payload[key] = value;
  }
  return payload;
}

export const createAdminUser = async (formData?: FormData, _token?: string) => {
  const payload = formData ? formDataToJson(formData) : {};
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5050"}${API.ADMIN.USERS}`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await response.json();
  if (!response.ok) {
    return { success: false, message: data?.message || "Failed to create user", data: null };
  }
  return data;
};

export const getAdminUsers = async (_token?: string, query?: Record<string, string>) => {
  const params = new URLSearchParams(query || {});
  const suffix = params.toString() ? `?${params.toString()}` : "";
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5050"}${API.ADMIN.USERS}${suffix}`, {
    credentials: "include",
  });
  const data = await response.json();
  if (!response.ok) {
    return { success: false, message: data?.message || "Failed to load users", data: [] as unknown[] };
  }
  return data;
};

export const getAdminUserById = async (id?: string, _token?: string) => {
  if (!id) {
    return { success: false, message: "User ID is required", data: null };
  }
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5050"}${API.ADMIN.USER_DETAIL(id)}`, {
    credentials: "include",
  });
  const data = await response.json();
  if (!response.ok) {
    return { success: false, message: data?.message || "Failed to load user", data: null };
  }
  return data;
};

export const updateAdminUser = async (id?: string, formData?: FormData, _token?: string) => {
  if (!id) {
    return { success: false, message: "User ID is required", data: null };
  }
  const payload = formData ? formDataToJson(formData) : {};
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5050"}${API.ADMIN.USER_DETAIL(id)}`, {
    method: "PATCH",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await response.json();
  if (!response.ok) {
    return { success: false, message: data?.message || "Failed to update user", data: null };
  }
  return data;
};

export const deleteAdminUser = async (id?: string, _token?: string) => {
  if (!id) {
    return { success: false, message: "User ID is required", data: null };
  }
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5050"}${API.ADMIN.USER_DETAIL(id)}`, {
    method: "DELETE",
    credentials: "include",
  });
  const data = await response.json();
  if (!response.ok) {
    return { success: false, message: data?.message || "Failed to delete user", data: null };
  }
  return data;
};
