"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Save, User, Lock, Mail, Phone, Loader2 } from "lucide-react";
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

export default function ProfileForm({ user }: ProfileFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [formData, setFormData] = useState({
    name: user.name || "",
    email: user.email || "",
    mobile: user.mobile || "",
    avatar: user.avatar || null,
  });

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

  const handleSubmit = async () => {
    setMessage(null);
    setLoading(true);

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

    if (passwords.newPassword && passwords.newPassword.length < 8) {
      setMessage({ type: 'error', text: "New password must be at least 8 characters long" });
      setLoading(false);
      return;
    }

    if (!formData.name.trim()) {
      setMessage({ type: 'error', text: "Name is required" });
      setLoading(false);
      return;
    }

    if (!formData.email.trim()) {
      setMessage({ type: 'error', text: "Email is required" });
      setLoading(false);
      return;
    }

    try {
      const payload: ProfileUpdatePayload = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        mobile: formData.mobile.trim(),
        avatar: formData.avatar,
      };

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
      setPasswords({ currentPassword: "", newPassword: "", confirmPassword: "" });
      
      setTimeout(() => {
        router.refresh();
      }, 500);

    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "An error occurred";
      setMessage({ type: 'error', text: msg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      {/* Sticky Header - Full Width, No Top Margin */}
      <div className="sticky top-0 bg-white dark:bg-zinc-950 z-20 border-b border-zinc-200 dark:border-zinc-800">
        <div className="w-full px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex-1">
            <h1 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-zinc-50">My Profile</h1>
            <p className="text-sm text-zinc-500 mt-1">Manage your account settings and preferences.</p>
          </div>
          <Button 
            onClick={handleSubmit}
            disabled={loading}
            className="w-full sm:w-auto"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Content Area */}
      <div className="w-full px-4 sm:px-6 lg:px-8 py-6 space-y-6 pb-20">
        
        {/* Messages */}
        {message && (
          <div 
            className={`w-full p-4 rounded-lg text-sm font-medium border animate-in fade-in slide-in-from-top-2 duration-300 ${
              message.type === 'success' 
                ? "bg-green-50 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800" 
                : "bg-red-50 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800"
            }`}
            role="alert"
          >
            {message.text}
          </div>
        )}

       
        {/* Main Content Grid */}
        <div className="w-full grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Personal Information - 2/3 width on large screens */}
          <div className="lg:col-span-2">
            <Card title="Personal Information">
              <div className="space-y-6">
                <div className="flex flex-col md:flex-row gap-6">
                  
                  {/* Avatar Section */}
                  <div className="w-full md:w-1/3">
                    <ImageUploader 
                      label="Profile Avatar"
                      folder="avatars"
                      value={formData.avatar}
                      onChange={(url) => handleChange("avatar", url)}
                    />
                    <p className="text-xs text-zinc-500 mt-2 text-center">
                      JPG, PNG or GIF. Max 2MB.
                    </p>
                  </div>

                  {/* Form Fields */}
                  <div className="w-full md:w-2/3 space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                        Full Name <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                        <Input 
                          className="pl-10 w-full"
                          placeholder="Enter your full name"
                          value={formData.name}
                          onChange={(e) => handleChange("name", e.target.value)}
                          required
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                        Email Address <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                        <Input 
                          className="pl-10 w-full"
                          type="email"
                          placeholder="your.email@example.com"
                          value={formData.email}
                          onChange={(e) => handleChange("email", e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                        Mobile Number
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                        <Input 
                          className="pl-10 w-full"
                          type="tel"
                          placeholder="+1 (555) 000-0000"
                          value={formData.mobile}
                          onChange={(e) => handleChange("mobile", e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Security Section - 1/3 width on large screens */}
          <div className="lg:col-span-1">
            <Card title="Security">
              <div className="space-y-4">
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <p className="text-xs text-blue-700 dark:text-blue-300 leading-relaxed">
                    💡 Leave password fields blank if you don't want to change your password.
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                    Current Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                    <Input 
                      className="pl-10 w-full"
                      type="password"
                      placeholder="Enter current password"
                      value={passwords.currentPassword}
                      onChange={(e) => handlePasswordChange("currentPassword", e.target.value)}
                      autoComplete="current-password"
                    />
                  </div>
                </div>

                <div className="pt-3 border-t border-zinc-200 dark:border-zinc-800 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                      New Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                      <Input 
                        className="pl-10 w-full"
                        type="password"
                        placeholder="Enter new password"
                        value={passwords.newPassword}
                        onChange={(e) => handlePasswordChange("newPassword", e.target.value)}
                        autoComplete="new-password"
                      />
                    </div>
                    {passwords.newPassword && passwords.newPassword.length < 8 && (
                      <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                        Password must be at least 8 characters
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                      Confirm New Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                      <Input 
                        className="pl-10 w-full"
                        type="password"
                        placeholder="Confirm new password"
                        value={passwords.confirmPassword}
                        onChange={(e) => handlePasswordChange("confirmPassword", e.target.value)}
                        autoComplete="new-password"
                      />
                    </div>
                    {passwords.confirmPassword && passwords.newPassword !== passwords.confirmPassword && (
                      <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                        Passwords do not match
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Mobile Save Button */}
        <div className="lg:hidden w-full pt-4">
          <Button 
            onClick={handleSubmit}
            disabled={loading}
            className="w-full py-3"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving Changes...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}