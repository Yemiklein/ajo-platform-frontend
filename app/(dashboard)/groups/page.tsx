"use client";

import { useEffect, useState } from "react";
import { groupsAPI } from "@/lib/api";
import { Group } from "@/types";
import TopBar from "@/components/shared/TopBar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Users, Plus, Search, ArrowRight, Copy, Check, Share2, Calendar } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

// ── Due date helpers ─────────────────────────────────────────────────────────

function getNextDueDate(group: Group): Date | null {
  if (group.status !== "ACTIVE") return null;
  const created = new Date(group.createdAt);
  const now = new Date();

  switch (group.cycleType) {
    case "DAILY": {
      const next = new Date(now);
      next.setDate(next.getDate() + 1);
      next.setHours(23, 59, 59, 0);
      return next;
    }
    case "WEEKLY": {
      const target = created.getDay();
      let diff = target - now.getDay();
      if (diff <= 0) diff += 7;
      const next = new Date(now);
      next.setDate(now.getDate() + diff);
      return next;
    }
    case "MONTHLY": {
      const day = created.getDate();
      let next = new Date(now.getFullYear(), now.getMonth(), day);
      if (next <= now) next = new Date(now.getFullYear(), now.getMonth() + 1, day);
      return next;
    }
    default:
      return null;
  }
}

function daysUntil(date: Date): number {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return Math.round((d.getTime() - now.getTime()) / 86_400_000);
}

function DueBadge({ group }: { group: Group }) {
  const due = getNextDueDate(group);
  if (!due) return null;

  const days = daysUntil(due);
  let label: string;
  let cls: string;

  if (days === 0) {
    label = "Due today";
    cls = "bg-red-50 text-red-600 ring-1 ring-red-200 dark:bg-red-500/10 dark:text-red-400 dark:ring-red-500/20";
  } else if (days === 1) {
    label = "Due tomorrow";
    cls = "bg-amber-50 text-amber-700 ring-1 ring-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:ring-amber-500/20";
  } else if (days <= 3) {
    label = `Due in ${days} days`;
    cls = "bg-amber-50 text-amber-700 ring-1 ring-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:ring-amber-500/20";
  } else {
    label = `Due in ${days} days`;
    cls = "bg-gray-50 text-gray-500 ring-1 ring-gray-200 dark:bg-zinc-700 dark:text-zinc-400 dark:ring-zinc-600";
  }

  return (
    <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full ${cls}`}>
      <Calendar size={9} />
      {label}
    </span>
  );
}

// ── CopyButton ────────────────────────────────────────────────────────────────

function CopyButton({ id }: { id: number }) {
  const [copied, setCopied] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);

  const handleCopyId = (e: React.MouseEvent) => {
    e.preventDefault();
    navigator.clipboard.writeText(String(id));
    setCopied(true);
    toast.success(`Group ID ${id} copied!`);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyLink = (e: React.MouseEvent) => {
    e.preventDefault();
    const link = `${window.location.origin}/join?id=${id}`;
    navigator.clipboard.writeText(link);
    setLinkCopied(true);
    toast.success("Invite link copied! Share it with anyone.");
    setTimeout(() => setLinkCopied(false), 2000);
  };

  return (
    <div className="flex items-center gap-1.5 flex-shrink-0">
      <button
        onClick={handleCopyId}
        className="flex items-center gap-1.5 text-xs font-bold font-mono bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20 px-2 py-0.5 rounded-lg tracking-wide hover:bg-emerald-100 dark:hover:bg-emerald-500/20 transition-colors"
      >
        {copied ? <Check size={11} /> : <Copy size={11} />}
        ID: {id}
      </button>
      <button
        onClick={handleCopyLink}
        className="flex items-center gap-1 text-xs bg-gray-50 dark:bg-zinc-700 text-gray-500 dark:text-zinc-400 border border-gray-200 dark:border-zinc-600 px-2 py-0.5 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-600 transition-colors"
        title="Copy invite link"
      >
        {linkCopied ? <Check size={11} /> : <Share2 size={11} />}
      </button>
    </div>
  );
}

// ── Status colours ────────────────────────────────────────────────────────────

const statusColors: Record<string, string> = {
  ACTIVE: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:ring-emerald-500/20",
  PENDING: "bg-amber-50 text-amber-700 ring-1 ring-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:ring-amber-500/20",
  COMPLETED: "bg-blue-50 text-blue-700 ring-1 ring-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:ring-blue-500/20",
  CANCELLED: "bg-red-50 text-red-700 ring-1 ring-red-200 dark:bg-red-500/10 dark:text-red-400 dark:ring-red-500/20",
};

// ── Page ──────────────────────────────────────────────────────────────────────

export default function GroupsPage() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [joinId, setJoinId] = useState("");
  const [joinLoading, setJoinLoading] = useState(false);

  useEffect(() => {
    groupsAPI.getMyGroups()
      .then((res) => setGroups(res.data))
      .catch((err) => console.error("Failed to fetch groups", err))
      .finally(() => setLoading(false));
  }, []);

  const handleJoin = async () => {
    if (!joinId.trim()) return;
    setJoinLoading(true);
    try {
      await groupsAPI.join({ groupId: Number(joinId) });
      toast.success("Successfully joined the group!");
      setJoinId("");
      const res = await groupsAPI.getMyGroups();
      setGroups(res.data);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || "Failed to join group. Check the ID and try again.");
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
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-zinc-500" size={15} />
            <Input
              placeholder="Search groups..."
              className="pl-10 bg-white dark:bg-zinc-800 border-gray-200 dark:border-zinc-700 rounded-xl h-10 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 dark:text-white dark:placeholder-zinc-500"
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
        <div className="bg-white dark:bg-zinc-800 rounded-2xl border border-gray-100 dark:border-zinc-700 shadow-sm p-5">
          <p className="text-sm font-semibold text-gray-800 dark:text-white mb-1">Join an existing group</p>
          <p className="text-xs text-gray-400 dark:text-zinc-500 mb-4">Enter a group ID shared by the group creator</p>
          <div className="flex gap-3">
            <Input
              placeholder="Enter group ID"
              value={joinId}
              onChange={(e) => setJoinId(e.target.value)}
              className="max-w-[180px] bg-gray-50 dark:bg-zinc-700 border-gray-200 dark:border-zinc-600 rounded-xl h-10 text-sm dark:text-white dark:placeholder-zinc-500"
              type="number"
            />
            <Button
              onClick={handleJoin}
              disabled={joinLoading || !joinId}
              className="border border-emerald-500 text-emerald-600 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/30 dark:hover:bg-emerald-500/20 rounded-xl h-10 px-5 text-sm font-medium transition-all"
              variant="ghost"
            >
              {joinLoading ? "Joining..." : "Join"}
            </Button>
          </div>
        </div>

        {/* Groups Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white dark:bg-zinc-800 rounded-2xl h-56 animate-pulse border border-gray-100 dark:border-zinc-700" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center mb-4">
              <Users className="text-emerald-400" size={26} />
            </div>
            <p className="text-gray-700 dark:text-zinc-300 font-semibold text-base">No groups found</p>
            <p className="text-gray-400 dark:text-zinc-500 text-sm mt-1 max-w-xs">
              Create a new group or join one with its ID to get started
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((group) => (
              <Link href={`/groups/${group.id}`} key={group.id}>
                <div className="bg-white dark:bg-zinc-800 rounded-2xl border border-gray-100 dark:border-zinc-700 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer overflow-hidden h-full flex flex-col">
                  <div className="h-1 bg-gradient-to-r from-emerald-400 to-emerald-600 flex-shrink-0" />
                  <div className="p-5 flex flex-col flex-1">
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-400/20 to-emerald-600/20 flex items-center justify-center text-emerald-700 dark:text-emerald-400 font-bold text-lg">
                        {group.name[0].toUpperCase()}
                      </div>
                      <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full ${statusColors[group.status]}`}>
                        {group.status}
                      </span>
                    </div>

                    <div className="flex items-baseline justify-between gap-2">
                      <h3 className="font-semibold text-gray-900 dark:text-white text-sm leading-tight truncate">{group.name}</h3>
                      <CopyButton id={group.id} />
                    </div>
                    <p className="text-gray-400 dark:text-zinc-500 text-xs mt-1 line-clamp-2 leading-relaxed">
                      {group.description || "No description provided"}
                    </p>

                    <div className="mt-4 pt-4 border-t border-gray-50 dark:border-zinc-700 grid grid-cols-2 gap-x-4 gap-y-3">
                      <div>
                        <p className="text-[10px] text-gray-400 dark:text-zinc-500 uppercase tracking-wide font-medium">Contribution</p>
                        <p className="text-sm font-bold text-gray-900 dark:text-white mt-0.5 tabular-nums">
                          ₦{group.contributionAmount.toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] text-gray-400 dark:text-zinc-500 uppercase tracking-wide font-medium">Cycle</p>
                        <p className="text-sm font-bold text-gray-900 dark:text-white mt-0.5 capitalize">
                          {group.cycleType.toLowerCase()}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] text-gray-400 dark:text-zinc-500 uppercase tracking-wide font-medium">Members</p>
                        <p className="text-sm font-bold text-gray-900 dark:text-white mt-0.5">
                          {group.currentMembers}/{group.maxMembers}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] text-gray-400 dark:text-zinc-500 uppercase tracking-wide font-medium">Pot Size</p>
                        <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400 mt-0.5 tabular-nums">
                          ₦{(group.contributionAmount * group.maxMembers).toLocaleString()}
                        </p>
                      </div>
                    </div>

                    {/* Due date badge */}
                    <div className="mt-4 flex items-center justify-between">
                      <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 text-xs font-medium">
                        View details <ArrowRight size={11} />
                      </div>
                      <DueBadge group={group} />
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
