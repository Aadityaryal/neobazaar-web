import axios from "./axios";
import { API } from "./endpoints";

export const listChats = async () => {
    const response = await axios.get(API.CHATS.LIST);
    return response.data;
};

export const createChat = async (payload: { buyerId: string; sellerId: string; productId: string }) => {
    const response = await axios.post(API.CHATS.CREATE, payload);
    return response.data;
};

export const listMessages = async (chatId: string) => {
    const response = await axios.get(API.CHATS.MESSAGES(chatId));
    return response.data;
};

export const replayChatEvents = async (since?: string, limit = 100) => {
    const response = await axios.get(API.CHATS.REPLAY, {
        params: {
            since,
            limit,
        },
    });
    return response.data;
};

export const sendMessage = async (chatId: string, content: string) => {
    const response = await axios.post(API.CHATS.MESSAGES(chatId), { content });
    return response.data;
};

export const markMessageRead = async (chatId: string, messageId: string) => {
    const response = await axios.post(API.CHATS.MESSAGE_READ(chatId, messageId));
    return response.data;
};
