"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { groupsAPI, contributionsAPI, payoutsAPI, paymentsAPI } from "@/lib/api";
import { Group, ContributionProgress } from "@/types";
import TopBar from "@/components/shared/TopBar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Users, Trophy, CreditCard, Bell, UserPlus } from "lucide-react";
import Link from "next/link";
import InviteMemberModal from "@/components/groups/InviteMemberModal";
import ContributionTracker from "@/components/groups/ContributionTracker";


const statusColors: Record<string, string> = {
    ACTIVE: "bg-emerald-100 text-emerald-700",
    PENDING: "bg-yellow-100 text-yellow-700",
    COMPLETED: "bg-blue-100 text-blue-700",
    CANCELLED: "bg-red-100 text-red-700",
    PAID: "bg-emerald-100 text-emerald-700",
    FAILED: "bg-red-100 text-red-700",
    UP_TO_DATE: "bg-emerald-100 text-emerald-700",
    BEHIND: "bg-yellow-100 text-yellow-700",
    DEFAULTED: "bg-red-100 text-red-700",
};

export default function GroupDetailPage() {
    const { id } = useParams();
    const { user } = useAuthStore();
    const [group, setGroup] = useState<Group | null>(null);
    const [progress, setProgress] = useState<ContributionProgress | null>(null);
    const [loading, setLoading] = useState(true);
    const [payLoading, setPayLoading] = useState(false);
    const [payoutLoading, setPayoutLoading] = useState(false);
    const [error, setError] = useState("");
    const [successMsg, setSuccessMsg] = useState("");

    // NEW: State for new features
    const [showInviteModal, setShowInviteModal] = useState(false);
    const [showContributionTracker, setShowContributionTracker] = useState(false);
    const [sendingReminders, setSendingReminders] = useState(false);

    const currentCycle = 1;

    useEffect(() => {
        const fetchData = async () => {
            try {
                const groupRes = await groupsAPI.getById(Number(id));
                setGroup(groupRes.data);

                if (groupRes.data.status === "ACTIVE") {
                    const progressRes = await contributionsAPI.getProgress(
                        Number(id),
                        currentCycle
                    );
                    setProgress(progressRes.data);
                }
            } catch (err) {
                console.error("Failed to load group", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

    const handlePay = async () => {
        setPayLoading(true);
        setError("");
        try {
            const res = await paymentsAPI.initialize({
                groupId: Number(id),
                cycleNumber: currentCycle,
            });
            // Redirect to Paystack checkout
            window.location.href = res.data.authorizationUrl;
        } catch (err: unknown) {
            const error = err as { response?: { data?: { message?: string } } };
            setError(error.response?.data?.message || "Failed to initialize payment");
            setPayLoading(false);
        }
    };

    const handleTriggerPayout = async () => {
        setPayoutLoading(true);
        setError("");
        setSuccessMsg("");
        try {
            await payoutsAPI.trigger(Number(id), currentCycle);
            setSuccessMsg("Payout triggered successfully!");
            // Refresh progress
            const progressRes = await contributionsAPI.getProgress(
                Number(id),
                currentCycle
            );
            setProgress(progressRes.data);
        } catch (err: unknown) {
            const error = err as { response?: { data?: { message?: string } } };
            setError(error.response?.data?.message || "Failed to trigger payout");
        } finally {
            setPayoutLoading(false);
        }
    };

// NEW: Handle sending reminders
const handleSendReminders = async () => {
  setSendingReminders(true);
  setError("");
  setSuccessMsg("");
  try {
    await groupsAPI.sendReminders(Number(id));
    setSuccessMsg("Reminders sent successfully to members who haven't paid!");
  } catch (err: any) {
    setError(err.response?.data?.message || "Failed to send reminders");
    console.error(err);
  } finally {
    setSendingReminders(false);
  }
};

    const isCreator = group?.createdByName === `${user?.firstName} ${user?.lastName}`;
    const allPaid = progress ? progress.paidCount === progress.totalMembers : false;
    const myContribution = progress?.contributions?.find(
        (c) => c.userId === user?.id
    );
    const alreadyPaid = myContribution?.status === "PAID";

    if (loading) {
        return (
            <div className="flex flex-col flex-1">
                <TopBar title="Group Details" />
                <div className="flex-1 p-6">
                    <p className="text-gray-400">Loading group...</p>
                </div>
            </div>
        );
    }

    if (!group) {
        return (
            <div className="flex flex-col flex-1">
                <TopBar title="Group Details" />
                <div className="flex-1 p-6">
                    <p className="text-red-500">Group not found.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col flex-1">
            <TopBar title={group.name} />

            <div className="flex-1 p-6 space-y-6 max-w-4xl">
                {/* Navigation and Action Buttons */}
                <div className="flex justify-between items-center">
                    <Link
                        href="/groups"
                        className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700"
                    >
                        <ArrowLeft size={16} />
                        Back to Groups
                    </Link>

                    {/* NEW: Action Buttons for Group Creator */}
                    {/* Action Buttons for Group Creator */}
                    {isCreator && (group.status === "PENDING" || group.status === "ACTIVE") && (
                        <div className="flex gap-3">
                            <Button
                                onClick={() => setShowInviteModal(true)}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2"
                                size="sm"
                            >
                                <UserPlus size={16} />
                                Invite Members
                            </Button>

                            {/* Only show these buttons for ACTIVE groups */}
                            {group.status === "ACTIVE" && (
                                <>
                                    <Button
                                        onClick={() => setShowContributionTracker(!showContributionTracker)}
                                        variant="outline"
                                        size="sm"
                                        className="gap-2"
                                    >
                                        {showContributionTracker ? "Hide" : "View"} Contribution Stats
                                    </Button>
                                    <Button
                                        onClick={handleSendReminders}
                                        disabled={sendingReminders}
                                        variant="outline"
                                        size="sm"
                                        className="gap-2"
                                    >
                                        <Bell size={16} />
                                        {sendingReminders ? "Sending..." : "Send Reminders"}
                                    </Button>
                                </>
                            )}
                        </div>
                    )}
                </div>

                {/* Error / Success */}
                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                        {error}
                    </div>
                )}
                {successMsg && (
                    <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-lg text-sm">
                        {successMsg}
                    </div>
                )}

                {/* Group Header */}
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-start justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-xl">
                                    {group.name[0].toUpperCase()}
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900">
                                        {group.name}
                                    </h2>
                                    <p className="text-gray-400 text-sm">
                                        {group.description || "No description"}
                                    </p>
                                    <p className="text-xs text-gray-400 mt-1">
                                        Created by {group.createdByName}
                                        {isCreator && (
                                            <span className="ml-2 bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full text-xs">
                                                You
                                            </span>
                                        )}
                                    </p>
                                </div>
                            </div>
                            <span
                                className={`text-xs font-medium px-3 py-1 rounded-full ${statusColors[group.status]}`}
                            >
                                {group.status}
                            </span>
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-gray-100">
                            <div>
                                <p className="text-xs text-gray-400">Contribution</p>
                                <p className="text-lg font-bold text-gray-900">
                                    ₦{group.contributionAmount.toLocaleString()}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-400">Cycle</p>
                                <p className="text-lg font-bold text-gray-900 capitalize">
                                    {group.cycleType.toLowerCase()}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-400">Members</p>
                                <p className="text-lg font-bold text-gray-900">
                                    {group.currentMembers}/{group.maxMembers}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-400">Pot Per Cycle</p>
                                <p className="text-lg font-bold text-emerald-600">
                                    ₦
                                    {(
                                        group.contributionAmount * group.maxMembers
                                    ).toLocaleString()}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* NEW: Contribution Tracker Component */}
                {showContributionTracker && group.status === "ACTIVE" && (
                    <div className="mt-4">
                        <ContributionTracker groupId={Number(id)} />
                    </div>
                )}

                {/* Cycle Progress + Pay Button (only for ACTIVE groups) */}
                {group.status === "ACTIVE" && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base flex items-center gap-2">
                                <CreditCard size={18} className="text-emerald-600" />
                                Cycle {currentCycle} — Contributions
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* Progress Bar */}
                            {progress && (
                                <div>
                                    <div className="flex justify-between text-sm mb-2">
                                        <span className="text-gray-500">
                                            {progress.paidCount} of {progress.totalMembers} paid
                                        </span>
                                        <span className="font-medium text-emerald-600">
                                            {Math.round(
                                                (progress.paidCount / progress.totalMembers) * 100
                                            )}
                                            %
                                        </span>
                                    </div>
                                    <div className="w-full bg-gray-100 rounded-full h-2.5">
                                        <div
                                            className="bg-emerald-500 h-2.5 rounded-full transition-all"
                                            style={{
                                                width: `${(progress.paidCount / progress.totalMembers) * 100}%`,
                                            }}
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Pay Button */}
                            {!alreadyPaid ? (
                                <Button
                                    onClick={handlePay}
                                    disabled={payLoading}
                                    className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2"
                                >
                                    <CreditCard size={16} />
                                    {payLoading
                                        ? "Redirecting to Paystack..."
                                        : `Pay ₦${group.contributionAmount.toLocaleString()} for Cycle ${currentCycle}`}
                                </Button>
                            ) : (
                                <div className="flex items-center gap-2 text-emerald-600 text-sm font-medium">
                                    <span className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center text-xs">
                                        ✓
                                    </span>
                                    You have paid for this cycle
                                </div>
                            )}

                            {/* Trigger Payout (creator only, all paid) */}
                            {isCreator && allPaid && (
                                <div className="pt-4 border-t border-gray-100">
                                    <p className="text-sm text-gray-600 mb-3">
                                        All members have paid. You can now trigger the payout.
                                    </p>
                                    <Button
                                        onClick={handleTriggerPayout}
                                        disabled={payoutLoading}
                                        className="bg-purple-600 hover:bg-purple-700 text-white gap-2"
                                    >
                                        <Trophy size={16} />
                                        {payoutLoading ? "Triggering..." : "Trigger Payout"}
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )}

                {/* Members List */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                            <Users size={18} className="text-emerald-600" />
                            Members ({group.currentMembers}/{group.maxMembers})
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {group.status === "PENDING" && (
                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                                <p className="text-yellow-700 text-sm">
                                    ⏳ Waiting for{" "}
                                    {group.maxMembers - group.currentMembers} more member
                                    {group.maxMembers - group.currentMembers !== 1 ? "s" : ""}{" "}
                                    to join before the group becomes active.
                                </p>
                            </div>
                        )}
                        <div className="space-y-3">
                            {group.members?.map((member) => {
                                const contribution = progress?.contributions?.find(
                                    (c) => c.userId === member.user?.id
                                );
                                return (
                                    <div
                                        key={member.id}
                                        className="flex items-center justify-between p-3 rounded-lg border border-gray-100"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 font-semibold text-sm">
                                                {member.user?.firstName?.[0]}
                                                {member.user?.lastName?.[0]}
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-gray-900">
                                                    {member.user?.firstName} {member.user?.lastName}
                                                    {member.user?.id === user?.id && (
                                                        <span className="ml-2 text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">
                                                            You
                                                        </span>
                                                    )}
                                                </p>
                                                <p className="text-xs text-gray-400">
                                                    Payout position #{member.payoutPosition}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {contribution && (
                                                <span
                                                    className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusColors[contribution.status]}`}
                                                >
                                                    {contribution.status}
                                                </span>
                                            )}
                                            <Badge
                                                variant="outline"
                                                className="text-xs text-gray-400"
                                            >
                                                {member.status}
                                            </Badge>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* NEW: Invite Member Modal */}
            {showInviteModal && (
                <InviteMemberModal
                    groupId={Number(id)}
                    groupName={group.name}
                    onClose={() => setShowInviteModal(false)}
                    // onInviteSent={() => {
                    //     setShowInviteModal(false);
                    //     setSuccessMsg("Invite sent successfully!");
                    //     setTimeout(() => setSuccessMsg(""), 3000);
                    // }}
                />
            )}
        </div>
    );
}