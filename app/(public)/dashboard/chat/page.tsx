"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { listChats } from "@/lib/api/chat";
import DashboardPageScaffold from "../_components/DashboardPageScaffold";
import { DashboardStatus } from "../_components/DashboardUIPrimitives";
import { DashboardSurface } from "../_components/DashboardUIPrimitives";

type ChatListItem = {
  chatId: string;
  productId: string;
  buyerId: string;
  sellerId: string;
  unreadCount?: number;
  lastMessage?: {
    content?: string;
    timestamp?: string;
  };
};

export default function BuyerInboxPage() {
  const chatsQuery = useQuery<{ success: boolean; data: ChatListItem[] }>({
    queryKey: ["chat-list"],
    queryFn: async () => {
      const response = await listChats();
      if (!response.success) {
        throw new Error(response.message || "Failed to load chats");
      }
      return response;
    },
  });

  const chats = chatsQuery.data?.data ?? [];

  return (
    <DashboardPageScaffold
      title="Buyer Inbox"
      subtitle="Review ongoing conversations with sellers."
      routeLabel="Dashboard / Chat"
    >
      {chatsQuery.isError && <DashboardStatus tone="error">{(chatsQuery.error as Error).message}</DashboardStatus>}

      <DashboardSurface className="p-0 overflow-hidden">
        {chatsQuery.isLoading ? (
          <div className="p-4 text-sm text-white/70">Loading conversations...</div>
        ) : chats.length === 0 ? (
          <div className="p-4 text-sm text-white/70">No conversations yet.</div>
        ) : (
          <div className="divide-y divide-white/10">
            {chats.map((chat) => (
              <Link key={chat.chatId} href={`/dashboard/chat/${chat.chatId}`} className="block p-4 hover:bg-white/[0.03] transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-white truncate">Chat {chat.chatId.slice(0, 8)} · Product {chat.productId.slice(0, 8)}</p>
                    <p className="mt-1 text-xs text-white/60 truncate">{chat.lastMessage?.content || "No messages yet"}</p>
                  </div>
                  <div className="text-right shrink-0">
                    {typeof chat.unreadCount === "number" && chat.unreadCount > 0 && (
                      <span className="inline-flex items-center rounded-full bg-primary-500/20 px-2 py-0.5 text-xs text-primary-200">
                        {chat.unreadCount} unread
                      </span>
                    )}
                    {chat.lastMessage?.timestamp && (
                      <p className="mt-1 text-[11px] text-white/45">{new Date(chat.lastMessage.timestamp).toLocaleString()}</p>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </DashboardSurface>
    </DashboardPageScaffold>
  );
}
