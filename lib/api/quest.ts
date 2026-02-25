import axios from "./axios";
import { API } from "./endpoints";

export type Quest = {
  questId: string;
  title: string;
  description: string;
  rewardTokens: number;
  rewardXP: number;
  activeUntil: string;
};

export const listQuests = async () => {
  const response = await axios.get(API.QUESTS.LIST);
  return response.data;
};

export const completeQuest = async (questId: string) => {
  const response = await axios.post(API.QUESTS.COMPLETE(questId));
  return response.data;
};
