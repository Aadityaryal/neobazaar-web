"use server";
import { cookies } from "next/headers";
import { getMe, loginWithMeta, logout, registerWithMeta, type LoginPayload, type RegisterPayload } from "@/lib/api/auth"
import type { LoginFormData, RegisterFormData } from "@/app/(auth)/schema"
import { setUserData, clearAuthCookies } from "../cookie"
import { redirect } from "next/navigation";
import { AUTH_ROUTES } from "@/lib/auth/routes";
import { AUTH_COOKIE_NAME } from "@/lib/auth/constants";

const BACKEND_COOKIE_NAME = AUTH_COOKIE_NAME;

function extractCookieValue(setCookieHeader: string[] | string | undefined, cookieName: string): string | null {
    if (!setCookieHeader) {
        return null;
    }

    const entries = Array.isArray(setCookieHeader) ? setCookieHeader : [setCookieHeader];
    for (const entry of entries) {
        const pair = entry.split(";")[0];
        const separatorIndex = pair.indexOf("=");
        if (separatorIndex < 0) {
            continue;
        }
        const key = pair.slice(0, separatorIndex).trim();
        const value = pair.slice(separatorIndex + 1).trim();
        if (key === cookieName) {
            return value;
        }
    }

    return null;
}

async function persistBackendSessionCookie(headers: Record<string, unknown>) {
    const rawSetCookie = headers["set-cookie"] as string[] | string | undefined;
    const cookieValue = extractCookieValue(rawSetCookie, BACKEND_COOKIE_NAME);
    if (!cookieValue) {
        return;
    }

    const cookieStore = await cookies();
    cookieStore.set({
        name: BACKEND_COOKIE_NAME,
        value: cookieValue,
        httpOnly: true,
        sameSite: "strict",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: 60 * 60 * 24 * 30,
    });
}

export const handleRegister = async (data: RegisterFormData) => {
    try {
        const payload: RegisterPayload = {
            name: data.fullName,
            email: data.email,
            password: data.password,
            location: data.location,
        }
        const response = await registerWithMeta(payload)
        if (response.data.success) {
            await persistBackendSessionCookie(response.headers as Record<string, unknown>);
            await setUserData(response.data.data)
            return {
                success: true,
                message: 'Registration successful',
                data: response.data.data
            }
        }
        return {
            success: false,
            message: response.data.message || 'Registration failed'
        }
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Registration action failed'
        return { success: false, message }
    }
}

export const handleLogin = async (data: LoginFormData) => {
    try {
        const payload: LoginPayload = { email: data.email, password: data.password }
        const response = await loginWithMeta(payload)
        if (response.data.success) {
            await persistBackendSessionCookie(response.headers as Record<string, unknown>);
            await setUserData(response.data.data)
            return {
                success: true,
                message: 'Login successful',
                data: response.data.data
            }
        }
        return {
            success: false,
            message: response.data.message || 'Login failed'
        }
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Login action failed'
        return { success: false, message }
    }
}

export const handleLogout = async () => {
    try {
        await logout();
    } catch {
    }
    await clearAuthCookies();
    return redirect(AUTH_ROUTES.LOGIN);
}

export const handleSyncMe = async () => {
    try {
        const response = await getMe();
        if (response.success && response.data) {
            await setUserData(response.data);
            return { success: true, data: response.data };
        }
        return { success: false, message: response.message || 'Unauthorized' };
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Failed to sync profile';
        return { success: false, message };
    }
}

export const handleForgotPassword = async (_email: string) => {
    return {
        success: false,
        message: "Forgot password is not part of the locked MVP flow.",
    };
}

export const handleResetPassword = async (_token: string, _password: string, _confirmPassword: string) => {
    return {
        success: false,
        message: "Reset password is not part of the locked MVP flow.",
    };
}