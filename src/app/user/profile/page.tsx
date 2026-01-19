'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api-client';
import { ImageUploader } from '@/components/AdminUI/ui/ImageUploader';
import {
  LogOut, Edit2, X, MapPin, Shield, User, Smartphone,
  Mail, Lock, ChevronRight, Bell, Ticket, Loader2, Wallet, Gift, IdCard, Landmark
} from 'lucide-react';
import {
  BentoCard, ProfileInput, ActionButton, IconButton
} from '@/components/LandingUI/ProfilePrimitives';
import StatsGrid from '@/components/LandingUI/User/Profile/StatsGrid';
import { getImageUrl } from '@/lib/image-helper';

interface UpdateProfilePayload {
  name: string;
  email: string;
  mobile: string;
  avatar: string | null;
  currentPassword?: string;
  newPassword?: string;
  [key: string]: unknown;
}

// --- Types ---
interface ProfileData {
  user: {
    id: string;
    name: string;
    email: string | null;
    mobile: string;
    role: string;
    avatar: string | null;
    createdAt: string;
    adharcard: string;
    pancard: string;
    address: string;
    wallet: number;
    referralCode: string;
  };
  stats: {
    totalTickets: number;
    winningTickets: number;
    unreadNotifications: number;
  };
}

interface PageApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// --- Main Page Component ---

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: '',
    avatar: '',
    currentPassword: '',
    newPassword: '',
    adharcard: '',
    pancard: '',
    address: ''
  });

  // --- 1. Fetch Data ---
  useEffect(() => {
    let isMounted = true;
    async function fetchProfile() {
      try {
        const response = await api.get('/user/profile') as unknown as PageApiResponse<ProfileData>;
        if (isMounted) {
          if (response.success && response.data) {
            setProfile(response.data);
            setFormData({
              name: response.data.user.name || '',
              email: response.data.user.email || '',
              mobile: response.data.user.mobile || '',
              avatar: response.data.user.avatar || '',
              currentPassword: '',
              newPassword: '',
              adharcard: response.data.user.adharcard || '',
              pancard: response.data.user.pancard || '',
              address: response.data.user.address || '',
            });
          } else {
            // Handle Unauthorized
            router.push('/signin');
          }
        }
      } catch (e) {
        console.error(e);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    fetchProfile();
    return () => { isMounted = false; };
  }, [router]);

  // --- 2. Update Logic ---
  async function handleUpdateProfile(e: React.FormEvent) {
    e.preventDefault();
    setIsSaving(true);

    const payload: UpdateProfilePayload = {
      name: formData.name,
      adharcard: formData.adharcard,
      pancard: formData.pancard,
      address: formData.address,
      email: formData.email,
      mobile: formData.mobile,
      avatar: formData.avatar || null
    };

    if (formData.newPassword) {
      payload.currentPassword = formData.currentPassword;
      payload.newPassword = formData.newPassword;
    }

    try {
      const res = await api.patch('/user/profile', payload) as unknown as PageApiResponse<ProfileData>;

      if (res.success && res.data) {
        setIsEditing(false);
        // Optimistic update
        setProfile(prev => prev ? ({ ...prev, user: { ...prev.user, ...res.data?.user } }) : null);
        setFormData(prev => ({ ...prev, currentPassword: '', newPassword: '' }));
      } else {
        alert(res.message || "Failed to update");
      }
    } catch (e) {
      alert("Server error");
    }
    setIsSaving(false);
  }

  // --- 3. Logout Logic ---
  async function handleLogout() {
    if (!confirm("Are you sure you want to logout?")) return;
    await api.post('/auth/logout');
    router.push('/signin');
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#0B0E14]">
        <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
      </div>
    );
  }

  if (!profile) return null;

  const winRate = profile.stats?.totalTickets > 0
    ? ((profile.stats.winningTickets / profile.stats.totalTickets) * 100).toFixed(0)
    : '0';

  return (
    <div className="min-h-screen bg-[#F5F5F7] dark:bg-[#0B0E14] transition-colors duration-300 pb-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">

        {/* --- Page Header --- */}
        <div className="flex flex-row justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white tracking-tight">
              My Profile
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Manage your personal account
            </p>
          </div>
          <div className="flex gap-2">
            <IconButton
              icon={isEditing ? X : Edit2}
              active={isEditing}
              onClick={() => setIsEditing(!isEditing)}
            />
            <IconButton
              icon={LogOut}
              variant="danger"
              onClick={handleLogout}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* --- LEFT COLUMN: Identity Card --- */}
          <div className="lg:col-span-4">
            <BentoCard className="sticky top-24 flex flex-col items-center text-center">
              <div className="relative mb-6">
                {/* Avatar Ring */}
                <div className="absolute -inset-1 bg-gradient-to-tr from-purple-500 to-pink-500 rounded-full opacity-70 blur-sm" />
                <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-white dark:border-[#151925] bg-gray-100 dark:bg-[#0B0E14]">
                  <img
                    src={getImageUrl(profile.user?.avatar)}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                {profile.user?.name}
              </h2>
              <div className="flex items-center gap-2 mb-6">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-300 border border-purple-200 dark:border-purple-500/20">
                  {profile.user?.role}
                </span>
                <span className="text-xs text-gray-400 font-mono">
                  #{profile.user?.id?.slice(-5).toUpperCase()}
                </span>
              </div>

              {/* Badges */}
              <div className="grid grid-cols-2 gap-3 w-full">
                <div className="flex items-center justify-center gap-2 py-3 rounded-2xl bg-gray-50 dark:bg-[#0B0E14] text-xs font-bold text-gray-600 dark:text-gray-300">
                  <Shield size={14} className="text-emerald-500" />
                  Verified
                </div>
                <div className="flex items-center justify-center gap-2 py-3 rounded-2xl bg-gray-50 dark:bg-[#0B0E14] text-xs font-bold text-gray-600 dark:text-gray-300">
                  <MapPin size={14} className="text-blue-500" />
                  India
                </div>
              </div>
            </BentoCard>
          </div>

          {/* --- RIGHT COLUMN: Content --- */}
          <div className="lg:col-span-8">
            {isEditing ? (
              /* --- EDIT FORM --- */
              <BentoCard className="animate-in fade-in slide-in-from-bottom-4">
                <div className="flex items-center gap-4 mb-8 pb-6 border-b border-gray-100 dark:border-white/5">
                  <div className="p-3 rounded-xl bg-purple-100 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400">
                    <Edit2 size={20} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">Edit Details</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Update your information securely.</p>
                  </div>
                </div>

                <form onSubmit={handleUpdateProfile} className="space-y-6">
                  <div className="flex justify-center mb-6">
                    <div className="relative group w-full max-w-xs">
                      <ImageUploader
                        value={formData.avatar}
                        onChange={(path: string) => setFormData({ ...formData, avatar: path })}
                        folder="avatars"
                        label="Profile Picture"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <ProfileInput
                      label="Full Name" icon={User}
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                    <ProfileInput
                      label="Mobile Number" icon={Smartphone}
                      value={formData.mobile}
                      onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                    />
                  </div>
                  <ProfileInput
                    label="Email Address" icon={Mail}
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <ProfileInput
                      label="Adhar Card No" icon={IdCard}
                      value={formData.adharcard}
                      onChange={(e) => setFormData({ ...formData, adharcard: e.target.value })}
                    />
                    <ProfileInput
                      label="Pan Card Np" icon={IdCard}
                      value={formData.pancard}
                      onChange={(e) => setFormData({ ...formData, pancard: e.target.value })}
                    />
                  </div>
                  <ProfileInput
                    label="Address" icon={Landmark}
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  />


                  <div className="bg-gray-50 dark:bg-[#0B0E14] p-5 rounded-2xl border border-gray-100 dark:border-white/5 mt-6">
                    <h4 className="text-xs font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                      <Shield size={14} className="text-orange-500" /> Security Change (Optional)
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <ProfileInput
                        type="password" label="New Password" icon={Lock} placeholder="••••••••"
                        value={formData.newPassword}
                        onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                      />
                      <div className={!formData.newPassword ? 'opacity-50 pointer-events-none' : ''}>
                        <ProfileInput
                          type="password" label="Current Password" icon={Lock} placeholder="Confirm"
                          value={formData.currentPassword}
                          onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-4">
                    <ActionButton type="button" variant="secondary" onClick={() => setIsEditing(false)}>
                      Cancel
                    </ActionButton>
                    <ActionButton type="submit" loading={isSaving}>
                      Save Changes
                    </ActionButton>
                  </div>
                </form>
              </BentoCard>
            ) : (
              /* --- VIEW MODE --- */
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                {/* Stats */}
                <StatsGrid
                  tickets={profile.stats?.totalTickets ?? 0}
                  wins={profile.stats?.winningTickets ?? 0}
                  winRate={winRate}
                />
                {/* WALLET + REFERRAL */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <BentoCard>
                    <Wallet className="mb-2 text-emerald-500" />
                    <p className="text-sm text-gray-500">Wallet Balance</p>
                    <p className="text-2xl font-black">₹{profile.user.wallet}</p>
                  </BentoCard>

                  <BentoCard>
                    <Gift className="mb-2 text-purple-500" />
                    <p className="text-sm text-gray-500">Referral Code</p>
                    <div className="flex gap-2 items-center">
                      <span className="font-mono font-bold">{profile.user.referralCode}</span>
                      <button
                        onClick={() =>
                          navigator.clipboard.writeText(
                            `${window.location.origin}/signup?ref=${profile.user.referralCode}`
                          )
                        }
                        className="text-xs text-gray-400"
                      >
                        COPY
                      </button>
                    </div>
                  </BentoCard>
                </div>
               
                {/* Navigation Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* My Tickets Card */}
                  <BentoCard
                    onClick={() => router.push('/user/tickets')}
                    className="group relative h-40 flex flex-col justify-between overflow-hidden !p-6 cursor-pointer"
                  >
                    <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                      <Ticket size={64} className="text-purple-500" />
                    </div>

                    <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-4">
                      <Ticket size={20} />
                    </div>

                    <div>
                      <div className="flex justify-between items-center">
                        <h3 className="text-base font-bold text-gray-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                          My Tickets
                        </h3>
                        <ChevronRight size={16} className="text-gray-400 group-hover:translate-x-1 transition-transform" />
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        View active draws & history
                      </p>
                    </div>
                  </BentoCard>

                  {/* Notifications Card */}
                  <BentoCard
                    onClick={() => router.push('/user/notifications')}
                    className="group relative h-40 flex flex-col justify-between overflow-hidden !p-6 cursor-pointer"
                  >
                    <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                      <Bell size={64} className="text-blue-500" />
                    </div>

                    <div className="relative w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-4">
                      <Bell size={20} />
                      {(profile.stats?.unreadNotifications ?? 0) > 0 && (
                        <span className="absolute -top-1 -right-1 flex h-3 w-3">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500 border-2 border-white dark:border-[#151925]"></span>
                        </span>
                      )}
                    </div>

                    <div>
                      <div className="flex justify-between items-center">
                        <h3 className="text-base font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          Notifications
                        </h3>
                        {(profile.stats?.unreadNotifications ?? 0) > 0 && (
                          <span className="bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 text-[10px] font-bold px-2 py-0.5 rounded-full">
                            {profile.stats?.unreadNotifications} New
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Updates on your wins
                      </p>
                    </div>
                  </BentoCard>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}