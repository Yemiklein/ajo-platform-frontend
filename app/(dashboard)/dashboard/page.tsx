"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/authStore";
import { groupsAPI, payoutsAPI, contributionsAPI } from "@/lib/api";
import { Group, Payout } from "@/types";
import TopBar from "@/components/shared/TopBar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Wallet, TrendingUp, Clock } from "lucide-react";
import Link from "next/link";

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

  const statusColors: Record<string, string> = {
    ACTIVE: "bg-emerald-100 text-emerald-700",
    PENDING: "bg-yellow-100 text-yellow-700",
    COMPLETED: "bg-blue-100 text-blue-700",
    CANCELLED: "bg-red-100 text-red-700",
  };

  return (
    <div className="flex flex-col flex-1">
      <TopBar title="Dashboard" />

      <div className="flex-1 p-6 space-y-6">
        {/* Welcome */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Welcome back, {user?.firstName} 👋
          </h2>
          <p className="text-gray-500 mt-1">
            Here&apos;s an overview of your savings activity
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total Groups</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">
                    {loading ? "—" : groups.length}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center">
                  <Users className="text-emerald-600" size={22} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Active Groups</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">
                    {loading ? "—" : activeGroups.length}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                  <TrendingUp className="text-blue-600" size={22} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Pending Groups</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">
                    {loading ? "—" : pendingGroups.length}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center">
                  <Clock className="text-yellow-600" size={22} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total Received</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">
                    {loading ? "—" : `₦${totalReceived.toLocaleString()}`}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                  <Wallet className="text-purple-600" size={22} />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* My Groups */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <CardTitle className="text-lg">My Groups</CardTitle>
            <Link
              href="/groups"
              className="text-sm text-emerald-600 hover:underline font-medium"
            >
              View all
            </Link>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-gray-400 text-sm">Loading...</p>
            ) : groups.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-400 text-sm">
                  You haven&apos;t joined any groups yet.
                </p>
                <Link
                  href="/groups/create"
                  className="text-emerald-600 text-sm font-medium hover:underline mt-2 inline-block"
                >
                  Create your first group →
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {groups.slice(0, 5).map((group) => (
                  <Link href={`/groups/${group.id}`} key={group.id}>
                    <div className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer border border-gray-100">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-sm">
                          {group.name[0].toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 text-sm">
                            {group.name}
                          </p>
                          <p className="text-xs text-gray-400">
                            {group.currentMembers}/{group.maxMembers} members
                            · ₦{group.contributionAmount.toLocaleString()}/
                            {group.cycleType.toLowerCase()}
                          </p>
                        </div>
                      </div>
                      <span
                        className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusColors[group.status]}`}
                      >
                        {group.status}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Payouts */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <CardTitle className="text-lg">Recent Payouts</CardTitle>
            <Link
              href="/payouts"
              className="text-sm text-emerald-600 hover:underline font-medium"
            >
              View all
            </Link>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-gray-400 text-sm">Loading...</p>
            ) : payouts.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-8">
                No payouts yet
              </p>
            ) : (
              <div className="space-y-3">
                {payouts.slice(0, 5).map((payout) => (
                  <div
                    key={payout.id}
                    className="flex items-center justify-between p-3 rounded-lg border border-gray-100"
                  >
                    <div>
                      <p className="font-medium text-gray-900 text-sm">
                        Cycle {payout.cycleNumber} Payout
                      </p>
                      <p className="text-xs text-gray-400">
                        {payout.narration}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-emerald-600 text-sm">
                        ₦{payout.amount.toLocaleString()}
                      </p>
                      <Badge
                        className={`text-xs ${statusColors[payout.status]}`}
                      >
                        {payout.status}
                      </Badge>
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