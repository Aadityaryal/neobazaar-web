"use server";

import { revalidatePath } from "next/cache";
import {
  createAdminUser,
  deleteAdminUser,
  getAdminUserById,
  getAdminUsers,
  updateAdminUser,
} from "@/lib/api/admin";
import { getAuthToken } from "@/lib/cookie";

export type AdminUser = {
  _id: string;
  firstName?: string;
  lastName?: string;
  username?: string;
  email?: string;
  role?: string;
  image?: string;
  createdAt?: string;
  updatedAt?: string;
};

export const handleAdminCreateUser = async (formData: FormData) => {
  try {
    const token = await getAuthToken();
    const response = await createAdminUser(formData, token || undefined);

    if (response.success) {
      revalidatePath("/admin/users");
      return {
        success: true,
        message: response.message || "User created",
        data: response.data,
      };
    }

    return {
      success: false,
      message: response.message || "User creation failed",
    };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "User creation failed";
    return { success: false, message };
  }
};

export const handleAdminGetUsers = async (query?: Record<string, string>) => {
  try {
    const token = await getAuthToken();
    const response = await getAdminUsers(token || undefined, query);
    if (response.success) {
      return { success: true, data: response.data as AdminUser[] };
    }
    return { success: false, message: response.message || "Failed to load users" };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to load users";
    return { success: false, message };
  }
};

export const handleAdminGetUser = async (id: string) => {
  try {
    const token = await getAuthToken();
    const response = await getAdminUserById(id, token || undefined);
    if (response.success) {
      return { success: true, data: response.data as AdminUser };
    }
    return { success: false, message: response.message || "Failed to load user" };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to load user";
    return { success: false, message };
  }
};

export const handleAdminUpdateUser = async (id: string, formData: FormData) => {
  try {
    const token = await getAuthToken();
    const response = await updateAdminUser(id, formData, token || undefined);
    if (response.success) {
      revalidatePath("/admin/users");
      revalidatePath(`/admin/users/${id}`);
      return { success: true, data: response.data };
    }
    return { success: false, message: response.message || "Failed to update user" };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to update user";
    return { success: false, message };
  }
};

export const handleAdminDeleteUser = async (id: string) => {
  try {
    const token = await getAuthToken();
    const response = await deleteAdminUser(id, token || undefined);
    if (response.success) {
      revalidatePath("/admin/users");
      return { success: true };
    }
    return { success: false, message: response.message || "Failed to delete user" };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to delete user";
    return { success: false, message };
  }
};
