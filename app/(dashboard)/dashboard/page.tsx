"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/authStore";
import { groupsAPI, payoutsAPI } from "@/lib/api";
import { Group, Payout } from "@/types";
import TopBar from "@/components/shared/TopBar";
import { Users, Wallet, TrendingUp, Clock, ArrowRight, Trophy } from "lucide-react";
import Link from "next/link";

const statusColors: Record<string, string> = {
  ACTIVE: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
  PENDING: "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
  COMPLETED: "bg-blue-50 text-blue-700 ring-1 ring-blue-200",
  CANCELLED: "bg-red-50 text-red-700 ring-1 ring-red-200",
};

const payoutStatusColors: Record<string, string> = {
  COMPLETED: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
  PENDING: "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
  PROCESSING: "bg-blue-50 text-blue-700 ring-1 ring-blue-200",
  FAILED: "bg-red-50 text-red-700 ring-1 ring-red-200",
};

export default function DashboardPage() {
  const { user } = useAuthStore();
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
        console.error("Failed to load dashboard data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const activeGroups = groups.filter((g) => g.status === "ACTIVE");
  const pendingGroups = groups.filter((g) => g.status === "PENDING");
  const completedPayouts = payouts.filter((p) => p.status === "COMPLETED");
  const totalReceived = completedPayouts.reduce((sum, p) => sum + p.amount, 0);

  const stats = [
    {
      label: "Total Groups",
      value: loading ? "—" : groups.length,
      icon: Users,
      iconBg: "bg-emerald-50",
      iconColor: "text-emerald-600",
      accent: "from-emerald-400 to-emerald-600",
    },
    {
      label: "Active Groups",
      value: loading ? "—" : activeGroups.length,
      icon: TrendingUp,
      iconBg: "bg-sky-50",
      iconColor: "text-sky-600",
      accent: "from-sky-400 to-sky-600",
    },
    {
      label: "Pending Groups",
      value: loading ? "—" : pendingGroups.length,
      icon: Clock,
      iconBg: "bg-amber-50",
      iconColor: "text-amber-600",
      accent: "from-amber-400 to-amber-500",
    },
    {
      label: "Total Received",
      value: loading ? "—" : `₦${totalReceived.toLocaleString()}`,
      icon: Wallet,
      iconBg: "bg-violet-50",
      iconColor: "text-violet-600",
      accent: "from-violet-400 to-violet-600",
    },
  ];

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <TopBar title="Dashboard" />

      <div className="flex-1 p-5 lg:p-8 space-y-8 overflow-y-auto">

        {/* Welcome Banner */}
        <div className="relative rounded-2xl bg-gradient-to-r from-emerald-600 to-emerald-500 px-6 py-5 overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(255,255,255,0.12),_transparent_60%)]" />
          <div className="relative">
            <p className="text-emerald-100 text-sm font-medium">Good day</p>
            <h2 className="text-white text-2xl font-bold mt-0.5 tracking-tight">
              {user?.firstName} {user?.lastName}
            </h2>
            <p className="text-emerald-100/80 text-sm mt-1">
              Here&apos;s an overview of your savings activity
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.label}
                className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 relative overflow-hidden group hover:shadow-md transition-all duration-200"
              >
                <div className={`absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r ${stat.accent}`} />
                <div className={`w-9 h-9 rounded-xl ${stat.iconBg} flex items-center justify-center mb-4`}>
                  <Icon size={17} className={stat.iconColor} />
                </div>
                <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1 tabular-nums">{stat.value}</p>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* My Groups */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-50">
              <h3 className="font-semibold text-gray-900">My Groups</h3>
              <Link
                href="/groups"
                className="flex items-center gap-1 text-xs font-medium text-emerald-600 hover:text-emerald-700 transition-colors"
              >
                View all <ArrowRight size={12} />
              </Link>
            </div>
            <div className="p-4">
              {loading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-14 bg-gray-50 rounded-xl animate-pulse" />
                  ))}
                </div>
              ) : groups.length === 0 ? (
                <div className="text-center py-10">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center mx-auto mb-3">
                    <Users size={20} className="text-emerald-500" />
                  </div>
                  <p className="text-gray-500 text-sm font-medium">No groups yet</p>
                  <p className="text-gray-400 text-xs mt-1">You haven&apos;t joined any groups</p>
                  <Link
                    href="/groups/create"
                    className="inline-flex items-center gap-1 text-emerald-600 text-xs font-medium mt-3 hover:text-emerald-700"
                  >
                    Create your first group <ArrowRight size={11} />
                  </Link>
                </div>
              ) : (
                <div className="space-y-1">
                  {groups.slice(0, 5).map((group) => (
                    <Link href={`/groups/${group.id}`} key={group.id}>
                      <div className="flex items-center justify-between px-3 py-3 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer group">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400/20 to-emerald-600/20 flex items-center justify-center text-emerald-700 font-bold text-sm flex-shrink-0">
                            {group.name[0].toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 text-sm leading-tight group-hover:text-emerald-700 transition-colors">
                              {group.name}
                            </p>
                            <p className="text-xs text-gray-400 leading-tight mt-0.5">
                              {group.currentMembers}/{group.maxMembers} members · ₦{group.contributionAmount.toLocaleString()}/{group.cycleType.toLowerCase()}
                            </p>
                          </div>
                        </div>
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${statusColors[group.status]}`}>
                          {group.status}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Recent Payouts */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-50">
              <h3 className="font-semibold text-gray-900">Recent Payouts</h3>
              <Link
                href="/payouts"
                className="flex items-center gap-1 text-xs font-medium text-emerald-600 hover:text-emerald-700 transition-colors"
              >
                View all <ArrowRight size={12} />
              </Link>
            </div>
            <div className="p-4">
              {loading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-14 bg-gray-50 rounded-xl animate-pulse" />
                  ))}
                </div>
              ) : payouts.length === 0 ? (
                <div className="text-center py-10">
                  <div className="w-12 h-12 rounded-2xl bg-violet-50 flex items-center justify-center mx-auto mb-3">
                    <Trophy size={20} className="text-violet-400" />
                  </div>
                  <p className="text-gray-500 text-sm font-medium">No payouts yet</p>
                  <p className="text-gray-400 text-xs mt-1">Payouts will appear here after a cycle completes</p>
                </div>
              ) : (
                <div className="space-y-1">
                  {payouts.slice(0, 5).map((payout) => (
                    <div key={payout.id} className="flex items-center justify-between px-3 py-3 rounded-xl hover:bg-gray-50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-violet-50 flex items-center justify-center flex-shrink-0">
                          <Trophy size={15} className="text-violet-500" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 text-sm leading-tight">
                            Cycle {payout.cycleNumber} Payout
                          </p>
                          <p className="text-xs text-gray-400 leading-tight mt-0.5 truncate max-w-[160px]">
                            {payout.narration || "Ajo payout disbursement"}
                          </p>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="font-bold text-emerald-600 text-sm tabular-nums">
                          ₦{payout.amount.toLocaleString()}
                        </p>
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${payoutStatusColors[payout.status]}`}>
                          {payout.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
