"use client";

import { useAuthStore } from "@/store/authStore";
import { useNotificationStore } from "@/store/notificationStore";
import { Bell, Sun, Moon } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import Link from "next/link";
import { groupsAPI, payoutsAPI } from "@/lib/api";

interface TopBarProps {
  title: string;
}

export default function TopBar({ title }: TopBarProps) {
  const { user } = useAuthStore();
  const { theme, setTheme } = useTheme();
  const { unreadCount, setUnreadCount, loadLastSeen } = useNotificationStore();
  const [mounted, setMounted] = useState(false);
  const initials = `${user?.firstName?.[0] ?? ""}${user?.lastName?.[0] ?? ""}`.toUpperCase();

  useEffect(() => { setMounted(true); }, []);

  // Derive unread count from activity since last seen
  useEffect(() => {
    if (!user) return;
    const lastSeen = loadLastSeen();

    const compute = async () => {
      try {
        const [groupsRes, payoutsRes] = await Promise.all([
          groupsAPI.getMyGroups(),
          payoutsAPI.getMyPayouts(),
        ]);
        const groups = groupsRes.data ?? [];
        const payouts = payoutsRes.data ?? [];

        let count = 0;
        for (const g of groups) {
          if (new Date(g.createdAt).getTime() > lastSeen) count++;
        }
        for (const p of payouts) {
          const ts = new Date(p.disbursedAt || p.createdAt).getTime();
          if (ts > lastSeen) count++;
        }
        setUnreadCount(count);
      } catch {
        // non-critical — silently ignore
      }
    };
    compute();
  }, [user, loadLastSeen, setUnreadCount]);

  return (
    <header className="h-16 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border-b border-gray-100 dark:border-zinc-800 flex items-center justify-between px-4 lg:px-8 sticky top-0 z-20">
      <h1 className="text-base lg:text-lg font-semibold text-gray-900 dark:text-white tracking-tight truncate">
        {title}
      </h1>
      <div className="flex items-center gap-1.5">
        {/* Theme toggle */}
        {mounted && (
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="p-2 text-gray-400 dark:text-zinc-400 hover:text-gray-600 dark:hover:text-zinc-200 hover:bg-gray-50 dark:hover:bg-zinc-800 rounded-xl transition-all"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        )}

        {/* Notifications bell with unread count */}
        <Link
          href="/notifications"
          className="relative p-2 text-gray-400 dark:text-zinc-400 hover:text-gray-600 dark:hover:text-zinc-200 hover:bg-gray-50 dark:hover:bg-zinc-800 rounded-xl transition-all"
        >
          <Bell size={18} />
          {unreadCount > 0 ? (
            <span className="absolute -top-0.5 -right-0.5 min-w-[17px] h-[17px] rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center px-0.5 leading-none">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          ) : (
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-emerald-500" />
          )}
        </Link>

        {/* Avatar */}
        <div className="flex items-center gap-2.5 pl-1">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white font-semibold text-xs flex-shrink-0 shadow-sm">
            {initials}
          </div>
          <span className="text-sm font-medium text-gray-700 dark:text-zinc-300 hidden sm:block">
            {user?.firstName}
          </span>
        </div>
      </div>
    </header>
  );
}
