import { AUTH_REASON } from "./constants";

export type AuthTransition = "login" | "logout" | typeof AUTH_REASON.SESSION_EXPIRED | "session-refresh";

export const AUTH_TRANSITION_CHANNEL = "neobazaar-auth-transition";
export const AUTH_TRANSITION_STORAGE_KEY = "neobazaar:auth-transition";

type TransitionPayload = {
  type: AuthTransition;
  at: number;
};

function getBroadcastChannel(): BroadcastChannel | null {
  if (typeof window === "undefined" || typeof window.BroadcastChannel === "undefined") {
    return null;
  }
  return new window.BroadcastChannel(AUTH_TRANSITION_CHANNEL);
}

export function publishAuthTransition(type: AuthTransition) {
  if (typeof window === "undefined") {
    return;
  }

  const payload: TransitionPayload = { type, at: Date.now() };
  const channel = getBroadcastChannel();
  channel?.postMessage(payload);
  channel?.close();

  window.localStorage.setItem(AUTH_TRANSITION_STORAGE_KEY, JSON.stringify(payload));
  window.dispatchEvent(new CustomEvent("nb:auth-transition", { detail: payload }));
}

export function subscribeAuthTransitions(handler: (payload: TransitionPayload) => void) {
  if (typeof window === "undefined") {
    return () => {};
  }

  const channel = getBroadcastChannel();
  const onMessage = (event: MessageEvent<TransitionPayload>) => {
    if (!event.data?.type) {
      return;
    }
    handler(event.data);
  };

  const onStorage = (event: StorageEvent) => {
    if (event.key !== AUTH_TRANSITION_STORAGE_KEY || !event.newValue) {
      return;
    }
    try {
      const parsed = JSON.parse(event.newValue) as TransitionPayload;
      if (parsed?.type) {
        handler(parsed);
      }
    } catch {
    }
  };

  const onCustomEvent = (event: Event) => {
    const customEvent = event as CustomEvent<TransitionPayload>;
    if (customEvent.detail?.type) {
      handler(customEvent.detail);
    }
  };

  channel?.addEventListener("message", onMessage);
  window.addEventListener("storage", onStorage);
  window.addEventListener("nb:auth-transition", onCustomEvent);

  return () => {
    channel?.removeEventListener("message", onMessage);
    channel?.close();
    window.removeEventListener("storage", onStorage);
    window.removeEventListener("nb:auth-transition", onCustomEvent);
  };
}
