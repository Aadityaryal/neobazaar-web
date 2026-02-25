import axios from "./axios";
import { API } from "./endpoints";

export type ReferralRecord = {
  referralId: string;
  referrerUserId: string;
  referredUserId: string;
  code: string;
  status: "pending" | "qualified" | "rewarded" | "blocked";
  createdAt: string;
  updatedAt: string;
};

export const listMyReferrals = async () => {
  const response = await axios.get(API.REFERRALS.LIST);
  return response.data as { success: boolean; data: ReferralRecord[] };
};

export const createReferralAttribution = async (input: { code: string; referredUserId: string }) => {
  const response = await axios.post(API.REFERRALS.CREATE, input);
  return response.data as { success: boolean; data: ReferralRecord };
};

export const qualifyReferral = async (referralId: string) => {
  const response = await axios.post(API.REFERRALS.QUALIFY(referralId));
  return response.data as { success: boolean; data: ReferralRecord };
};
