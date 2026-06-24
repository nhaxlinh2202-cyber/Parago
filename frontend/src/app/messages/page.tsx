"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { AppLayout, AppHeader } from "@/components/layout";
import { Avatar, Input, EmptyState } from "@/components/ui";
import { IconSearch, IconMessageOff, IconCircleCheckFilled } from "@tabler/icons-react";
import { cn, formatTime } from "@/lib/utils";
import { apiClient } from "@/lib/api-client";
import { useAuthStore } from "@/store/auth-store";
import { useMessageStore } from "@/store/message-store";
import { useMessagesSocket } from "@/hooks/useMessagesSocket";

const stagger = {
  visible: { transition: { staggerChildren: 0.05 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

export default function MessagesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [conversations, setConversations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const token = useAuthStore((state) => state.accessToken);

  const fetchConversations = async () => {
    try {
      const res = await apiClient.get('/conversations');
      setConversations(res.data);
      // Cập nhật luôn badge global
      const totalUnread = res.data.reduce((acc: number, c: any) => acc + (c.unreadCount || 0), 0);
      useMessageStore.getState().setUnreadCount(totalUnread);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, []);

  // Use websocket to listen for new messages to update the list
  useMessagesSocket({
    token,
    onNewMessage: (msg) => {
      setConversations((prev) => {
        const idx = prev.findIndex(c => c.id === msg.conversationId);
        if (idx >= 0) {
          const updated = [...prev];
          updated[idx] = {
            ...updated[idx],
            lastMessageText: msg.text,
            lastMessageAt: msg.createdAt,
            unreadCount: msg.senderId !== useAuthStore.getState().user?.id ? updated[idx].unreadCount + 1 : updated[idx].unreadCount
          };
          // Move to top
          const [moved] = updated.splice(idx, 1);
          return [moved, ...updated];
        } else {
          // New conversation created
          fetchConversations();
          return prev;
        }
      });
      useMessageStore.getState().fetchUnreadCount();
    },
    onMessagesRead: (data) => {
      if (data.readBy === useAuthStore.getState().user?.id) {
        setConversations((prev) => prev.map(c => c.id === data.conversationId ? { ...c, unreadCount: 0 } : c));
        useMessageStore.getState().fetchUnreadCount();
      }
    }
  });

  const filteredConversations = conversations.filter((c) =>
    c.otherUser?.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <AppLayout>
      <AppHeader title="Tin nhắn" showBack={false} />

      <div className="max-w-2xl mx-auto px-4 py-4 pb-24">
        <div className="mb-6">
          <Input
            placeholder="Tìm kiếm tin nhắn..."
            icon={<IconSearch size={18} />}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {loading ? (
          <div className="text-center py-8 text-surface-500">Đang tải tin nhắn...</div>
        ) : filteredConversations.length === 0 ? (
          <EmptyState
            icon={<IconMessageOff size={32} />}
            title="Không tìm thấy tin nhắn"
            description="Hãy bắt đầu ghép xe để trò chuyện với những người bạn đồng hành mới nhé."
          />
        ) : (
          <motion.div
            initial="hidden"
            animate="visible"
            variants={stagger}
            className="space-y-1"
          >
            {filteredConversations.map((conv) => (
              <motion.div key={conv.id} variants={itemVariants}>
                <Link
                  href={`/messages/${conv.id}?name=${encodeURIComponent(conv.otherUser?.name || '')}&avatar=${encodeURIComponent(conv.otherUser?.avatarUrl || '')}`}
                  className="flex items-center gap-4 p-3 rounded-2xl hover:bg-surface-50 dark:hover:bg-surface-100 transition-colors relative group"
                >
                  <div className="relative">
                    <Avatar
                      name={conv.otherUser?.name || 'Unknown'}
                      src={conv.otherUser?.avatarUrl}
                      size="lg"
                    />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline mb-1">
                      <h4 className="font-semibold text-base text-[var(--text-heading)] truncate pr-4">
                        {conv.otherUser?.name || 'Unknown'}
                      </h4>
                      <span className={cn(
                        "text-xs whitespace-nowrap",
                        conv.unreadCount > 0 ? "text-primary-500 font-semibold" : "text-[var(--text-muted)]"
                      )}>
                        {conv.lastMessageAt ? formatTime(conv.lastMessageAt) : ''}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <p className={cn(
                        "text-sm truncate",
                        conv.unreadCount > 0 ? "text-[var(--text-heading)] font-semibold" : "text-[var(--text-secondary)]"
                      )}>
                        {conv.lastMessageText || 'Bắt đầu cuộc trò chuyện'}
                      </p>
                      {conv.unreadCount > 0 ? (
                        <div className="w-5 h-5 rounded-full bg-primary-500 text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                          {conv.unreadCount}
                        </div>
                      ) : (
                        <IconCircleCheckFilled size={14} className="text-surface-300 shrink-0" />
                      )}
                    </div>
                  </div>
                  
                  {/* Swipe hint (visible on hover) */}
                  <div className="absolute right-4 opacity-0 group-hover:opacity-100 transition-opacity hidden md:flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-surface-200 flex items-center justify-center cursor-pointer hover:bg-surface-300 transition-colors">
                      <IconSearch size={14} className="text-surface-600" />
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </AppLayout>
  );
}
