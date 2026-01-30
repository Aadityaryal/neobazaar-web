export const API = {
    AUTH: {
        LOGIN: '/api/auth/login',
        REGISTER: '/api/auth/register',
        UPDATE_PROFILE: (id: string) => `/api/auth/${id}`,
    },
    ADMIN: {
        USERS: '/api/admin/users',
        USER_BY_ID: (id: string) => `/api/admin/users/${id}`,
    },
}