"use client";

import { useEffect, useState } from "react";
import { payoutsAPI } from "@/lib/api";
import { Payout } from "@/types";
import TopBar from "@/components/shared/TopBar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Wallet, Trophy } from "lucide-react";

const statusColors: Record<string, string> = {
  COMPLETED: "bg-emerald-100 text-emerald-700",
  PENDING: "bg-yellow-100 text-yellow-700",
  PROCESSING: "bg-blue-100 text-blue-700",
  FAILED: "bg-red-100 text-red-700",
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

  return (
    <div className="flex flex-col flex-1">
      <TopBar title="My Payouts" />

      <div className="flex-1 p-6 space-y-6">
        {/* Summary Card */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total Received</p>
                  <p className="text-3xl font-bold text-emerald-600 mt-1">
                    {loading ? "—" : `₦${totalReceived.toLocaleString()}`}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center">
                  <Wallet className="text-emerald-600" size={22} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total Payouts</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">
                    {loading ? "—" : payouts.length}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                  <Trophy className="text-purple-600" size={22} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Completed</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">
                    {loading
                      ? "—"
                      : payouts.filter((p) => p.status === "COMPLETED").length}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                  <Trophy className="text-blue-600" size={22} />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Payouts List */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Payout History</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-gray-400 text-sm">Loading payouts...</p>
            ) : payouts.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                  <Wallet className="text-gray-400" size={28} />
                </div>
                <p className="text-gray-500 font-medium">No payouts yet</p>
                <p className="text-gray-400 text-sm mt-1">
                  Payouts will appear here once your cycle is complete
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {payouts.map((payout) => (
                  <div
                    key={payout.id}
                    className="flex items-center justify-between p-4 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                        <Trophy className="text-emerald-600" size={18} />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          Cycle {payout.cycleNumber} Payout
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {payout.narration || "Ajo payout disbursement"}
                        </p>
                        <p className="text-xs text-gray-400">
                          {payout.disbursedAt
                            ? new Date(payout.disbursedAt).toLocaleDateString(
                                "en-NG",
                                {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                }
                              )
                            : "Pending disbursement"}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-emerald-600 text-lg">
                        ₦{payout.amount.toLocaleString()}
                      </p>
                      <span
                        className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusColors[payout.status]}`}
                      >
                        {payout.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}