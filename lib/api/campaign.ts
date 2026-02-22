import axios from "./axios";
import { API } from "./endpoints";

export type CampaignStatus = "draft" | "active" | "paused" | "ended";

export type CampaignRecord = {
  campaignId: string;
  ownerUserId: string;
  title: string;
  description?: string;
  startsAt: string;
  endsAt: string;
  budgetTokens: number;
  spendTokens: number;
  status: CampaignStatus;
  createdAt: string;
  updatedAt: string;
};

export const listCampaigns = async () => {
  const response = await axios.get(API.CAMPAIGNS.LIST);
  return response.data as { success: boolean; data: CampaignRecord[] };
};

export const createCampaign = async (payload: {
  title: string;
  description?: string;
  startsAt: string;
  endsAt: string;
  budgetTokens: number;
}) => {
  const response = await axios.post(API.CAMPAIGNS.CREATE, payload);
  return response.data as { success: boolean; data: CampaignRecord };
};

export const updateCampaignStatus = async (campaignId: string, status: CampaignStatus) => {
  const response = await axios.patch(API.CAMPAIGNS.UPDATE_STATUS(campaignId), { status });
  return response.data as { success: boolean; data: CampaignRecord };
};
