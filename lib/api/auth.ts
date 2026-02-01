import axios from "./axios"
import { API } from "./endpoints"

export type LoginPayload = {
    email: string;
    password: string;
}

export type RegisterPayload = {
    username: string;
    email: string;
    password: string;
    confirmPassword: string;
    firstName?: string;
    lastName?: string;
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

export const updateProfile = async (id: string, formData: FormData, token?: string) => {
    try {
        const response = await axios.put(API.AUTH.UPDATE_PROFILE(id), formData, {
            headers: {
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
                'Content-Type': 'multipart/form-data',
            },
        })
        return response.data
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Profile update failed'
        const apiMessage = getApiMessage(error)
        throw new Error(apiMessage || message)
    }
}