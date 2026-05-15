"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuthStore } from "@/store/authStore";
import TopBar from "@/components/shared/TopBar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Mail, Phone, Shield, Check } from "lucide-react";

const profileSchema = z.object({
  firstName: z.string().min(2, "First name is required"),
  lastName: z.string().min(2, "Last name is required"),
  phoneNumber: z
    .string()
    .min(10, "Enter a valid phone number")
    .regex(/^[0-9+\-\s]+$/, "Enter a valid phone number"),
});

type ProfileForm = z.infer<typeof profileSchema>;

export default function ProfilePage() {
  const { user } = useAuthStore();
  const [editMode, setEditMode] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      phoneNumber: user?.phoneNumber || "",
    },
  });

  const onSubmit = async (data: ProfileForm) => {
    // Profile update endpoint not in backend yet
    // For now we just show success and update local display
    console.log("Profile update:", data);
    setSaveSuccess(true);
    setEditMode(false);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleCancel = () => {
    reset({
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      phoneNumber: user?.phoneNumber || "",
    });
    setEditMode(false);
  };

  return (
    <div className="flex flex-col flex-1">
      <TopBar title="Profile" />

      <div className="flex-1 p-6 space-y-6 max-w-2xl">
        {/* Success Message */}
        {saveSuccess && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-lg text-sm flex items-center gap-2">
            <Check size={16} />
            Profile updated successfully
          </div>
        )}

        {/* Avatar + Name */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-5">
              <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-2xl">
                {user?.firstName?.[0]}
                {user?.lastName?.[0]}
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  {user?.firstName} {user?.lastName}
                </h2>
                <p className="text-gray-400 text-sm">{user?.email}</p>
                <span
                  className={`inline-flex items-center gap-1 mt-2 text-xs font-medium px-2.5 py-1 rounded-full ${
                    user?.role === "ADMIN"
                      ? "bg-purple-100 text-purple-700"
                      : "bg-emerald-100 text-emerald-700"
                  }`}
                >
                  <Shield size={11} />
                  {user?.role}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Account Details */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <CardTitle className="text-base">Account Details</CardTitle>
            {!editMode && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setEditMode(true)}
                className="text-emerald-600 border-emerald-600 hover:bg-emerald-50"
              >
                Edit
              </Button>
            )}
          </CardHeader>
          <CardContent>
            {!editMode ? (
              // View Mode
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                  <User size={18} className="text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-400">Full Name</p>
                    <p className="text-sm font-medium text-gray-900">
                      {user?.firstName} {user?.lastName}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                  <Mail size={18} className="text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-400">Email Address</p>
                    <p className="text-sm font-medium text-gray-900">
                      {user?.email}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                  <Phone size={18} className="text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-400">Phone Number</p>
                    <p className="text-sm font-medium text-gray-900">
                      {user?.phoneNumber || "Not provided"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                  <Shield size={18} className="text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-400">Account Role</p>
                    <p className="text-sm font-medium text-gray-900 capitalize">
                      {user?.role?.toLowerCase()}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              // Edit Mode
              <form
                onSubmit={handleSubmit(onSubmit)}
                className="space-y-4"
              >
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      {...register("firstName")}
                      className={errors.firstName ? "border-red-400" : ""}
                    />
                    {errors.firstName && (
                      <p className="text-red-500 text-xs">
                        {errors.firstName.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      {...register("lastName")}
                      className={errors.lastName ? "border-red-400" : ""}
                    />
                    {errors.lastName && (
                      <p className="text-red-500 text-xs">
                        {errors.lastName.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-1">
                  <Label htmlFor="phoneNumber">Phone Number</Label>
                  <Input
                    id="phoneNumber"
                    {...register("phoneNumber")}
                    className={errors.phoneNumber ? "border-red-400" : ""}
                  />
                  {errors.phoneNumber && (
                    <p className="text-red-500 text-xs">
                      {errors.phoneNumber.message}
                    </p>
                  )}
                </div>

                {/* Email is read-only */}
                <div className="space-y-1">
                  <Label>Email Address</Label>
                  <Input
                    value={user?.email || ""}
                    disabled
                    className="bg-gray-50 text-gray-400 cursor-not-allowed"
                  />
                  <p className="text-xs text-gray-400">
                    Email cannot be changed
                  </p>
                </div>

                <div className="flex gap-3 pt-2">
                  <Button
                    type="submit"
                    className="bg-emerald-600 hover:bg-emerald-700 text-white"
                  >
                    Save Changes
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCancel}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>

        {/* Account Info */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-base">Account Info</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b border-gray-100">
              <p className="text-sm text-gray-500">Member since</p>
              <p className="text-sm font-medium text-gray-900">
                {user?.createdAt
                  ? new Date(user.createdAt).toLocaleDateString("en-NG", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })
                  : "—"}
              </p>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-gray-100">
              <p className="text-sm text-gray-500">Account status</p>
              <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700">
                Active
              </span>
            </div>
            <div className="flex items-center justify-between py-2">
              <p className="text-sm text-gray-500">User ID</p>
              <p className="text-sm font-mono text-gray-400">{user?.id}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}