import { create } from "zustand";

const STORAGE_KEY = "ajo_notifications_seen_at";

interface NotificationState {
  lastSeenAt: number; // epoch ms
  unreadCount: number;
  markAllRead: () => void;
  setUnreadCount: (n: number) => void;
  loadLastSeen: () => number;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  lastSeenAt: 0,
  unreadCount: 0,

  loadLastSeen: () => {
    if (typeof window === "undefined") return 0;
    const stored = localStorage.getItem(STORAGE_KEY);
    const ts = stored ? Number(stored) : 0;
    set({ lastSeenAt: ts });
    return ts;
  },

  markAllRead: () => {
    const now = Date.now();
    if (typeof window !== "undefined") localStorage.setItem(STORAGE_KEY, String(now));
    set({ lastSeenAt: now, unreadCount: 0 });
  },

  setUnreadCount: (n) => set({ unreadCount: n }),
}));
