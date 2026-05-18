"use client";

import { useState, useEffect } from "react";
import { TrendingUp, Users, CheckCircle } from "lucide-react";
import { groupsAPI } from "@/lib/api";

interface ContributionTrackerProps {
  groupId: number;
}

export default function ContributionTracker({ groupId }: ContributionTrackerProps) {
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    groupsAPI.getContributionSummary(groupId)
      .then((res) => setSummary(res.data))
      .catch((err) => console.error("Failed to fetch contribution summary:", err))
      .finally(() => setLoading(false));
  }, [groupId]);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white dark:bg-zinc-800 rounded-2xl h-24 animate-pulse border border-gray-100 dark:border-zinc-700" />
          ))}
        </div>
        <div className="bg-white dark:bg-zinc-800 rounded-2xl h-48 animate-pulse border border-gray-100 dark:border-zinc-700" />
      </div>
    );
  }

  if (!summary) return null;

  const statCards = [
    {
      label: "Collection Rate",
      value: `${summary.collectionRate?.toFixed(1) ?? "0"}%`,
      icon: TrendingUp,
      iconBg: "bg-emerald-50 dark:bg-emerald-500/10",
      iconColor: "text-emerald-600 dark:text-emerald-400",
      accent: "from-emerald-400 to-emerald-600",
    },
    {
      label: "Total Collected",
      value: `₦${summary.totalAmount?.toLocaleString() ?? "0"}`,
      icon: CheckCircle,
      iconBg: "bg-sky-50 dark:bg-sky-500/10",
      iconColor: "text-sky-600 dark:text-sky-400",
      accent: "from-sky-400 to-sky-600",
    },
    {
      label: "Total Received",
      value: `₦${summary.totalAmount?.toLocaleString() ?? "0"}`,
      icon: CheckCircle,
      iconBg: "bg-violet-50 dark:bg-violet-500/10",
      iconColor: "text-violet-600 dark:text-violet-400",
      accent: "from-violet-400 to-violet-600",
    },
    {
      label: "Active Members",
      value: summary.totalMembers,
      icon: Users,
      iconBg: "bg-amber-50 dark:bg-amber-500/10",
      iconColor: "text-amber-600 dark:text-amber-400",
      accent: "from-amber-400 to-amber-500",
    },
  ];

  return (
    <div className="space-y-4">
      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statCards.map((s) => {
          const Icon = s.icon;
          return (
            <div
              key={s.label}
              className="bg-white dark:bg-zinc-800 rounded-2xl p-4 border border-gray-100 dark:border-zinc-700 shadow-sm relative overflow-hidden"
            >
              <div className={`absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r ${s.accent}`} />
              <div className={`w-8 h-8 rounded-xl ${s.iconBg} flex items-center justify-center mb-3`}>
                <Icon size={15} className={s.iconColor} />
              </div>
              <p className="text-[11px] font-semibold text-gray-400 dark:text-zinc-500 uppercase tracking-wide">{s.label}</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white mt-0.5 tabular-nums">{s.value}</p>
            </div>
          );
        })}
      </div>

      {/* Member Contributions Table */}
      <div className="bg-white dark:bg-zinc-800 rounded-2xl border border-gray-100 dark:border-zinc-700 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-50 dark:border-zinc-700">
          <h3 className="font-semibold text-gray-900 dark:text-white">Member Contributions</h3>
          <p className="text-xs text-gray-400 dark:text-zinc-500 mt-0.5">Cycle #{summary.currentCycle}</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 dark:bg-zinc-700/50">
                <th className="px-6 py-3 text-left text-[11px] font-semibold text-gray-400 dark:text-zinc-500 uppercase tracking-wide">Member</th>
                <th className="px-6 py-3 text-left text-[11px] font-semibold text-gray-400 dark:text-zinc-500 uppercase tracking-wide">Total Contributed</th>
                <th className="px-6 py-3 text-left text-[11px] font-semibold text-gray-400 dark:text-zinc-500 uppercase tracking-wide">Cycles Paid</th>
                <th className="px-6 py-3 text-left text-[11px] font-semibold text-gray-400 dark:text-zinc-500 uppercase tracking-wide">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-zinc-700">
              {summary.memberContributions?.map((member: any) => (
                <tr key={member.userId} className="hover:bg-gray-50 dark:hover:bg-zinc-700/50 transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-medium text-gray-900 dark:text-white">{member.userFullName}</p>
                    <p className="text-xs text-gray-400 dark:text-zinc-500">{member.userEmail}</p>
                  </td>
                  <td className="px-6 py-4 font-semibold text-gray-900 dark:text-white tabular-nums">
                    ₦{member.totalContributed?.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-gray-600 dark:text-zinc-300">
                    {member.cyclesPaid} / {member.cyclesPaid + member.cyclesMissed}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 text-[10px] font-semibold rounded-full ${
                      member.contributionStatus === "UP_TO_DATE"
                        ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:ring-emerald-500/20"
                        : member.contributionStatus === "BEHIND"
                        ? "bg-amber-50 text-amber-700 ring-1 ring-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:ring-amber-500/20"
                        : "bg-red-50 text-red-700 ring-1 ring-red-200 dark:bg-red-500/10 dark:text-red-400 dark:ring-red-500/20"
                    }`}>
                      {member.contributionStatus?.replace("_", " ")}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
