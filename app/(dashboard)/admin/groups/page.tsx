"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { adminAPI } from "@/lib/api";
import { Group } from "@/types";
import TopBar from "@/components/shared/TopBar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, ArrowLeft } from "lucide-react";
import Link from "next/link";

const statusColors: Record<string, string> = {
  ACTIVE: "bg-emerald-100 text-emerald-700",
  PENDING: "bg-yellow-100 text-yellow-700",
  COMPLETED: "bg-blue-100 text-blue-700",
  CANCELLED: "bg-red-100 text-red-700",
};

export default function AdminGroupsPage() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<number | null>(null);

  useEffect(() => {
    if (user && user.role !== "ADMIN") {
      router.push("/dashboard");
    }
  }, [user, router]);

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const res = await adminAPI.getAllGroups();
        setGroups(res.data);
      } catch (err) {
        console.error("Failed to fetch groups", err);
      } finally {
        setLoading(false);
      }
    };
    if (user?.role === "ADMIN") fetchGroups();
  }, [user]);

  const handleCancelGroup = async (id: number) => {
    if (!confirm("Are you sure you want to cancel this group?")) return;
    setUpdating(id);
    try {
      await adminAPI.updateGroupStatus(id, "CANCELLED");
      setGroups((prev) =>
        prev.map((g) =>
          g.id === id ? { ...g, status: "CANCELLED" as Group["status"] } : g
        )
      );
    } catch (err) {
      console.error("Failed to cancel group", err);
    } finally {
      setUpdating(null);
    }
  };

  if (user?.role !== "ADMIN") return null;

  return (
    <div className="flex flex-col flex-1">
      <TopBar title="Manage Groups" />

      <div className="flex-1 p-6 space-y-6">
        <Link
          href="/admin"
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700"
        >
          <ArrowLeft size={16} />
          Back to Admin Panel
        </Link>

        {/* Summary */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {["ACTIVE", "PENDING", "COMPLETED", "CANCELLED"].map((status) => (
            <Card key={status}>
              <CardContent className="pt-4 pb-4">
                <p className="text-xs text-gray-400 capitalize">
                  {status.toLowerCase()}
                </p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {loading
                    ? "—"
                    : groups.filter((g) => g.status === status).length}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Groups Table */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Users size={18} className="text-purple-600" />
              All Groups ({groups.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-gray-400 text-sm">Loading groups...</p>
            ) : groups.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-gray-500 font-medium">No groups found</p>
              </div>
            ) : (
              <div className="space-y-3">
                {groups.map((group) => (
                  <div
                    key={group.id}
                    className="flex items-center justify-between p-4 rounded-lg border border-gray-100"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 font-bold text-sm">
                        {group.name[0].toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-gray-900 text-sm">
                            {group.name}
                          </p>
                          <span className="text-xs font-mono bg-gray-100 text-gray-400 px-2 py-0.5 rounded">
                            ID: {group.id}
                          </span>
                        </div>
                        <p className="text-xs text-gray-400 mt-0.5">
                          Created by {group.createdByName} ·{" "}
                          {group.currentMembers}/{group.maxMembers} members ·
                          ₦{group.contributionAmount.toLocaleString()}/
                          {group.cycleType.toLowerCase()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span
                        className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusColors[group.status]}`}
                      >
                        {group.status}
                      </span>
                      {group.status !== "CANCELLED" &&
                        group.status !== "COMPLETED" && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-red-500 border-red-200 hover:bg-red-50 text-xs"
                            disabled={updating === group.id}
                            onClick={() => handleCancelGroup(group.id)}
                          >
                            {updating === group.id
                              ? "Cancelling..."
                              : "Cancel"}
                          </Button>
                        )}
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