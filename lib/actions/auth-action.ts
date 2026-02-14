"use server";
import { login, register, type LoginPayload, type RegisterPayload } from "@/lib/api/auth"
import type { LoginFormData, RegisterFormData } from "@/app/(auth)/schema"
import { setAuthToken, setUserData, clearAuthCookies } from "../cookie"
import { redirect } from "next/navigation";
export const handleRegister = async (data: RegisterFormData) => {
    try {
        // Extract username from email (part before @)
        const username = data.emailOrPhone.split('@')[0];
        
        // Split fullName into firstName and lastName
        const [firstName, ...lastNameParts] = data.fullName.trim().split(" ");
        const lastName = lastNameParts.join(" ");
        
        const payload: RegisterPayload = {
            username,
            email: data.emailOrPhone,
            password: data.password,
            confirmPassword: data.confirmPassword,
            ...(firstName && { firstName }),
            ...(lastName && { lastName }),
        }
        const response = await register(payload)
        if (response.success) {
            return {
                success: true,
                message: 'Registration successful',
                data: response.data
            }
        }
        return {
            success: false,
            message: response.message || 'Registration failed'
        }
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Registration action failed'
        return { success: false, message }
    }
}

export const handleLogin = async (data: LoginFormData) => {
    try {
        const payload: LoginPayload = { email: data.emailOrPhone, password: data.password }
        const response = await login(payload)
        if (response.success) {
            await setAuthToken(response.token)
            await setUserData(response.data)
            return {
                success: true,
                message: 'Login successful',
                data: response.data
            }
        }
        return {
            success: false,
            message: response.message || 'Login failed'
        }
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Login action failed'
        return { success: false, message }
    }
}

export const handleLogout = async () => {
    await clearAuthCookies();
    return redirect('/login');
}

export const handleForgotPassword = async (email: string) => {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5050'}/api/auth/forgot-password`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'Failed to send reset email');
        }
        
        return {
            success: true,
            message: data.message || 'Reset email sent'
        };
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Forgot password action failed';
        return { success: false, message };
    }
}

export const handleResetPassword = async (token: string, password: string, confirmPassword: string) => {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5050'}/api/auth/reset-password`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token, password, confirmPassword })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'Failed to reset password');
        }
        
        return {
            success: true,
            message: data.message || 'Password reset successful'
        };
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Reset password action failed';
        return { success: false, message };
    }
}