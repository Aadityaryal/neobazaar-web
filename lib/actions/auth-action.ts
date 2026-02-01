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