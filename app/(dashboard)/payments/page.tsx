"use client";

import TopBar from "@/components/shared/TopBar";
import { CreditCard, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function PaymentsPage() {
  return (
    <div className="flex flex-col flex-1 min-h-0">
      <TopBar title="Payments" />
      <div className="flex-1 p-5 lg:p-8 flex items-start">
        <div className="w-full max-w-lg bg-white dark:bg-zinc-800 rounded-2xl border border-gray-100 dark:border-zinc-700 shadow-sm overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-emerald-400 to-emerald-600" />
          <div className="text-center py-16 px-8">
            <div className="w-16 h-16 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center mx-auto mb-5">
              <CreditCard className="text-emerald-500 dark:text-emerald-400" size={26} />
            </div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Make a payment</h2>
            <p className="text-gray-400 dark:text-zinc-500 text-sm mt-2 leading-relaxed max-w-xs mx-auto">
              Payments are made from within your group. Go to a group detail page and tap the Pay button for the current cycle.
            </p>
            <Link
              href="/groups"
              className="inline-flex items-center gap-2 mt-6 h-10 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold transition-all"
            >
              Go to My Groups <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
