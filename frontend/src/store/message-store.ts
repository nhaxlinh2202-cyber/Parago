import { create } from 'zustand';
import { apiClient } from '@/lib/api-client';

interface MessageState {
  unreadCount: number;
  fetchUnreadCount: () => Promise<void>;
  incrementUnread: () => void;
  decrementUnread: () => void;
  setUnreadCount: (count: number) => void;
}

export const useMessageStore = create<MessageState>((set) => ({
  unreadCount: 0,
  fetchUnreadCount: async () => {
    try {
      // Bỏ qua nếu chưa có token, interceptor sẽ lo
      const res = await apiClient.get('/conversations');
      if (res && res.data) {
        const count = res.data.reduce((acc: number, conv: any) => acc + (conv.unreadCount || 0), 0);
        set({ unreadCount: count });
      }
    } catch (err) {
      console.error('Failed to fetch unread count:', err);
    }
  },
  incrementUnread: () => set((state) => ({ unreadCount: state.unreadCount + 1 })),
  decrementUnread: () => set((state) => ({ unreadCount: Math.max(0, state.unreadCount - 1) })),
  setUnreadCount: (count) => set({ unreadCount: count }),
}));
