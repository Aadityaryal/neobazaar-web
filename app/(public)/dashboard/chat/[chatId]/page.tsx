"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { listMessages, markMessageRead, replayChatEvents, sendMessage } from "@/lib/api/chat";
import { nlpSuggest } from "@/lib/api/extension";
import { REALTIME_EVENTS } from "@/lib/realtime/events";
import type {
  ChatMessageCreatedV1Payload,
  ChatMessageReceiptUpdatedV1Payload,
  ChatSuggestionCreatedV1Payload,
  GeneratedRealtimeEventName,
} from "@/lib/realtime/generated-events";
import { io, type Socket } from "socket.io-client";
import DashboardPageScaffold from "../../_components/DashboardPageScaffold";
import { DashboardStatus, DashboardSurface } from "../../_components/DashboardUIPrimitives";

type ChatMessage = {
  messageId: string;
  chatId: string;
  senderId?: string;
  isAISuggestion?: boolean;
  content: string;
  timestamp: string;
  deliveredTo?: string[];
  readBy?: string[];
};

type ReplayEvent = {
  eventId: string;
  eventName: GeneratedRealtimeEventName;
  payload: unknown;
  emittedAt: string;
};

export default function ChatPage() {
  const params = useParams<{ chatId: string }>();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [content, setContent] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [chips, setChips] = useState<string[]>([]);
  const [chipLabel, setChipLabel] = useState("");
  const [reconnecting, setReconnecting] = useState(false);
  const replayCursorRef = useRef<string | undefined>(undefined);

  const upsertMessage = useCallback((message: ChatMessage) => {
    setMessages((prev) => {
      const existingIndex = prev.findIndex((item) => item.messageId === message.messageId);
      if (existingIndex === -1) {
        return [...prev, message];
      }

      const next = [...prev];
      next[existingIndex] = {
        ...next[existingIndex],
        ...message,
      };
      return next;
    });
  }, []);

  const applyReceipt = useCallback((payload: { chatId: string; messageId: string; deliveredTo: string[]; readBy: string[] }) => {
    if (payload.chatId !== params.chatId) {
      return;
    }

    setMessages((prev) =>
      prev.map((item) =>
        item.messageId === payload.messageId
          ? { ...item, deliveredTo: payload.deliveredTo, readBy: payload.readBy }
          : item
      )
    );
  }, [params.chatId]);

  const markUnreadAsRead = useCallback(async (items: ChatMessage[]) => {
    await Promise.all(
      items
        .filter((item) => !item.isAISuggestion)
        .filter((item) => !(item.readBy ?? []).length)
        .map(async (item) => {
          try {
            await markMessageRead(params.chatId, item.messageId);
          } catch {
          }
        })
    );
  }, [params.chatId]);

  const runReplayResync = useCallback(async () => {
    try {
      const replayResponse = await replayChatEvents(replayCursorRef.current, 200);
      if (!replayResponse.success || !Array.isArray(replayResponse.data)) {
        return;
      }

      const replayEvents = replayResponse.data as ReplayEvent[];
      for (const item of replayEvents) {
        const emittedAt = new Date(item.emittedAt).toISOString();
        replayCursorRef.current = emittedAt;

        if (item.eventName === REALTIME_EVENTS.CHAT_MESSAGE_CREATED_V1 || item.eventName === REALTIME_EVENTS.CHAT_AI_SUGGESTION_CREATED_V1) {
          const payload = item.payload as ChatMessageCreatedV1Payload | ChatSuggestionCreatedV1Payload;
          if (payload.chatId === params.chatId) {
            upsertMessage(payload as ChatMessage);
          }
        }

        if (item.eventName === REALTIME_EVENTS.CHAT_MESSAGE_RECEIPT_UPDATED_V1) {
          applyReceipt(item.payload as ChatMessageReceiptUpdatedV1Payload);
        }
      }
    } catch {
    }
  }, [applyReceipt, params.chatId, upsertMessage]);

  useEffect(() => {
    const load = async () => {
      try {
        const response = await listMessages(params.chatId);
        if (response.success) {
          setMessages(response.data);
          const latestTimestamp = response.data.at(-1)?.timestamp;
          if (latestTimestamp) {
            replayCursorRef.current = new Date(latestTimestamp).toISOString();
          }
          await markUnreadAsRead(response.data);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Connection error — please retry");
      }
    };

    load();

    const socket: Socket = io(process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5050", {
      transports: ["websocket"],
      withCredentials: true,
      reconnection: false,
    });

    let reconnectAttempt = 0;
    let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
    const backoff = [1000, 2000, 4000, 8000];

    const connectWithBackoff = () => {
      const delay = backoff[reconnectAttempt] ?? 30000;
      setReconnecting(true);
      reconnectTimer = setTimeout(() => {
        socket.connect();
        reconnectAttempt += 1;
      }, delay);
    };

    socket.on("connect", () => {
      reconnectAttempt = 0;
      setReconnecting(false);
      void runReplayResync();
    });

    socket.on("disconnect", () => {
      connectWithBackoff();
    });

    const onMessage = (message: ChatMessage) => {
      if (message.chatId === params.chatId) {
        upsertMessage(message);
        replayCursorRef.current = new Date(message.timestamp).toISOString();
        if (!message.isAISuggestion) {
          void markMessageRead(params.chatId, message.messageId);
        }
      }
    };

    const onReceipt = (payload: { chatId: string; messageId: string; deliveredTo: string[]; readBy: string[] }) => {
      applyReceipt(payload);
    };

    socket.on(REALTIME_EVENTS.CHAT_MESSAGE_CREATED_V1, onMessage);
    socket.on(REALTIME_EVENTS.CHAT_AI_SUGGESTION_CREATED_V1, onMessage);
    socket.on(REALTIME_EVENTS.CHAT_MESSAGE_RECEIPT_UPDATED_V1, onReceipt);
    socket.on(REALTIME_EVENTS.CHAT_MESSAGE_LEGACY, onMessage);
    socket.on(REALTIME_EVENTS.CHAT_RECEIPT_LEGACY, onReceipt);

    return () => {
      if (reconnectTimer) clearTimeout(reconnectTimer);
      socket.disconnect();
    };
  }, [applyReceipt, markUnreadAsRead, params.chatId, runReplayResync, upsertMessage]);

  useEffect(() => {
    const timeout = setTimeout(async () => {
      if (!content.trim()) {
        setChips([]);
        setChipLabel("");
        return;
      }
      try {
        const response = await nlpSuggest([
          ...messages.slice(-5).map((item) => ({ senderId: item.senderId || "user", content: item.content })),
          { senderId: "user", content },
        ]);
        if (response.success && response.suggestionText) {
          setChips([response.suggestionText]);
          setChipLabel(typeof response.fallbackLabel === "string" ? response.fallbackLabel : "");
        }
      } catch {
      }
    }, 600);

    return () => clearTimeout(timeout);
  }, [content, messages]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setNotice("");
    try {
      const response = await sendMessage(params.chatId, content);
      if (!response.success) {
        throw new Error(response.message || "Failed to send message");
      }
      upsertMessage(response.data);
      setContent("");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Connection error — please retry";
      if (message.includes("queued for background sync")) {
        setNotice("Offline detected: message queued and will sync automatically.");
        setContent("");
        return;
      }
      setError(message);
    }
  };

  return (
    <DashboardPageScaffold
      title="Chat"
      subtitle="Live negotiation thread with delivery/read receipts and AI suggestions."
      routeLabel={`Dashboard / Chat / ${params.chatId}`}
      maxWidth="max-w-4xl"
    >
        {reconnecting && <DashboardStatus tone="warning">Reconnecting...</DashboardStatus>}
        {error && <DashboardStatus tone="error">{error}</DashboardStatus>}
        {notice && <DashboardStatus tone="success">{notice}</DashboardStatus>}

        <DashboardSurface className="max-h-[60vh] space-y-3 overflow-y-auto p-4">
          {messages.map((message) => (
            <div key={message.messageId} className={`rounded-lg border p-3 ${message.isAISuggestion ? "border-primary-500/40 bg-primary-900/10" : "border-white/10 bg-white/[0.03]"}`}>
              <p className="text-xs text-white/45">{message.senderId || "user"}{message.isAISuggestion ? " · AI" : ""}</p>
              <p className="text-sm text-white">{message.content}</p>
              <p className="mt-1 text-xs text-white/45">{new Date(message.timestamp).toLocaleString()}</p>
            </div>
          ))}
        </DashboardSurface>

        {chips.length > 0 && (
          <div className="space-y-2 px-1">
            {chipLabel && <p className="text-xs text-white/45">{chipLabel}</p>}
            <div className="flex flex-wrap gap-2">
              {chips.map((chip, index) => (
                <button key={`${chip}-${index}`} className="chip" onClick={() => setContent(chip)}>
                  {chip}
                </button>
              ))}
            </div>
          </div>
        )}

        <DashboardSurface as="form" className="flex gap-2 p-4" >
          <input className="input-field" value={content} onChange={(e) => setContent(e.target.value)} placeholder="Type a message" required />
          <button type="submit" className="btn-primary btn-sm px-5">Send</button>
        </DashboardSurface>
    </DashboardPageScaffold>
  );
}
