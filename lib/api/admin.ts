import axios from "./axios";
import { API } from "./endpoints";

type ApiErrorResponse = {
  message?: string;
};

const getApiMessage = (error: unknown): string | undefined => {
  if (typeof error === "object" && error !== null && "response" in error) {
    const err = error as { response?: { data?: ApiErrorResponse } };
    return err.response?.data?.message;
  }
  return undefined;
};

const withAuth = (token?: string) => ({
  headers: {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  },
});

export const createAdminUser = async (formData: FormData, token?: string) => {
  try {
    const response = await axios.post(API.ADMIN.USERS, formData, {
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to create user";
    const apiMessage = getApiMessage(error);
    throw new Error(apiMessage || message);
  }
};

export const getAdminUsers = async (token?: string, query?: Record<string, string>) => {
  try {
    const response = await axios.get(API.ADMIN.USERS, {
      ...withAuth(token),
      params: query,
    });
    return response.data;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to load users";
    const apiMessage = getApiMessage(error);
    throw new Error(apiMessage || message);
  }
};

export const getAdminUserById = async (id: string, token?: string) => {
  try {
    const response = await axios.get(API.ADMIN.USER_BY_ID(id), withAuth(token));
    return response.data;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to load user";
    const apiMessage = getApiMessage(error);
    throw new Error(apiMessage || message);
  }
};

export const updateAdminUser = async (id: string, formData: FormData, token?: string) => {
  try {
    const response = await axios.put(API.ADMIN.USER_BY_ID(id), formData, {
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to update user";
    const apiMessage = getApiMessage(error);
    throw new Error(apiMessage || message);
  }
};

export const deleteAdminUser = async (id: string, token?: string) => {
  try {
    const response = await axios.delete(API.ADMIN.USER_BY_ID(id), withAuth(token));
    return response.data;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to delete user";
    const apiMessage = getApiMessage(error);
    throw new Error(apiMessage || message);
  }
};
