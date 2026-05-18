"use client";

import { useEffect, useState } from "react";
import { groupsAPI } from "@/lib/api";
import { Group } from "@/types";
import TopBar from "@/components/shared/TopBar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Users, Plus, Search, ArrowRight } from "lucide-react";
import Link from "next/link";

const statusColors: Record<string, string> = {
  ACTIVE: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
  PENDING: "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
  COMPLETED: "bg-blue-50 text-blue-700 ring-1 ring-blue-200",
  CANCELLED: "bg-red-50 text-red-700 ring-1 ring-red-200",
};

export default function GroupsPage() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [joinId, setJoinId] = useState("");
  const [joinLoading, setJoinLoading] = useState(false);
  const [joinError, setJoinError] = useState("");
  const [joinSuccess, setJoinSuccess] = useState("");

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const res = await groupsAPI.getMyGroups();
        setGroups(res.data);
      } catch (err) {
        console.error("Failed to fetch groups", err);
      } finally {
        setLoading(false);
      }
    };
    fetchGroups();
  }, []);

  const handleJoin = async () => {
    if (!joinId.trim()) return;
    setJoinLoading(true);
    setJoinError("");
    setJoinSuccess("");
    try {
      await groupsAPI.join({ groupId: Number(joinId) });
      setJoinSuccess("Successfully joined the group!");
      setJoinId("");
      const res = await groupsAPI.getMyGroups();
      setGroups(res.data);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setJoinError(error.response?.data?.message || "Failed to join group. Check the ID and try again.");
    } finally {
      setJoinLoading(false);
    }
  };

  const filtered = groups.filter((g) =>
    g.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <TopBar title="My Groups" />

      <div className="flex-1 p-5 lg:p-8 space-y-6 overflow-y-auto">

        {/* Header Actions */}
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
            <Input
              placeholder="Search groups..."
              className="pl-10 bg-white border-gray-200 rounded-xl h-10 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Link href="/groups/create">
            <Button className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2 rounded-xl h-10 px-5 text-sm font-medium shadow-sm shadow-emerald-200 transition-all">
              <Plus size={15} />
              Create Group
            </Button>
          </Link>
        </div>

        {/* Join Group */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <p className="text-sm font-semibold text-gray-800 mb-1">Join an existing group</p>
          <p className="text-xs text-gray-400 mb-4">Enter a group ID shared by the group creator</p>
          <div className="flex gap-3">
            <Input
              placeholder="Enter group ID"
              value={joinId}
              onChange={(e) => setJoinId(e.target.value)}
              className="max-w-[180px] bg-gray-50 border-gray-200 rounded-xl h-10 text-sm"
              type="number"
            />
            <Button
              onClick={handleJoin}
              disabled={joinLoading || !joinId}
              className="border border-emerald-500 text-emerald-600 bg-emerald-50 hover:bg-emerald-100 rounded-xl h-10 px-5 text-sm font-medium transition-all"
              variant="ghost"
            >
              {joinLoading ? "Joining..." : "Join"}
            </Button>
          </div>
          {joinError && <p className="text-rose-500 text-xs mt-2.5">{joinError}</p>}
          {joinSuccess && <p className="text-emerald-600 text-xs mt-2.5">{joinSuccess}</p>}
        </div>

        {/* Groups Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-2xl h-48 animate-pulse border border-gray-100" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-2xl bg-emerald-50 flex items-center justify-center mb-4">
              <Users className="text-emerald-400" size={26} />
            </div>
            <p className="text-gray-700 font-semibold text-base">No groups found</p>
            <p className="text-gray-400 text-sm mt-1 max-w-xs">
              Create a new group or join one with its ID to get started
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((group) => (
              <Link href={`/groups/${group.id}`} key={group.id}>
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer overflow-hidden h-full">
                  {/* Card top accent */}
                  <div className="h-1 bg-gradient-to-r from-emerald-400 to-emerald-600" />
                  <div className="p-5">
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-400/20 to-emerald-600/20 flex items-center justify-center text-emerald-700 font-bold text-lg">
                        {group.name[0].toUpperCase()}
                      </div>
                      <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full ${statusColors[group.status]}`}>
                        {group.status}
                      </span>
                    </div>

                    <div className="flex items-baseline justify-between gap-2">
                      <h3 className="font-semibold text-gray-900 text-sm leading-tight truncate">{group.name}</h3>
                      <span className="text-[10px] font-mono bg-gray-100 text-gray-400 px-1.5 py-0.5 rounded-md flex-shrink-0">
                        #{group.id}
                      </span>
                    </div>
                    <p className="text-gray-400 text-xs mt-1 line-clamp-2 leading-relaxed">
                      {group.description || "No description provided"}
                    </p>

                    <div className="mt-4 pt-4 border-t border-gray-50 grid grid-cols-2 gap-x-4 gap-y-3">
                      <div>
                        <p className="text-[10px] text-gray-400 uppercase tracking-wide font-medium">Contribution</p>
                        <p className="text-sm font-bold text-gray-900 mt-0.5 tabular-nums">
                          ₦{group.contributionAmount.toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] text-gray-400 uppercase tracking-wide font-medium">Cycle</p>
                        <p className="text-sm font-bold text-gray-900 mt-0.5 capitalize">
                          {group.cycleType.toLowerCase()}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] text-gray-400 uppercase tracking-wide font-medium">Members</p>
                        <p className="text-sm font-bold text-gray-900 mt-0.5">
                          {group.currentMembers}/{group.maxMembers}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] text-gray-400 uppercase tracking-wide font-medium">Pot Size</p>
                        <p className="text-sm font-bold text-emerald-600 mt-0.5 tabular-nums">
                          ₦{(group.contributionAmount * group.maxMembers).toLocaleString()}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 flex items-center gap-1 text-emerald-600 text-xs font-medium">
                      View details <ArrowRight size={11} />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
