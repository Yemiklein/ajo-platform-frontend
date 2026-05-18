"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { groupsAPI, contributionsAPI, payoutsAPI, paymentsAPI } from "@/lib/api";
import { Group, ContributionProgress, Payout, Contribution } from "@/types";
import TopBar from "@/components/shared/TopBar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft, Users, Trophy, CreditCard, Bell, UserPlus,
  Share2, Check, History, ChevronDown, ChevronUp, PartyPopper,
  Activity, UserCheck, Banknote,
} from "lucide-react";
import Link from "next/link";
import InviteMemberModal from "@/components/groups/InviteMemberModal";
import ContributionTracker from "@/components/groups/ContributionTracker";
import { toast } from "sonner";

const statusBadge: Record<string, string> = {
  ACTIVE: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:ring-emerald-500/20",
  PENDING: "bg-amber-50 text-amber-700 ring-1 ring-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:ring-amber-500/20",
  COMPLETED: "bg-blue-50 text-blue-700 ring-1 ring-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:ring-blue-500/20",
  CANCELLED: "bg-red-50 text-red-700 ring-1 ring-red-200 dark:bg-red-500/10 dark:text-red-400 dark:ring-red-500/20",
  PAID: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:ring-emerald-500/20",
  FAILED: "bg-red-50 text-red-700 ring-1 ring-red-200 dark:bg-red-500/10 dark:text-red-400 dark:ring-red-500/20",
  DEFAULTED: "bg-red-50 text-red-700 ring-1 ring-red-200 dark:bg-red-500/10 dark:text-red-400 dark:ring-red-500/20",
};

export default function GroupDetailPage() {
  const { id } = useParams();
  const { user } = useAuthStore();
  const [group, setGroup] = useState<Group | null>(null);
  const [progress, setProgress] = useState<ContributionProgress | null>(null);
  const [allContributions, setAllContributions] = useState<Contribution[]>([]);
  const [loading, setLoading] = useState(true);
  const [payLoading, setPayLoading] = useState(false);
  const [payoutLoading, setPayoutLoading] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showContributionTracker, setShowContributionTracker] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [sendingReminders, setSendingReminders] = useState(false);
  const [payoutExists, setPayoutExists] = useState(false);
  const [currentCycle, setCurrentCycle] = useState(1);
  const [groupPayouts, setGroupPayouts] = useState<Payout[]>([]);
  const [linkCopied, setLinkCopied] = useState(false);
  const [showActivity, setShowActivity] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const groupRes = await groupsAPI.getById(Number(id));
        setGroup(groupRes.data);

        if (groupRes.data.status === "ACTIVE") {
          const [payoutRes, contribRes] = await Promise.all([
            payoutsAPI.getByGroup(Number(id)),
            contributionsAPI.getByGroup(Number(id)),
          ]);
          const completedPayouts = payoutRes.data.filter(
            (p: Payout) => p.status === "COMPLETED"
          ).length;
          const calculatedCycle = completedPayouts + 1;
          setCurrentCycle(calculatedCycle);

          const existingPayout = payoutRes.data.find(
            (p: Payout) => p.cycleNumber === calculatedCycle
          );
          if (existingPayout) setPayoutExists(true);
          setGroupPayouts(payoutRes.data);
          setAllContributions(contribRes.data || []);

          const progressRes = await contributionsAPI.getProgress(Number(id), calculatedCycle);
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
    try {
      const res = await paymentsAPI.initialize({ groupId: Number(id), cycleNumber: currentCycle });
      window.location.href = res.data.authorizationUrl;
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || "Failed to initialize payment");
      setPayLoading(false);
    }
  };

  const handleTriggerPayout = async () => {
    setPayoutLoading(true);
    try {
      await payoutsAPI.trigger(Number(id), currentCycle);
      toast.success("Payout triggered successfully!");

      // Re-fetch group so we pick up any COMPLETED status the backend set
      const [groupRes, payoutRes] = await Promise.all([
        groupsAPI.getById(Number(id)),
        payoutsAPI.getByGroup(Number(id)),
      ]);
      setGroup(groupRes.data);
      setGroupPayouts(payoutRes.data);

      if (groupRes.data.status === "ACTIVE") {
        const nextCycle = currentCycle + 1;
        setCurrentCycle(nextCycle);
        setPayoutExists(false);
        const progressRes = await contributionsAPI.getProgress(Number(id), nextCycle);
        setProgress(progressRes.data);
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || "Failed to trigger payout");
    } finally {
      setPayoutLoading(false);
    }
  };

  const handleSendReminders = async () => {
    setSendingReminders(true);
    try {
      await groupsAPI.sendReminders(Number(id));
      toast.success("Reminders sent to members who haven't paid!");
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || "Failed to send reminders");
    } finally {
      setSendingReminders(false);
    }
  };

  const handleShareLink = () => {
    const link = `${window.location.origin}/join?id=${id}`;
    navigator.clipboard.writeText(link);
    setLinkCopied(true);
    toast.success("Invite link copied! Share it with anyone.");
    setTimeout(() => setLinkCopied(false), 2000);
  };

  const isCreator = group?.createdBy
    ? group.createdBy.id === user?.id
    : group?.createdByName === `${user?.firstName} ${user?.lastName}`;
  const allPaid = progress ? progress.paidCount === progress.totalMembers : false;
  const myContribution = progress?.contributions?.find((c) => c.userId === user?.id);
  const alreadyPaid = myContribution?.status === "PAID";

  // Group contribution history by cycle
  const cyclesMap = allContributions.reduce((acc, c) => {
    if (!acc[c.cycleNumber]) acc[c.cycleNumber] = [];
    acc[c.cycleNumber].push(c);
    return acc;
  }, {} as Record<number, Contribution[]>);
  const pastCycles = Object.entries(cyclesMap)
    .map(([cycle, contribs]) => ({ cycle: Number(cycle), contribs }))
    .filter(({ cycle }) => cycle < currentCycle)
    .sort((a, b) => b.cycle - a.cycle);

  if (loading) {
    return (
      <div className="flex flex-col flex-1">
        <TopBar title="Group Details" />
        <div className="flex-1 p-6 space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white dark:bg-zinc-800 rounded-2xl h-32 animate-pulse border border-gray-100 dark:border-zinc-700" />
          ))}
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
    <div className="flex flex-col flex-1 min-h-0">
      <TopBar title={group.name} />

      <div className="flex-1 p-5 lg:p-8 overflow-y-auto">
        <div className="max-w-3xl space-y-5">

          {/* Nav + Actions */}
          <div className="flex justify-between items-center flex-wrap gap-3">
            <Link
              href="/groups"
              className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-zinc-400 hover:text-gray-700 dark:hover:text-zinc-200 transition-colors"
            >
              <ArrowLeft size={15} />
              Back to Groups
            </Link>

            <div className="flex gap-2 flex-wrap">
              <button
                onClick={handleShareLink}
                className="flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-xl border border-gray-200 dark:border-zinc-600 text-gray-600 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-zinc-700 transition-all"
              >
                {linkCopied ? <Check size={13} /> : <Share2 size={13} />}
                {linkCopied ? "Copied!" : "Share Link"}
              </button>

              {isCreator && (group.status === "PENDING" || group.status === "ACTIVE") && (
                <>
                  <Button
                    onClick={() => setShowInviteModal(true)}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5 rounded-xl h-9 px-4 text-xs"
                    size="sm"
                  >
                    <UserPlus size={14} />
                    Invite
                  </Button>

                  {group.status === "ACTIVE" && (
                    <>
                      <Button
                        onClick={() => setShowContributionTracker(!showContributionTracker)}
                        variant="outline"
                        size="sm"
                        className="rounded-xl h-9 px-4 text-xs dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-700"
                      >
                        {showContributionTracker ? "Hide" : "View"} Stats
                      </Button>
                      <Button
                        onClick={handleSendReminders}
                        disabled={sendingReminders}
                        variant="outline"
                        size="sm"
                        className="gap-1.5 rounded-xl h-9 px-4 text-xs dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-700"
                      >
                        <Bell size={13} />
                        {sendingReminders ? "Sending..." : "Remind"}
                      </Button>
                    </>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Group Header Card */}
          <div className="bg-white dark:bg-zinc-800 rounded-2xl border border-gray-100 dark:border-zinc-700 shadow-sm overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-emerald-400 to-emerald-600" />
            <div className="p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-400/20 to-emerald-600/20 flex items-center justify-center text-emerald-700 dark:text-emerald-400 font-bold text-xl flex-shrink-0">
                    {group.name[0].toUpperCase()}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">{group.name}</h2>
                    <p className="text-gray-400 dark:text-zinc-500 text-sm">{group.description || "No description"}</p>
                    <p className="text-xs text-gray-400 dark:text-zinc-500 mt-1">
                      Created by {group.createdByName}
                      {isCreator && (
                        <span className="ml-2 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 px-2 py-0.5 rounded-full text-xs font-medium">
                          You
                        </span>
                      )}
                    </p>
                  </div>
                </div>
                <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full flex-shrink-0 ${statusBadge[group.status]}`}>
                  {group.status}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-5 border-t border-gray-50 dark:border-zinc-700">
                {[
                  { label: "Contribution", value: `₦${group.contributionAmount.toLocaleString()}`, colored: false },
                  { label: "Cycle", value: group.cycleType.toLowerCase(), colored: false },
                  { label: "Members", value: `${group.currentMembers}/${group.maxMembers}`, colored: false },
                  { label: "Pot Per Cycle", value: `₦${(group.contributionAmount * group.maxMembers).toLocaleString()}`, colored: true },
                ].map(({ label, value, colored }) => (
                  <div key={label}>
                    <p className="text-xs text-gray-400 dark:text-zinc-500 uppercase tracking-wide font-medium">{label}</p>
                    <p className={`text-lg font-bold mt-0.5 capitalize tabular-nums ${colored ? "text-emerald-600 dark:text-emerald-400" : "text-gray-900 dark:text-white"}`}>
                      {value}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Contribution Tracker */}
          {showContributionTracker && group.status === "ACTIVE" && (
            <ContributionTracker groupId={Number(id)} />
          )}

          {/* Ajo Completed Banner */}
          {group.status === "COMPLETED" && (
            <div className="bg-white dark:bg-zinc-800 rounded-2xl border border-gray-100 dark:border-zinc-700 shadow-sm overflow-hidden">
              <div className="h-1 bg-gradient-to-r from-violet-400 to-violet-600" />
              <div className="p-6 flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-violet-50 dark:bg-violet-500/10 flex items-center justify-center flex-shrink-0">
                  <PartyPopper size={22} className="text-violet-600 dark:text-violet-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">This Ajo has ended</h3>
                  <p className="text-sm text-gray-500 dark:text-zinc-400 mt-1 leading-relaxed">
                    All cycles are complete and every member has received their payout. Well done to everyone in this circle!
                  </p>
                  <Link
                    href="/groups"
                    className="inline-flex items-center gap-1.5 mt-4 text-sm font-medium text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 transition-colors"
                  >
                    Browse other groups <ArrowLeft size={13} className="rotate-180" />
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* Cycle Progress + Pay */}
          {group.status === "ACTIVE" && (
            <div className="bg-white dark:bg-zinc-800 rounded-2xl border border-gray-100 dark:border-zinc-700 shadow-sm">
              <div className="px-6 py-4 border-b border-gray-50 dark:border-zinc-700 flex items-center gap-2.5">
                <CreditCard size={16} className="text-emerald-600 dark:text-emerald-400" />
                <h3 className="font-semibold text-gray-900 dark:text-white">Cycle {currentCycle} — Contributions</h3>
              </div>
              <div className="p-6 space-y-5">
                {progress && (
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-500 dark:text-zinc-400">
                        {progress.paidCount} of {progress.totalMembers} paid
                      </span>
                      <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                        {progress.totalMembers > 0
                          ? Math.round((progress.paidCount / progress.totalMembers) * 100)
                          : 0}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-100 dark:bg-zinc-700 rounded-full h-2.5">
                      <div
                        className="bg-emerald-500 h-2.5 rounded-full transition-all duration-500"
                        style={{ width: `${(progress.paidCount / progress.totalMembers) * 100}%` }}
                      />
                    </div>
                  </div>
                )}

                {!alreadyPaid ? (
                  <Button
                    onClick={handlePay}
                    disabled={payLoading}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2 rounded-xl h-10"
                  >
                    <CreditCard size={15} />
                    {payLoading
                      ? "Redirecting to Paystack..."
                      : `Pay ₦${group.contributionAmount.toLocaleString()} for Cycle ${currentCycle}`}
                  </Button>
                ) : (
                  <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 text-sm font-medium bg-emerald-50 dark:bg-emerald-500/10 px-4 py-3 rounded-xl">
                    <Check size={16} />
                    You have paid for this cycle
                  </div>
                )}

                {isCreator && allPaid && !payoutExists && (
                  <div className="pt-4 border-t border-gray-50 dark:border-zinc-700">
                    <p className="text-sm text-gray-600 dark:text-zinc-400 mb-3">
                      All members have paid. You can now trigger the payout.
                    </p>
                    <Button
                      onClick={handleTriggerPayout}
                      disabled={payoutLoading}
                      className="bg-violet-600 hover:bg-violet-700 text-white gap-2 rounded-xl h-10"
                    >
                      <Trophy size={15} />
                      {payoutLoading ? "Triggering..." : "Trigger Payout"}
                    </Button>
                  </div>
                )}

                {isCreator && payoutExists && (
                  <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 text-sm font-medium pt-4 border-t border-gray-50 dark:border-zinc-700 bg-emerald-50 dark:bg-emerald-500/10 px-4 py-3 rounded-xl">
                    <Check size={16} />
                    Payout for cycle {currentCycle} has been completed
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Members List */}
          <div className="bg-white dark:bg-zinc-800 rounded-2xl border border-gray-100 dark:border-zinc-700 shadow-sm">
            <div className="px-6 py-4 border-b border-gray-50 dark:border-zinc-700 flex items-center gap-2.5">
              <Users size={16} className="text-emerald-600 dark:text-emerald-400" />
              <h3 className="font-semibold text-gray-900 dark:text-white">
                Members ({group.currentMembers}/{group.maxMembers})
              </h3>
            </div>
            <div className="p-4">
              {group.status === "PENDING" && (
                <div className="bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-xl p-3 mb-4">
                  <p className="text-amber-700 dark:text-amber-400 text-sm">
                    Waiting for {group.maxMembers - group.currentMembers} more member
                    {group.maxMembers - group.currentMembers !== 1 ? "s" : ""} to join before the group becomes active.
                  </p>
                </div>
              )}
              <div className="space-y-2">
                {group.members?.map((member) => {
                  const contribution = progress?.contributions?.find(
                    (c) => c.userId === member.user?.id
                  );
                  return (
                    <div
                      key={member.id}
                      className="flex items-center justify-between p-3 rounded-xl border border-gray-50 dark:border-zinc-700 hover:bg-gray-50 dark:hover:bg-zinc-700/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 dark:from-zinc-700 dark:to-zinc-600 flex items-center justify-center text-gray-600 dark:text-zinc-300 font-semibold text-sm">
                          {member.user?.firstName?.[0]}{member.user?.lastName?.[0]}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {member.user?.firstName} {member.user?.lastName}
                            {member.user?.id === user?.id && (
                              <span className="ml-2 text-xs bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 px-2 py-0.5 rounded-full font-medium">
                                You
                              </span>
                            )}
                          </p>
                          <p className="text-xs text-gray-400 dark:text-zinc-500">
                            Payout position #{member.payoutPosition}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {contribution && (
                          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${statusBadge[contribution.status]}`}>
                            {contribution.status}
                          </span>
                        )}
                        <Badge variant="outline" className="text-xs text-gray-400 dark:text-zinc-500 dark:border-zinc-600">
                          {member.status}
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Contribution History (past cycles) */}
          {pastCycles.length > 0 && (
            <div className="bg-white dark:bg-zinc-800 rounded-2xl border border-gray-100 dark:border-zinc-700 shadow-sm">
              <button
                onClick={() => setShowHistory(!showHistory)}
                className="w-full flex items-center justify-between px-6 py-4 border-b border-gray-50 dark:border-zinc-700 hover:bg-gray-50 dark:hover:bg-zinc-700/50 transition-colors rounded-t-2xl"
              >
                <div className="flex items-center gap-2.5">
                  <History size={16} className="text-gray-400 dark:text-zinc-500" />
                  <h3 className="font-semibold text-gray-900 dark:text-white">Contribution History</h3>
                  <span className="text-xs bg-gray-100 dark:bg-zinc-700 text-gray-500 dark:text-zinc-400 px-2 py-0.5 rounded-full font-medium">
                    {pastCycles.length} cycle{pastCycles.length !== 1 ? "s" : ""}
                  </span>
                </div>
                {showHistory ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
              </button>
              {showHistory && (
                <div className="p-4 space-y-4">
                  {pastCycles.map(({ cycle, contribs }) => {
                    const paidCount = contribs.filter((c) => c.status === "PAID").length;
                    return (
                      <div key={cycle}>
                        <div className="flex items-center justify-between mb-2 px-1">
                          <p className="text-sm font-semibold text-gray-700 dark:text-zinc-300">Cycle {cycle}</p>
                          <span className="text-xs text-gray-400 dark:text-zinc-500">{paidCount}/{contribs.length} paid</span>
                        </div>
                        <div className="space-y-1.5">
                          {contribs.map((c) => {
                            const member = group.members?.find((m) => m.user?.id === c.userId);
                            return (
                              <div key={c.id} className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-gray-50 dark:bg-zinc-700/50">
                                <div className="flex items-center gap-2.5">
                                  <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 dark:from-zinc-600 dark:to-zinc-500 flex items-center justify-center text-gray-500 dark:text-zinc-400 font-semibold text-xs">
                                    {member?.user?.firstName?.[0]}{member?.user?.lastName?.[0]}
                                  </div>
                                  <p className="text-sm text-gray-700 dark:text-zinc-300">
                                    {member?.user?.firstName} {member?.user?.lastName}
                                    {c.userId === user?.id && <span className="ml-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-medium">(You)</span>}
                                  </p>
                                </div>
                                <div className="flex items-center gap-3">
                                  <span className="text-sm font-semibold text-gray-900 dark:text-white tabular-nums">
                                    ₦{c.amount.toLocaleString()}
                                  </span>
                                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${statusBadge[c.status]}`}>
                                    {c.status}
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Activity Feed */}
          {(group.members?.length || allContributions.length || groupPayouts.length) ? (
            <div className="bg-white dark:bg-zinc-800 rounded-2xl border border-gray-100 dark:border-zinc-700 shadow-sm">
              <button
                onClick={() => setShowActivity(!showActivity)}
                className="w-full flex items-center justify-between px-6 py-4 border-b border-gray-50 dark:border-zinc-700 hover:bg-gray-50 dark:hover:bg-zinc-700/50 transition-colors rounded-t-2xl"
              >
                <div className="flex items-center gap-2.5">
                  <Activity size={16} className="text-gray-400 dark:text-zinc-500" />
                  <h3 className="font-semibold text-gray-900 dark:text-white">Activity</h3>
                </div>
                {showActivity ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
              </button>
              {showActivity && (
                <div className="p-4">
                  <ol className="relative border-l border-gray-100 dark:border-zinc-700 ml-3 space-y-5">
                    {/* Payouts */}
                    {[...groupPayouts]
                      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                      .map((p) => (
                        <li key={`payout-${p.id}`} className="ml-5">
                          <span className="absolute -left-2.5 flex items-center justify-center w-5 h-5 rounded-full bg-violet-50 dark:bg-violet-500/10 ring-4 ring-white dark:ring-zinc-800">
                            <Trophy size={9} className="text-violet-600 dark:text-violet-400" />
                          </span>
                          <p className="text-sm font-medium text-gray-900 dark:text-white leading-tight">
                            Cycle {p.cycleNumber} payout — {p.recipient?.firstName} {p.recipient?.lastName}
                          </p>
                          <p className="text-xs text-gray-400 dark:text-zinc-500 mt-0.5">
                            ₦{p.amount?.toLocaleString()} · {new Date(p.createdAt).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" })}
                          </p>
                        </li>
                      ))}
                    {/* Contributions (paid only, latest 10) */}
                    {[...allContributions]
                      .filter((c) => c.status === "PAID")
                      .sort((a, b) => new Date(b.paidAt || b.createdAt).getTime() - new Date(a.paidAt || a.createdAt).getTime())
                      .slice(0, 10)
                      .map((c) => {
                        const member = group.members?.find((m) => m.user?.id === c.userId);
                        return (
                          <li key={`contrib-${c.id}`} className="ml-5">
                            <span className="absolute -left-2.5 flex items-center justify-center w-5 h-5 rounded-full bg-emerald-50 dark:bg-emerald-500/10 ring-4 ring-white dark:ring-zinc-800">
                              <Banknote size={9} className="text-emerald-600 dark:text-emerald-400" />
                            </span>
                            <p className="text-sm font-medium text-gray-900 dark:text-white leading-tight">
                              {member?.user?.firstName ?? "A member"} paid Cycle {c.cycleNumber}
                            </p>
                            <p className="text-xs text-gray-400 dark:text-zinc-500 mt-0.5">
                              ₦{c.amount.toLocaleString()} · {new Date(c.paidAt || c.createdAt).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" })}
                            </p>
                          </li>
                        );
                      })}
                    {/* Members joined */}
                    {[...(group.members ?? [])]
                      .sort((a, b) => new Date(b.joinedAt).getTime() - new Date(a.joinedAt).getTime())
                      .map((m) => (
                        <li key={`member-${m.id}`} className="ml-5">
                          <span className="absolute -left-2.5 flex items-center justify-center w-5 h-5 rounded-full bg-sky-50 dark:bg-sky-500/10 ring-4 ring-white dark:ring-zinc-800">
                            <UserCheck size={9} className="text-sky-600 dark:text-sky-400" />
                          </span>
                          <p className="text-sm font-medium text-gray-900 dark:text-white leading-tight">
                            {m.user?.firstName} {m.user?.lastName} joined
                          </p>
                          <p className="text-xs text-gray-400 dark:text-zinc-500 mt-0.5">
                            {new Date(m.joinedAt).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" })}
                          </p>
                        </li>
                      ))}
                  </ol>
                </div>
              )}
            </div>
          ) : null}

          {/* Payout History */}
          {groupPayouts.length > 0 && (
            <div className="bg-white dark:bg-zinc-800 rounded-2xl border border-gray-100 dark:border-zinc-700 shadow-sm">
              <div className="px-6 py-4 border-b border-gray-50 dark:border-zinc-700 flex items-center gap-2.5">
                <Trophy size={16} className="text-violet-600 dark:text-violet-400" />
                <h3 className="font-semibold text-gray-900 dark:text-white">Payout History</h3>
              </div>
              <div className="p-4 space-y-2">
                {groupPayouts.map((payout) => (
                  <div
                    key={payout.id}
                    className="flex items-center justify-between px-3 py-3 rounded-xl border border-gray-50 dark:border-zinc-700 hover:bg-gray-50 dark:hover:bg-zinc-700/50 transition-colors"
                  >
                    <div>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">
                        Cycle {payout.cycleNumber}
                      </p>
                      <p className="text-xs text-gray-400 dark:text-zinc-500 mt-0.5">
                        Recipient: {payout.recipient?.firstName} {payout.recipient?.lastName}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
                        ₦{payout.amount?.toLocaleString()}
                      </p>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${statusBadge[payout.status]}`}>
                        {payout.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>

      {showInviteModal && (
        <InviteMemberModal
          groupId={Number(id)}
          groupName={group.name}
          onClose={() => setShowInviteModal(false)}
        />
      )}
    </div>
  );
}
