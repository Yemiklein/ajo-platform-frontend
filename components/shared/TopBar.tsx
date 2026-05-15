"use client";

import { useAuthStore } from "@/store/authStore";
import { Bell } from "lucide-react";

interface TopBarProps {
  title: string;
}

export default function TopBar({ title }: TopBarProps) {
  const { user } = useAuthStore();

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
      <h1 className="text-xl font-semibold text-gray-800">{title}</h1>
      <div className="flex items-center gap-4">
        <button className="relative p-2 text-gray-500 hover:text-gray-700">
          <Bell size={20} />
        </button>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-semibold text-sm">
            {user?.firstName?.[0]}
            {user?.lastName?.[0]}
          </div>
          <span className="text-sm font-medium text-gray-700">
            {user?.firstName}
          </span>
        </div>
      </div>
    </header>
  );
}