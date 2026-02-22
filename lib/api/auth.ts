import axios from "./axios"
import { API } from "./endpoints"

export type LoginPayload = {
    email: string;
    password: string;
}

export type RegisterPayload = {
    name: string;
    email: string;
    password: string;
    location?: string;
}

export type AuthSessionRecord = {
    sessionId: string;
    deviceLabel: string;
    issuedAt: string | null;
    expiresAt: string | null;
    current: boolean;
}

export type WalletTopupRecord = {
    topUpId: string;
    userId: string;
    provider: "esewa" | "khalti" | "imepay";
    tokensCredited: number;
    createdAt: string;
}

export type AuthUserProfile = {
    userId: string;
    name: string;
    email: string;
    role?: string;
    location?: string;
    emailVerified?: boolean;
    kycStatus?: "draft" | "submitted" | "verified" | "rejected";
    kycVerified?: boolean;
}

type ApiErrorResponse = {
    message?: string;
}

const getApiMessage = (error: unknown): string | undefined => {
    if (typeof error === 'object' && error !== null && 'response' in error) {
        const err = error as { response?: { data?: ApiErrorResponse } }
        return err.response?.data?.message
    }
    return undefined
}


export const register = async (registerData: RegisterPayload) => {
    try {
        const response = await axios.post(API.AUTH.REGISTER, registerData)
        return response.data
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Registration failed'
        const apiMessage = getApiMessage(error)
        throw new Error(apiMessage || message)
    }
}

export const registerWithMeta = async (registerData: RegisterPayload) => {
    try {
        const response = await axios.post(API.AUTH.REGISTER, registerData)
        return { data: response.data, headers: response.headers }
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Registration failed'
        const apiMessage = getApiMessage(error)
        throw new Error(apiMessage || message)
    }
}

export const login = async (loginData: LoginPayload) => {
    try {
        const response = await axios.post(API.AUTH.LOGIN, loginData)
        return response.data
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Login failed'
        const apiMessage = getApiMessage(error)
        throw new Error(apiMessage || message)
    }
}

export const loginWithMeta = async (loginData: LoginPayload) => {
    try {
        const response = await axios.post(API.AUTH.LOGIN, loginData)
        return { data: response.data, headers: response.headers }
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Login failed'
        const apiMessage = getApiMessage(error)
        throw new Error(apiMessage || message)
    }
}

export const getMe = async () => {
    try {
        const response = await axios.get(API.AUTH.ME)
        return response.data
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Get profile failed'
        const apiMessage = getApiMessage(error)
        throw new Error(apiMessage || message)
    }
}

export const logout = async () => {
    try {
        const response = await axios.post(API.AUTH.LOGOUT)
        return response.data
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Logout failed'
        const apiMessage = getApiMessage(error)
        throw new Error(apiMessage || message)
    }
}

export const listSessions = async () => {
    try {
        const response = await axios.get(API.AUTH.SESSIONS)
        return response.data as { success: boolean; data: AuthSessionRecord[] }
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Failed to load sessions'
        const apiMessage = getApiMessage(error)
        throw new Error(apiMessage || message)
    }
}

export const revokeCurrentSession = async () => {
    try {
        const response = await axios.post(API.AUTH.SESSIONS_REVOKE)
        return response.data
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Failed to revoke session'
        const apiMessage = getApiMessage(error)
        throw new Error(apiMessage || message)
    }
}

export const revokeAllSessions = async () => {
    try {
        const response = await axios.post(API.AUTH.SESSIONS_REVOKE_ALL)
        return response.data
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Failed to revoke all sessions'
        const apiMessage = getApiMessage(error)
        throw new Error(apiMessage || message)
    }
}

export const requestVerificationChallenge = async (channel: "email" = "email") => {
    try {
        const response = await axios.post(API.AUTH.VERIFICATION_CHALLENGE, { channel })
        return response.data as {
            success: boolean;
            data: { challengeId: string; channel: "email"; expiresAt: string; devCode?: string };
        }
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Failed to create verification challenge'
        const apiMessage = getApiMessage(error)
        throw new Error(apiMessage || message)
    }
}

export const submitVerificationChallenge = async (challengeId: string, code: string) => {
    try {
        const response = await axios.post(API.AUTH.VERIFICATION_SUBMIT, { challengeId, code })
        return response.data
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Failed to verify challenge'
        const apiMessage = getApiMessage(error)
        throw new Error(apiMessage || message)
    }
}

export const updateProfile = async (userId: string, payload: { name?: string; location?: string; kycVerified?: boolean }) => {
    try {
        const response = await axios.patch(API.USERS.PATCH(userId), payload)
        return response.data
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Profile update failed'
        const apiMessage = getApiMessage(error)
        throw new Error(apiMessage || message)
    }
}

export const walletTopup = async (provider: "esewa" | "khalti" | "imepay", amount?: number) => {
    try {
        const response = await axios.post(API.USERS.WALLET_TOPUP, {
            provider,
            ...(typeof amount === "number" && Number.isFinite(amount) && amount > 0 ? { amount: Math.floor(amount) } : {}),
        })
        return response.data
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Wallet topup failed'
        const apiMessage = getApiMessage(error)
        throw new Error(apiMessage || message)
    }
}

export const listWalletTopups = async () => {
    try {
        const response = await axios.get(API.USERS.WALLET_TOPUPS)
        return response.data as { success: boolean; data: WalletTopupRecord[] }
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Failed to load wallet topups'
        const apiMessage = getApiMessage(error)
        throw new Error(apiMessage || message)
    }
}

export const submitKyc = async (userId: string, note?: string) => {
    try {
        const response = await axios.post(API.USERS.KYC_SUBMIT(userId), {
            ...(note?.trim() ? { note: note.trim() } : {}),
        })
        return response.data as { success: boolean; data: AuthUserProfile }
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'KYC submission failed'
        const apiMessage = getApiMessage(error)
        throw new Error(apiMessage || message)
    }
}