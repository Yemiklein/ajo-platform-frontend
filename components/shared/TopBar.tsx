"use client";

import { useAuthStore } from "@/store/authStore";
import { Bell } from "lucide-react";

interface TopBarProps {
  title: string;
}

export default function TopBar({ title }: TopBarProps) {
  const { user } = useAuthStore();
  const initials = `${user?.firstName?.[0] ?? ""}${user?.lastName?.[0] ?? ""}`.toUpperCase();

  return (
    <header className="h-16 bg-white/80 backdrop-blur-md border-b border-gray-100 flex items-center justify-between px-4 lg:px-8 sticky top-0 z-20">
      <h1 className="text-base lg:text-lg font-semibold text-gray-900 tracking-tight truncate">
        {title}
      </h1>
      <div className="flex items-center gap-2">
        <button className="relative p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-xl transition-all">
          <Bell size={18} />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-emerald-500" />
        </button>
        <div className="flex items-center gap-2.5 pl-1">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white font-semibold text-xs flex-shrink-0 shadow-sm">
            {initials}
          </div>
          <span className="text-sm font-medium text-gray-700 hidden sm:block">
            {user?.firstName}
          </span>
        </div>
      </div>
    </header>
  );
}
