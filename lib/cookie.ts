/* eslint-disable @typescript-eslint/no-explicit-any */
"use server"

import { cookies } from "next/headers"
import { COOKIE_KEYS } from "@/lib/auth/cookies";

interface UserData {
    userId: string;
    name: string;
    email: string;
    role?: "user" | "admin";
    neoTokens: number;
    xp: number;
    reputationScore: number;
    kycVerified: boolean;
    badges: string[];
    location: string;
    createdAt: string;
    [key: string]: any;
}
export const setAuthToken = async (token: string) => {
    const cookieStore = await cookies();
    cookieStore.set({
        name: COOKIE_KEYS.AUTH_TOKEN,
        value: token,
        httpOnly: true,
        sameSite: 'strict',
        secure: process.env.NODE_ENV === 'production',
        path: '/',
        maxAge: 60 * 60 * 24 * 30,
    })
}
export const getAuthToken = async () => {
    const cookieStore = await cookies();
    return cookieStore.get(COOKIE_KEYS.AUTH_TOKEN)?.value || null;
}
export const setUserData = async (userData: UserData) => {
    const cookieStore = await cookies();
    cookieStore.set({
        name: COOKIE_KEYS.USER_DATA,
        value: JSON.stringify(userData),
        httpOnly: true,
        sameSite: 'strict',
        secure: process.env.NODE_ENV === 'production',
        path: '/',
        maxAge: 60 * 60 * 24 * 30,
    })
}
export const getUserData = async (): Promise<UserData | null> => {
    const cookieStore = await cookies();
    const userData = cookieStore.get(COOKIE_KEYS.USER_DATA)?.value || null;
    if (!userData) {
        return null;
    }
    try {
        return JSON.parse(userData) as UserData;
    } catch {
        return null;
    }
}

export const clearAuthCookies = async () => {
    const cookieStore = await cookies();
    cookieStore.delete(COOKIE_KEYS.AUTH_TOKEN);
    cookieStore.delete(COOKIE_KEYS.USER_DATA);
    cookieStore.delete(COOKIE_KEYS.BACKEND_SESSION);
}