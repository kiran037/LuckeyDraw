"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Save, User, Lock, Mail, Phone, Ticket, Trophy, Bell, Loader2 } from "lucide-react";
import { Button } from "@/components/AdminUI/ui/Button";
import { Input } from "@/components/AdminUI/ui/Input";
import { ImageUploader } from "@/components/AdminUI/ui/ImageUploader";
import { Card } from "@/components/AdminUI/ui/Card";

interface ProfileUpdatePayload {
  name: string;
  email: string;
  mobile: string;
  avatar: string | null;
  currentPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
}

// Types matching your API response
interface UserStats {
  totalTickets: number;
  winningTickets: number;
  unreadNotifications: number;
}

interface UserProfile {
  id: string;
  name: string;
  email: string;
  mobile: string;
  avatar: string | null;
  role: string;
}

interface ProfileFormProps {
  user: UserProfile;
  stats: UserStats;
}

export default function ProfileForm({ user, stats }: ProfileFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: user.name || "",
    email: user.email || "",
    mobile: user.mobile || "",
    avatar: user.avatar || null,
  });

  // Password State
  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handleChange = (field: string, value: string | null) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handlePasswordChange = (field: string, value: string) => {
    setPasswords((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setLoading(true);

    // Basic Validation
    if (passwords.newPassword && passwords.newPassword !== passwords.confirmPassword) {
      setMessage({ type: 'error', text: "New passwords do not match" });
      setLoading(false);
      return;
    }

    if (passwords.newPassword && !passwords.currentPassword) {
      setMessage({ type: 'error', text: "Current password is required to set a new password" });
      setLoading(false);
      return;
    }

    try {
    const payload: ProfileUpdatePayload = {
        name: formData.name,
        email: formData.email,
        mobile: formData.mobile,
        avatar: formData.avatar,
      };

      // Only add password fields if user is trying to change it
      if (passwords.newPassword) {
        payload.currentPassword = passwords.currentPassword;
        payload.newPassword = passwords.newPassword;
      }

      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Update failed");
      }

      setMessage({ type: 'success', text: "Profile updated successfully" });
      
      // Clear password fields on success
      setPasswords({ currentPassword: "", newPassword: "", confirmPassword: "" });
      router.refresh();

    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "An error occurred";
      setMessage({ type: 'error', text: msg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 pb-20">
      
      {/* Header & Actions */}
      <div className="flex items-center justify-between sticky top-0 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-sm z-10 py-4 border-b border-zinc-200 dark:border-zinc-800 -mx-6 px-6">
        <div>
          <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">My Profile</h1>
          <p className="text-xs text-zinc-500">Manage your account settings and preferences.</p>
        </div>
        <Button type="submit" disabled={loading}>
          {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
          Save Changes
        </Button>
      </div>

      {/* Messages */}
      {message && (
        <div className={`p-4 rounded-lg text-sm font-medium border ${
          message.type === 'success' 
            ? "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800" 
            : "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800"
        }`}>
          {message.text}
        </div>
      )}

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-zinc-900 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 flex items-center gap-4">
          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-blue-600 dark:text-blue-400">
            <Ticket className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-zinc-500">Total Tickets</p>
            <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">{stats.totalTickets}</p>
          </div>
        </div>
        <div className="bg-white dark:bg-zinc-900 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 flex items-center gap-4">
          <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg text-amber-600 dark:text-amber-400">
            <Trophy className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-zinc-500">Wins</p>
            <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">{stats.winningTickets}</p>
          </div>
        </div>
        <div className="bg-white dark:bg-zinc-900 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 flex items-center gap-4">
          <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg text-purple-600 dark:text-purple-400">
            <Bell className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-zinc-500">Notifications</p>
            <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">{stats.unreadNotifications}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Avatar & Personal Info */}
        <div className="lg:col-span-2 space-y-6">
          <Card title="Personal Information">
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row gap-6">
                <div className="w-full sm:w-1/3">
                  <ImageUploader 
                    label="Profile Avatar"
                    folder="avatars"
                    value={formData.avatar}
                    onChange={(url) => handleChange("avatar", url)}
                  />
                </div>
                <div className="w-full sm:w-2/3 space-y-4">
                  <div className="relative">
                    <User className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
                    <Input 
                      className="pl-9"
                      label="Full Name"
                      value={formData.name}
                      onChange={(e) => handleChange("name", e.target.value)}
                    />
                  </div>
                  
                  <div className="relative">
                    <Mail className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
                    <Input 
                      className="pl-9"
                      label="Email Address"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleChange("email", e.target.value)}
                    />
                  </div>

                  <div className="relative">
                    <Phone className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
                    <Input 
                      className="pl-9"
                      label="Mobile Number"
                      value={formData.mobile}
                      onChange={(e) => handleChange("mobile", e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column: Security */}
        <div className="space-y-6">
          <Card title="Security">
            <div className="space-y-4">
              <div className="p-3 bg-zinc-50 dark:bg-zinc-900/50 rounded-lg text-xs text-zinc-500 border border-zinc-100 dark:border-zinc-800">
                Leave these fields blank if you do not want to change your password.
              </div>
              
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
                <Input 
                  className="pl-9"
                  label="Current Password"
                  type="password"
                  value={passwords.currentPassword}
                  onChange={(e) => handlePasswordChange("currentPassword", e.target.value)}
                />
              </div>

              <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 space-y-4">
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
                  <Input 
                    className="pl-9"
                    label="New Password"
                    type="password"
                    value={passwords.newPassword}
                    onChange={(e) => handlePasswordChange("newPassword", e.target.value)}
                  />
                </div>

                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
                  <Input 
                    className="pl-9"
                    label="Confirm New Password"
                    type="password"
                    value={passwords.confirmPassword}
                    onChange={(e) => handlePasswordChange("confirmPassword", e.target.value)}
                  />
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </form>
  );
}