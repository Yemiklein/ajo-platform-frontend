"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { groupsAPI } from "@/lib/api";
import TopBar from "@/components/shared/TopBar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

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

export default function CreateGroupPage() {
  const router = useRouter();
  const [error, setError] = useState("");
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
    setError("");
    try {
      const payload = {
        name: data.name,
        description: data.description || "",
        contributionAmount: Number(data.contributionAmount),
        cycleType: data.cycleType,
        maxMembers: Number(data.maxMembers),
      };
      await groupsAPI.create(payload);
      router.push("/groups");
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || "Failed to create group. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col flex-1">
      <TopBar title="Create Group" />

      <div className="flex-1 p-6 max-w-2xl">
        <Link
          href="/groups"
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-6"
        >
          <ArrowLeft size={16} />
          Back to Groups
        </Link>

        <Card>
          <CardHeader>
            <CardTitle>New Savings Group</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              {/* Group Name */}
              <div className="space-y-1">
                <Label htmlFor="name">Group Name</Label>
                <Input
                  id="name"
                  placeholder="e.g. Family Ajo Circle"
                  {...register("name")}
                  className={errors.name ? "border-red-400" : ""}
                />
                {errors.name && (
                  <p className="text-red-500 text-xs">{errors.name.message}</p>
                )}
              </div>

              {/* Description */}
              <div className="space-y-1">
                <Label htmlFor="description">
                  Description{" "}
                  <span className="text-gray-400 font-normal">(optional)</span>
                </Label>
                <Input
                  id="description"
                  placeholder="Brief description of the group"
                  {...register("description")}
                />
              </div>

              {/* Amount + Cycle Row */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label htmlFor="contributionAmount">
                    Contribution Amount (₦)
                  </Label>
                  <Input
                    id="contributionAmount"
                    type="number"
                    placeholder="e.g. 10000"
                    {...register("contributionAmount")}
                    className={errors.contributionAmount ? "border-red-400" : ""}
                  />
                  {errors.contributionAmount && (
                    <p className="text-red-500 text-xs">
                      {errors.contributionAmount.message}
                    </p>
                  )}
                </div>

                <div className="space-y-1">
                  <Label htmlFor="cycleType">Cycle Type</Label>
                  <select
                    id="cycleType"
                    {...register("cycleType")}
                    className="w-full h-10 px-3 rounded-md border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                  >
                    <option value="DAILY">Daily</option>
                    <option value="WEEKLY">Weekly</option>
                    <option value="MONTHLY">Monthly</option>
                  </select>
                </div>
              </div>

              {/* Max Members */}
              <div className="space-y-1">
                <Label htmlFor="maxMembers">Number of Members</Label>
                <Input
                  id="maxMembers"
                  type="number"
                  placeholder="e.g. 6"
                  min={2}
                  {...register("maxMembers")}
                  className={errors.maxMembers ? "border-red-400" : ""}
                />
                {errors.maxMembers && (
                  <p className="text-red-500 text-xs">
                    {errors.maxMembers.message}
                  </p>
                )}
              </div>

              {/* Pot Size Preview */}
              {potSize > 0 && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                  <p className="text-sm text-emerald-700">
                    Each member receives{" "}
                    <span className="font-bold text-emerald-800 text-base">
                      ₦{potSize.toLocaleString()}
                    </span>{" "}
                    when it&apos;s their turn
                  </p>
                </div>
              )}

              <Button
                type="submit"
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
                disabled={loading}
              >
                {loading ? "Creating..." : "Create Group"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}