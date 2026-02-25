import axios from "./axios";
import { API } from "./endpoints";

export type RiskScorePayload = {
  userId: string;
  score: number;
  factors: {
    openFlags: number;
    disputes: number;
    completedTransactions: number;
  };
  band: "low" | "medium" | "high";
};

export const getRiskScoreForUser = async (userId: string) => {
  const response = await axios.get(API.RISK.SCORE_USER(userId));
  return response.data as { success: boolean; data: RiskScorePayload };
};
