import axios from 'axios';
import { AUTH_REASON } from '@/lib/auth/constants';
import { clearClientSessionCookies, shouldRedirectToSessionExpired } from '@/lib/auth/client-session';
import { classifyAuthError } from '@/lib/auth/error';
import { publishAuthTransition } from '@/lib/auth/transitions';

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5050';

const axiosInstance = axios.create({
    baseURL: BASE_URL,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
});

let redirectingToSessionExpired = false;

axiosInstance.interceptors.request.use(async (config) => {
    if (typeof window !== 'undefined' && config.method?.toLowerCase() === 'post' && !navigator.onLine) {
        if ('serviceWorker' in navigator) {
            const registration = await navigator.serviceWorker.ready;
            registration.active?.postMessage({
                type: 'QUEUE_POST',
                payload: {
                    url: `${BASE_URL}${config.url}`,
                    body: config.data,
                    headers: config.headers,
                },
            });
            const syncRegistration = registration as ServiceWorkerRegistration & {
                sync?: { register: (tag: string) => Promise<void> }
            };
            if (syncRegistration.sync) {
                await syncRegistration.sync.register('neobazaar-post-sync');
            }
        }
        return Promise.reject(new Error('Offline: request queued for background sync'));
    }
    return config;
});

axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
        const status = error?.response?.status;
        const authErrorKind = classifyAuthError(error);
        if (typeof window !== 'undefined' && status === 401) {
            const pathname = window.location.pathname;
            const search = window.location.search;
            const requestUrl = String(error?.config?.url ?? '');

            await clearClientSessionCookies();

            if (!redirectingToSessionExpired && shouldRedirectToSessionExpired(pathname, search, requestUrl)) {
                redirectingToSessionExpired = true;
                window.location.replace(`/login?reason=${AUTH_REASON.SESSION_EXPIRED}`);
            }
        }

        if (typeof window !== 'undefined' && authErrorKind === 'network') {
            publishAuthTransition('session-refresh');
        }

        return Promise.reject(error);
    }
);

export default axiosInstance;