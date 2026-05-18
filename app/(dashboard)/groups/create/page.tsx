"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { groupsAPI } from "@/lib/api";
import TopBar from "@/components/shared/TopBar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Sparkles } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

const createGroupSchema = z.object({
  name: z.string().min(3, "Group name must be at least 3 characters"),
  description: z.string().optional(),
  contributionAmount: z
    .string()
    .min(1, "Enter an amount")
    .refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
      message: "Enter a valid amount greater than 0",
    }),
  cycleType: z.enum(["DAILY", "WEEKLY", "MONTHLY"]),
  maxMembers: z
    .string()
    .min(1, "Enter number of members")
    .refine((val) => !isNaN(Number(val)) && Number(val) >= 2, {
      message: "Must have at least 2 members",
    }),
});

type CreateGroupForm = z.infer<typeof createGroupSchema>;

const inputClass = (hasError?: boolean) =>
  `h-11 rounded-xl border-gray-200 dark:border-zinc-600 bg-gray-50 dark:bg-zinc-700 dark:text-white focus:bg-white dark:focus:bg-zinc-600 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 transition-all text-sm ${hasError ? "border-red-400 bg-red-50 dark:bg-red-500/10" : ""}`;

export default function CreateGroupPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<CreateGroupForm>({
    resolver: zodResolver(createGroupSchema),
    defaultValues: { cycleType: "MONTHLY" },
  });

  const amount = watch("contributionAmount");
  const members = watch("maxMembers");
  const potSize =
    !isNaN(Number(amount)) && !isNaN(Number(members))
      ? Number(amount) * Number(members)
      : 0;

  const onSubmit = async (data: CreateGroupForm) => {
    setLoading(true);
    try {
      const payload = {
        name: data.name,
        description: data.description || "",
        contributionAmount: Number(data.contributionAmount),
        cycleType: data.cycleType,
        maxMembers: Number(data.maxMembers),
      };
      await groupsAPI.create(payload);
      toast.success("Group created successfully!");
      router.push("/groups");
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || "Failed to create group. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <TopBar title="Create Group" />

      <div className="flex-1 p-5 lg:p-8 overflow-y-auto">
        <div className="max-w-lg">
          <Link
            href="/groups"
            className="inline-flex items-center gap-1.5 text-sm text-gray-500 dark:text-zinc-400 hover:text-gray-700 dark:hover:text-zinc-200 transition-colors mb-6"
          >
            <ArrowLeft size={15} />
            Back to Groups
          </Link>

          <div className="bg-white dark:bg-zinc-800 rounded-2xl border border-gray-100 dark:border-zinc-700 shadow-sm overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-emerald-400 to-emerald-600" />
            <div className="px-6 py-5 border-b border-gray-50 dark:border-zinc-700">
              <h2 className="font-semibold text-gray-900 dark:text-white">New Savings Group</h2>
              <p className="text-xs text-gray-400 dark:text-zinc-500 mt-0.5">Fill in the details to create your circle</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-5">

              {/* Group Name */}
              <div className="space-y-1.5">
                <Label htmlFor="name" className="text-sm font-medium text-gray-700 dark:text-zinc-300">Group name</Label>
                <Input
                  id="name"
                  placeholder="e.g. Family Ajo Circle"
                  {...register("name")}
                  className={inputClass(!!errors.name)}
                />
                {errors.name && <p className="text-red-500 text-xs">{errors.name.message}</p>}
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <Label htmlFor="description" className="text-sm font-medium text-gray-700 dark:text-zinc-300">
                  Description <span className="text-gray-400 dark:text-zinc-500 font-normal">(optional)</span>
                </Label>
                <Input
                  id="description"
                  placeholder="Brief description of the group"
                  {...register("description")}
                  className={inputClass()}
                />
              </div>

              {/* Amount + Cycle */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="contributionAmount" className="text-sm font-medium text-gray-700 dark:text-zinc-300">
                    Amount (₦)
                  </Label>
                  <Input
                    id="contributionAmount"
                    type="number"
                    placeholder="e.g. 10000"
                    {...register("contributionAmount")}
                    className={inputClass(!!errors.contributionAmount)}
                  />
                  {errors.contributionAmount && (
                    <p className="text-red-500 text-xs">{errors.contributionAmount.message}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="cycleType" className="text-sm font-medium text-gray-700 dark:text-zinc-300">Cycle type</Label>
                  <select
                    id="cycleType"
                    {...register("cycleType")}
                    className="w-full h-11 px-3 rounded-xl border border-gray-200 dark:border-zinc-600 text-sm bg-gray-50 dark:bg-zinc-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 transition-all"
                  >
                    <option value="DAILY">Daily</option>
                    <option value="WEEKLY">Weekly</option>
                    <option value="MONTHLY">Monthly</option>
                  </select>
                </div>
              </div>

              {/* Max Members */}
              <div className="space-y-1.5">
                <Label htmlFor="maxMembers" className="text-sm font-medium text-gray-700 dark:text-zinc-300">Number of members</Label>
                <Input
                  id="maxMembers"
                  type="number"
                  placeholder="e.g. 6"
                  min={2}
                  {...register("maxMembers")}
                  className={inputClass(!!errors.maxMembers)}
                />
                {errors.maxMembers && (
                  <p className="text-red-500 text-xs">{errors.maxMembers.message}</p>
                )}
              </div>

              {/* Pot Size Preview */}
              {potSize > 0 && (
                <div className="flex items-center gap-3 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 rounded-xl p-4">
                  <Sparkles size={16} className="text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                  <p className="text-sm text-emerald-700 dark:text-emerald-300">
                    Each member receives{" "}
                    <span className="font-bold text-emerald-800 dark:text-emerald-200">
                      ₦{potSize.toLocaleString()}
                    </span>{" "}
                    when it&apos;s their turn
                  </p>
                </div>
              )}

              <Button
                type="submit"
                className="w-full h-11 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-sm shadow-emerald-200 dark:shadow-emerald-900/40 transition-all"
                disabled={loading}
              >
                {loading ? "Creating..." : "Create Group"}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
