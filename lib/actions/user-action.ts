"use server";

import { updateProfile } from "@/lib/api/auth";
import { getUserData, setUserData } from "@/lib/cookie";

export const handleUpdateProfile = async (payload: FormData | { name?: string; location?: string; kycVerified?: boolean }) => {
  try {
    const userData = await getUserData();
    if (!userData?.userId) {
      return { success: false, message: "User not found" };
    }

    const normalizedPayload = payload instanceof FormData
      ? {
          name: payload.get("name")?.toString(),
          location: payload.get("location")?.toString(),
        }
      : payload;

    const response = await updateProfile(userData.userId, normalizedPayload);

    if (response.success) {
      if (response.data) {
        await setUserData(response.data);
      }
      return {
        success: true,
        message: response.message || "Profile updated",
        data: response.data,
      };
    }

    return {
      success: false,
      message: response.message || "Profile update failed",
    };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Profile update failed";
    return { success: false, message };
  }
};
