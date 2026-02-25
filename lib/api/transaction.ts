import axios from "./axios";
import { PILOT_V1 } from "./pilot-v1-adapter";
import type { ApiSuccess } from "./types";
import type { OrderStatus } from "@/lib/orders/status";

type WalletTxn = {
    txnId: string;
    tokenAmount: number;
    status: OrderStatus;
};

type TokenBalances = {
    buyerNeoTokens?: number;
    sellerNeoTokens?: number;
};

export const createTransaction = async (payload: { productId: string; tokenAmount?: number }) => {
    const response = await axios.post<ApiSuccess<{ txnId: string; status?: string }> & { balances?: TokenBalances }>(PILOT_V1.TRANSACTIONS.CREATE, payload);
    return response.data;
};

export const listTransactions = async (userId?: string) => {
    const response = await axios.get<ApiSuccess<WalletTxn[]>>(PILOT_V1.TRANSACTIONS.LIST, {
        ...(userId ? { params: { userId } } : {}),
    });
    return response.data;
};

export const placeBid = async (payload: { productId: string; amount: number }) => {
    const response = await axios.post<ApiSuccess>(PILOT_V1.BIDS.CREATE, payload);
    return response.data;
};

export const confirmTransaction = async (txnId: string, actor: "buyer" | "seller") => {
    const response = await axios.post<ApiSuccess<{ status: OrderStatus }>>(PILOT_V1.TRANSACTIONS.CONFIRM(txnId), { actor });
    return response.data;
};

export const disputeTransaction = async (txnId: string, payload: { reason: string; evidenceUrls?: string[] }) => {
    const response = await axios.post<ApiSuccess>(PILOT_V1.TRANSACTIONS.DISPUTE(txnId), payload);
    return response.data;
};

export const appendDisputeEvidence = async (txnId: string, evidenceUrls: string[]) => {
    const response = await axios.post<ApiSuccess>(PILOT_V1.TRANSACTIONS.DISPUTE_EVIDENCE(txnId), { evidenceUrls });
    return response.data;
};
