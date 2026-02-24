import axios from "./axios";
import { API } from "./endpoints";

export type LeaderboardTab = "global" | "local";

export const getLeaderboard = async (tab: LeaderboardTab) => {
  const response = await axios.get(API.LEADERBOARD.LIST, { params: { tab } });
  return response.data;
};
