"use client";

import { useEffect, useState } from "react";
import { groupsAPI } from "@/lib/api";
import { Group } from "@/types";
import TopBar from "@/components/shared/TopBar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Users, Plus, Search } from "lucide-react";
import Link from "next/link";

const statusColors: Record<string, string> = {
    ACTIVE: "bg-emerald-100 text-emerald-700",
    PENDING: "bg-yellow-100 text-yellow-700",
    COMPLETED: "bg-blue-100 text-blue-700",
    CANCELLED: "bg-red-100 text-red-700",
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
            // Refresh groups list
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
        <div className="flex flex-col flex-1">
            <TopBar title="My Groups" />

            <div className="flex-1 p-6 space-y-6">
                {/* Actions Row */}
                <div className="flex flex-col sm:flex-row gap-3 justify-between">
                    {/* Search */}
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                        <Input
                            placeholder="Search groups..."
                            className="pl-9"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>

                    {/* Create Button */}
                    <Link href="/groups/create">
                        <Button className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2">
                            <Plus size={16} />
                            Create Group
                        </Button>
                    </Link>
                </div>

                {/* Join Group */}
                <Card>
                    <CardContent className="pt-6">
                        <p className="text-sm font-semibold text-gray-700 mb-3">
                            Join an existing group
                        </p>
                        <div className="flex gap-3">
                            <Input
                                placeholder="Enter group ID"
                                value={joinId}
                                onChange={(e) => setJoinId(e.target.value)}
                                className="max-w-xs"
                                type="number"
                            />
                            <Button
                                onClick={handleJoin}
                                disabled={joinLoading || !joinId}
                                variant="outline"
                                className="border-emerald-600 text-emerald-600 hover:bg-emerald-50"
                            >
                                {joinLoading ? "Joining..." : "Join"}
                            </Button>
                        </div>
                        {joinError && (
                            <p className="text-red-500 text-xs mt-2">{joinError}</p>
                        )}
                        {joinSuccess && (
                            <p className="text-emerald-600 text-xs mt-2">{joinSuccess}</p>
                        )}
                    </CardContent>
                </Card>

                {/* Groups List */}
                {loading ? (
                    <p className="text-gray-400 text-sm">Loading groups...</p>
                ) : filtered.length === 0 ? (
                    <div className="text-center py-16">
                        <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                            <Users className="text-gray-400" size={28} />
                        </div>
                        <p className="text-gray-500 font-medium">No groups found</p>
                        <p className="text-gray-400 text-sm mt-1">
                            Create a new group or join one with its ID
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filtered.map((group) => (
                            <Link href={`/groups/${group.id}`} key={group.id}>
                                <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                                    <CardContent className="pt-6">
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-lg">
                                                {group.name[0].toUpperCase()}
                                            </div>
                                            <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusColors[group.status]}`}>
                                                {group.status}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <h3 className="font-semibold text-gray-900">{group.name}</h3>
                                            <span className="text-xs font-mono bg-gray-100 text-gray-500 px-2 py-0.5 rounded">
                                                ID: {group.id}
                                            </span>
                                        </div>
                                        <p className="text-gray-400 text-xs mt-1 line-clamp-2">
                                            {group.description || "No description"}
                                        </p>
                                        <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-2 gap-2">
                                            <div>
                                                <p className="text-xs text-gray-400">Contribution</p>
                                                <p className="text-sm font-semibold text-gray-800">
                                                    ₦{group.contributionAmount.toLocaleString()}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-400">Cycle</p>
                                                <p className="text-sm font-semibold text-gray-800 capitalize">
                                                    {group.cycleType.toLowerCase()}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-400">Members</p>
                                                <p className="text-sm font-semibold text-gray-800">
                                                    {group.currentMembers}/{group.maxMembers}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-400">Pot Size</p>
                                                <p className="text-sm font-semibold text-emerald-600">
                                                    ₦{(group.contributionAmount * group.maxMembers).toLocaleString()}
                                                </p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}