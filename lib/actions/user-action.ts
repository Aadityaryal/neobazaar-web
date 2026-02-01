"use server";

import { updateProfile } from "@/lib/api/auth";
import { getAuthToken, getUserData, setUserData } from "@/lib/cookie";

export const handleUpdateProfile = async (formData: FormData) => {
  try {
    const userData = await getUserData();
    if (!userData?._id) {
      return { success: false, message: "User not found" };
    }

    const token = await getAuthToken();
    const response = await updateProfile(userData._id, formData, token || undefined);

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
