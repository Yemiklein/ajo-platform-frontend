"use client";

import { useEffect, useState } from "react";
import { groupsAPI, payoutsAPI } from "@/lib/api";
import { Group, Payout } from "@/types";
import TopBar from "@/components/shared/TopBar";
import { Bell, Users, Trophy, Clock, ArrowRight, CheckCircle } from "lucide-react";
import Link from "next/link";

interface NotificationItem {
  id: string;
  type: "group_joined" | "group_active" | "payout_received" | "payout_pending" | "group_pending";
  title: string;
  body: string;
  time: string;
  href?: string;
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
}

function timeAgo(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return date.toLocaleDateString("en-NG", { day: "numeric", month: "short" });
}

export default function NotificationsPage() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [groupsRes, payoutsRes] = await Promise.all([
          groupsAPI.getMyGroups(),
          payoutsAPI.getMyPayouts(),
        ]);
        setGroups(groupsRes.data);
        setPayouts(payoutsRes.data);
      } catch (err) {
        console.error("Failed to load notifications data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const notifications: NotificationItem[] = [
    ...groups.map((g): NotificationItem => {
      if (g.status === "ACTIVE") {
        return {
          id: `group-active-${g.id}`,
          type: "group_active",
          title: `${g.name} is now active`,
          body: `Your group has ${g.currentMembers} members and contributions are underway.`,
          time: g.createdAt,
          href: `/groups/${g.id}`,
          icon: CheckCircle,
          iconBg: "bg-emerald-50 dark:bg-emerald-500/10",
          iconColor: "text-emerald-600 dark:text-emerald-400",
        };
      }
      if (g.status === "PENDING") {
        return {
          id: `group-pending-${g.id}`,
          type: "group_pending",
          title: `${g.name} is waiting for members`,
          body: `${g.maxMembers - g.currentMembers} more member${g.maxMembers - g.currentMembers !== 1 ? "s" : ""} needed to start.`,
          time: g.createdAt,
          href: `/groups/${g.id}`,
          icon: Clock,
          iconBg: "bg-amber-50 dark:bg-amber-500/10",
          iconColor: "text-amber-600 dark:text-amber-400",
        };
      }
      return {
        id: `group-joined-${g.id}`,
        type: "group_joined",
        title: `Joined ${g.name}`,
        body: `You are a member of this savings group.`,
        time: g.createdAt,
        href: `/groups/${g.id}`,
        icon: Users,
        iconBg: "bg-blue-50 dark:bg-blue-500/10",
        iconColor: "text-blue-600 dark:text-blue-400",
      };
    }),
    ...payouts.map((p): NotificationItem => ({
      id: `payout-${p.id}`,
      type: p.status === "COMPLETED" ? "payout_received" : "payout_pending",
      title: p.status === "COMPLETED"
        ? `Payout received — Cycle ${p.cycleNumber}`
        : `Payout pending — Cycle ${p.cycleNumber}`,
      body: p.status === "COMPLETED"
        ? `₦${p.amount.toLocaleString()} has been disbursed to your account.`
        : `₦${p.amount.toLocaleString()} payout is being processed.`,
      time: p.disbursedAt || p.createdAt,
      href: "/payouts",
      icon: Trophy,
      iconBg: p.status === "COMPLETED"
        ? "bg-violet-50 dark:bg-violet-500/10"
        : "bg-amber-50 dark:bg-amber-500/10",
      iconColor: p.status === "COMPLETED"
        ? "text-violet-600 dark:text-violet-400"
        : "text-amber-600 dark:text-amber-400",
    })),
  ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <TopBar title="Notifications" />

      <div className="flex-1 p-5 lg:p-8 overflow-y-auto">
        <div className="max-w-2xl">

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-white dark:bg-zinc-800 rounded-2xl h-20 animate-pulse border border-gray-100 dark:border-zinc-700" />
              ))}
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="w-16 h-16 rounded-2xl bg-gray-50 dark:bg-zinc-800 border border-gray-100 dark:border-zinc-700 flex items-center justify-center mb-5">
                <Bell size={24} className="text-gray-300 dark:text-zinc-600" />
              </div>
              <p className="text-gray-700 dark:text-zinc-300 font-semibold">You&apos;re all caught up</p>
              <p className="text-gray-400 dark:text-zinc-500 text-sm mt-1 max-w-xs">
                Notifications from your groups and payouts will appear here.
              </p>
              <Link
                href="/groups"
                className="inline-flex items-center gap-1.5 mt-6 text-emerald-600 dark:text-emerald-400 text-sm font-medium hover:text-emerald-700 transition-colors"
              >
                Browse groups <ArrowRight size={14} />
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {notifications.map((n) => {
                const Icon = n.icon;
                const content = (
                  <div className="flex items-start gap-4 px-5 py-4 bg-white dark:bg-zinc-800 rounded-2xl border border-gray-100 dark:border-zinc-700 hover:shadow-sm hover:border-gray-200 dark:hover:border-zinc-600 transition-all">
                    <div className={`w-10 h-10 rounded-xl ${n.iconBg} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                      <Icon size={18} className={n.iconColor} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white leading-tight">{n.title}</p>
                      <p className="text-xs text-gray-500 dark:text-zinc-400 mt-0.5 leading-relaxed">{n.body}</p>
                    </div>
                    <span className="text-[11px] text-gray-400 dark:text-zinc-500 flex-shrink-0 mt-0.5 tabular-nums">
                      {timeAgo(n.time)}
                    </span>
                  </div>
                );

                return n.href ? (
                  <Link key={n.id} href={n.href}>
                    {content}
                  </Link>
                ) : (
                  <div key={n.id}>{content}</div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
