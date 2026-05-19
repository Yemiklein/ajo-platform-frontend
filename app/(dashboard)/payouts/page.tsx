"use client";

import { useEffect, useState } from "react";
import { payoutsAPI } from "@/lib/api";
import { Payout } from "@/types";
import TopBar from "@/components/shared/TopBar";
import { Wallet, Trophy, CheckCircle } from "lucide-react";

const statusColors: Record<string, string> = {
  COMPLETED: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:ring-emerald-500/20",
  PENDING: "bg-amber-50 text-amber-700 ring-1 ring-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:ring-amber-500/20",
  PROCESSING: "bg-blue-50 text-blue-700 ring-1 ring-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:ring-blue-500/20",
  FAILED: "bg-red-50 text-red-700 ring-1 ring-red-200 dark:bg-red-500/10 dark:text-red-400 dark:ring-red-500/20",
};

export default function PayoutsPage() {
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPayouts = async () => {
      try {
        const res = await payoutsAPI.getMyPayouts();
        setPayouts(res.data);
      } catch (err) {
        console.error("Failed to fetch payouts", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPayouts();
  }, []);

  const totalReceived = payouts
    .filter((p) => p.status === "COMPLETED")
    .reduce((sum, p) => sum + p.amount, 0);

  const completed = payouts.filter((p) => p.status === "COMPLETED").length;

  const stats = [
    {
      label: "Total Received",
      value: loading ? "—" : `₦${totalReceived.toLocaleString()}`,
      icon: Wallet,
      accent: "from-emerald-400 to-emerald-600",
      iconBg: "bg-emerald-50 dark:bg-emerald-500/10",
      iconColor: "text-emerald-600 dark:text-emerald-400",
    },
    {
      label: "Total Payouts",
      value: loading ? "—" : payouts.length,
      icon: Trophy,
      accent: "from-violet-400 to-violet-600",
      iconBg: "bg-violet-50 dark:bg-violet-500/10",
      iconColor: "text-violet-600 dark:text-violet-400",
    },
    {
      label: "Completed",
      value: loading ? "—" : completed,
      icon: CheckCircle,
      accent: "from-sky-400 to-sky-600",
      iconBg: "bg-sky-50 dark:bg-sky-500/10",
      iconColor: "text-sky-600 dark:text-sky-400",
    },
  ];

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <TopBar title="My Payouts" />

      <div className="flex-1 p-5 lg:p-8 space-y-6 overflow-y-auto">

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.label}
                className="bg-white dark:bg-zinc-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-zinc-700 relative overflow-hidden"
              >
                <div className={`absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r ${stat.accent}`} />
                <div className={`w-9 h-9 rounded-xl ${stat.iconBg} flex items-center justify-center mb-4`}>
                  <Icon size={17} className={stat.iconColor} />
                </div>
                <p className="text-[11px] font-semibold text-gray-400 dark:text-zinc-500 uppercase tracking-wider">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1 tabular-nums">{stat.value}</p>
              </div>
            );
          })}
        </div>

        {/* Payouts List */}
        <div className="bg-white dark:bg-zinc-800 rounded-2xl shadow-sm border border-gray-100 dark:border-zinc-700 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-50 dark:border-zinc-700">
            <h3 className="font-semibold text-gray-900 dark:text-white">Payout History</h3>
          </div>
          <div className="p-4">
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-16 bg-gray-50 dark:bg-zinc-700/50 rounded-xl animate-pulse" />
                ))}
              </div>
            ) : payouts.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-14 h-14 rounded-2xl bg-violet-50 dark:bg-violet-500/10 flex items-center justify-center mx-auto mb-4">
                  <Wallet className="text-violet-400" size={24} />
                </div>
                <p className="text-gray-700 dark:text-zinc-300 font-semibold">No payouts yet</p>
                <p className="text-gray-400 dark:text-zinc-500 text-sm mt-1">
                  Payouts will appear here once your cycle is complete
                </p>
              </div>
            ) : (
              <div className="space-y-1">
                {payouts.map((payout) => (
                  <div
                    key={payout.id}
                    className="flex items-center justify-between px-3 py-3.5 rounded-xl hover:bg-gray-50 dark:hover:bg-zinc-700/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                        <Trophy size={16} className="text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white text-sm">
                          Cycle {payout.cycleNumber} Payout
                        </p>
                        <p className="text-xs text-gray-400 dark:text-zinc-500 mt-0.5">
                          {payout.recipient
                            ? `To: ${payout.recipient.firstName} ${payout.recipient.lastName}`
                            : payout.narration || "Pending disbursement"}
                        </p>
                        {payout.disbursedAt && (
                          <p className="text-xs text-gray-400 dark:text-zinc-500 mt-0.5">
                            {new Date(payout.disbursedAt).toLocaleDateString("en-NG", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="font-bold text-emerald-600 dark:text-emerald-400 text-base tabular-nums">
                        ₦{payout.amount.toLocaleString()}
                      </p>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${statusColors[payout.status]}`}>
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
  );
}
