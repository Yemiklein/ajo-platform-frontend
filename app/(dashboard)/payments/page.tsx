"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/authStore";
import { groupsAPI, contributionsAPI } from "@/lib/api";
import { Group, Contribution } from "@/types";
import TopBar from "@/components/shared/TopBar";
import {
  CreditCard, CheckCircle, XCircle, Clock, ArrowRight,
  Download, Search, Filter,
} from "lucide-react";
import Link from "next/link";

interface EnrichedContribution extends Contribution {
  groupName: string;
  groupId: number;
}

const statusConfig: Record<string, { label: string; classes: string; icon: React.ElementType }> = {
  PAID: {
    label: "Paid",
    classes: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:ring-emerald-500/20",
    icon: CheckCircle,
  },
  PENDING: {
    label: "Pending",
    classes: "bg-amber-50 text-amber-700 ring-1 ring-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:ring-amber-500/20",
    icon: Clock,
  },
  FAILED: {
    label: "Failed",
    classes: "bg-red-50 text-red-700 ring-1 ring-red-200 dark:bg-red-500/10 dark:text-red-400 dark:ring-red-500/20",
    icon: XCircle,
  },
};

function formatDate(dateStr: string) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-NG", {
    day: "numeric", month: "short", year: "numeric",
  });
}

function downloadReceipt(tx: EnrichedContribution) {
  const lines = [
    "AJO PLATFORM — PAYMENT RECEIPT",
    "================================",
    `Date:       ${formatDate(tx.paidAt || tx.createdAt)}`,
    `Reference:  ${tx.paymentReference || "N/A"}`,
    `Group:      ${tx.groupName}`,
    `Cycle:      ${tx.cycleNumber}`,
    `Amount:     ₦${tx.amount.toLocaleString()}`,
    `Status:     ${tx.status}`,
    "================================",
    "Thank you for keeping your circle strong.",
  ];
  const blob = new Blob([lines.join("\n")], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `receipt-${tx.paymentReference || tx.id}.txt`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function PaymentsPage() {
  const { user } = useAuthStore();
  const [transactions, setTransactions] = useState<EnrichedContribution[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"ALL" | "PAID" | "PENDING" | "FAILED">("ALL");

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const groupsRes = await groupsAPI.getMyGroups();
        const groups: Group[] = groupsRes.data;

        const contribArrays = await Promise.all(
          groups.map((g) =>
            contributionsAPI.getByGroup(g.id).then((res) =>
              (res.data as Contribution[])
                .filter((c) => c.userId === user?.id)
                .map((c) => ({ ...c, groupName: g.name, groupId: g.id }))
            ).catch(() => [] as EnrichedContribution[])
          )
        );

        const all = contribArrays
          .flat()
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

        setTransactions(all);
      } catch (err) {
        console.error("Failed to load payment history", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [user?.id]);

  const filtered = transactions.filter((t) => {
    const matchesFilter = filter === "ALL" || t.status === filter;
    const matchesSearch =
      t.groupName.toLowerCase().includes(search.toLowerCase()) ||
      (t.paymentReference || "").toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const totalPaid = transactions
    .filter((t) => t.status === "PAID")
    .reduce((sum, t) => sum + t.amount, 0);
  const paidCount = transactions.filter((t) => t.status === "PAID").length;
  const pendingCount = transactions.filter((t) => t.status === "PENDING").length;

  const stats = [
    {
      label: "Total Paid Out",
      value: loading ? "—" : `₦${totalPaid.toLocaleString()}`,
      accent: "from-emerald-400 to-emerald-600",
      iconBg: "bg-emerald-50 dark:bg-emerald-500/10",
      iconColor: "text-emerald-600 dark:text-emerald-400",
      icon: CheckCircle,
    },
    {
      label: "Payments Made",
      value: loading ? "—" : paidCount,
      accent: "from-sky-400 to-sky-600",
      iconBg: "bg-sky-50 dark:bg-sky-500/10",
      iconColor: "text-sky-600 dark:text-sky-400",
      icon: CreditCard,
    },
    {
      label: "Pending",
      value: loading ? "—" : pendingCount,
      accent: "from-amber-400 to-amber-500",
      iconBg: "bg-amber-50 dark:bg-amber-500/10",
      iconColor: "text-amber-600 dark:text-amber-400",
      icon: Clock,
    },
  ];

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <TopBar title="Payments" />

      <div className="flex-1 p-5 lg:p-8 space-y-6 overflow-y-auto">

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {stats.map((s) => {
            const Icon = s.icon;
            return (
              <div key={s.label} className="bg-white dark:bg-zinc-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-zinc-700 relative overflow-hidden">
                <div className={`absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r ${s.accent}`} />
                <div className={`w-9 h-9 rounded-xl ${s.iconBg} flex items-center justify-center mb-4`}>
                  <Icon size={17} className={s.iconColor} />
                </div>
                <p className="text-[11px] font-semibold text-gray-400 dark:text-zinc-500 uppercase tracking-wider">{s.label}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1 tabular-nums">{s.value}</p>
              </div>
            );
          })}
        </div>

        {/* Transaction History */}
        <div className="bg-white dark:bg-zinc-800 rounded-2xl shadow-sm border border-gray-100 dark:border-zinc-700 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-50 dark:border-zinc-700 flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
            <h3 className="font-semibold text-gray-900 dark:text-white">Transaction History</h3>
            <div className="flex items-center gap-2">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-zinc-500" size={13} />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search..."
                  className="h-8 pl-8 pr-3 text-xs rounded-xl border border-gray-200 dark:border-zinc-600 bg-gray-50 dark:bg-zinc-700 text-gray-700 dark:text-zinc-200 placeholder:text-gray-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 w-36 transition-all"
                />
              </div>
              {/* Filter */}
              <div className="relative">
                <Filter className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-zinc-500 pointer-events-none" size={12} />
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value as typeof filter)}
                  className="h-8 pl-7 pr-3 text-xs rounded-xl border border-gray-200 dark:border-zinc-600 bg-gray-50 dark:bg-zinc-700 text-gray-700 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 appearance-none transition-all"
                >
                  <option value="ALL">All</option>
                  <option value="PAID">Paid</option>
                  <option value="PENDING">Pending</option>
                  <option value="FAILED">Failed</option>
                </select>
              </div>
            </div>
          </div>

          <div className="divide-y divide-gray-50 dark:divide-zinc-700">
            {loading ? (
              <div className="p-4 space-y-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-16 bg-gray-50 dark:bg-zinc-700/50 rounded-xl animate-pulse" />
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-14 h-14 rounded-2xl bg-gray-50 dark:bg-zinc-700 flex items-center justify-center mx-auto mb-4">
                  <CreditCard size={22} className="text-gray-300 dark:text-zinc-600" />
                </div>
                <p className="text-gray-700 dark:text-zinc-300 font-semibold text-sm">No transactions found</p>
                <p className="text-gray-400 dark:text-zinc-500 text-xs mt-1">
                  {transactions.length === 0
                    ? "Your payment history will appear here once you make your first contribution."
                    : "Try adjusting the filter or search."}
                </p>
                {transactions.length === 0 && (
                  <Link
                    href="/groups"
                    className="inline-flex items-center gap-1.5 mt-5 text-sm font-medium text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 transition-colors"
                  >
                    Go to My Groups <ArrowRight size={13} />
                  </Link>
                )}
              </div>
            ) : (
              filtered.map((tx) => {
                const cfg = statusConfig[tx.status] ?? statusConfig.PENDING;
                const StatusIcon = cfg.icon;
                return (
                  <div
                    key={tx.id}
                    className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50 dark:hover:bg-zinc-700/40 transition-colors"
                  >
                    {/* Icon */}
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      tx.status === "PAID"
                        ? "bg-emerald-50 dark:bg-emerald-500/10"
                        : tx.status === "FAILED"
                        ? "bg-red-50 dark:bg-red-500/10"
                        : "bg-amber-50 dark:bg-amber-500/10"
                    }`}>
                      <StatusIcon size={16} className={
                        tx.status === "PAID"
                          ? "text-emerald-600 dark:text-emerald-400"
                          : tx.status === "FAILED"
                          ? "text-red-500 dark:text-red-400"
                          : "text-amber-600 dark:text-amber-400"
                      } />
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">
                          {tx.groupName}
                        </p>
                        <span className="text-xs text-gray-400 dark:text-zinc-500">·</span>
                        <p className="text-xs text-gray-400 dark:text-zinc-500">Cycle {tx.cycleNumber}</p>
                      </div>
                      <p className="text-xs text-gray-400 dark:text-zinc-500 mt-0.5 font-mono truncate">
                        {tx.paymentReference || "—"}
                      </p>
                    </div>

                    {/* Date */}
                    <div className="hidden sm:block text-right flex-shrink-0">
                      <p className="text-xs text-gray-400 dark:text-zinc-500">
                        {formatDate(tx.paidAt || tx.createdAt)}
                      </p>
                    </div>

                    {/* Amount + status */}
                    <div className="text-right flex-shrink-0">
                      <p className="text-sm font-bold text-gray-900 dark:text-white tabular-nums">
                        ₦{tx.amount.toLocaleString()}
                      </p>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${cfg.classes}`}>
                        {cfg.label}
                      </span>
                    </div>

                    {/* Download receipt (paid only) */}
                    {tx.status === "PAID" && (
                      <button
                        onClick={() => downloadReceipt(tx)}
                        title="Download receipt"
                        className="flex-shrink-0 p-2 text-gray-300 dark:text-zinc-600 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 rounded-xl transition-all"
                      >
                        <Download size={14} />
                      </button>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
