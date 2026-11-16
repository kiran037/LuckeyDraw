'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api-client';
import { ImageUploader } from '@/components/AdminUI/ui/ImageUploader';
import {
  LogOut, Edit2, X, User, Smartphone,
  Mail, Lock, ChevronRight, Bell, Ticket, Loader2, Wallet, Gift, IdCard, Landmark,
  ShieldCheck, CreditCard, Sparkles
} from 'lucide-react';
import {
  ProfileInput, ActionButton, IconButton
} from '@/components/LandingUI/ProfilePrimitives';
import StatsGrid from '@/components/LandingUI/User/Profile/StatsGrid';
import { getImageUrl } from '@/lib/image-helper';
import { formatCurrency } from '@/lib/utils';

interface UpdateProfilePayload {
  name: string;
  email: string;
  mobile: string;
  avatar: string | null;
  currentPassword?: string;
  newPassword?: string;
  [key: string]: unknown;
}

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

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

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

  useEffect(() => {
    let isMounted = true;
    async function fetchProfile() {
      try {
        const response = (await api.get('/user/profile')) as unknown as PageApiResponse<ProfileData>;
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
      const res = (await api.patch('/user/profile', payload)) as unknown as PageApiResponse<ProfileData>;

      if (res.success && res.data) {
        setIsEditing(false);
        setProfile((prev) => (prev ? { ...prev, user: { ...prev.user, ...res.data?.user } } : null));
        setFormData((prev) => ({ ...prev, currentPassword: '', newPassword: '' }));
      } else {
        alert(res.message || 'Failed to update profile');
      }
    } catch {
      alert('Server error while saving changes');
    }
    setIsSaving(false);
  }

  async function confirmLogout() {
    await api.post('/auth/logout');
    router.push('/signin');
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
          <Loader2 className="w-6 h-6 text-indigo-500 animate-spin" />
        </div>
        <p className="text-sm font-semibold text-slate-400">Loading user profile...</p>
      </div>
    );
  }

  if (!profile) return null;

  const winRate = profile.stats?.totalTickets > 0
    ? ((profile.stats.winningTickets / profile.stats.totalTickets) * 100).toFixed(0)
    : '0';

  const maskNumber = (str?: string) => {
    if (!str || str.length < 4) return 'Not Provided';
    return `•••• •••• ${str.slice(-4)}`;
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between pb-2 border-b border-white/5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Account & Security
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Manage your personal profile, cryptographic KYC & financial preferences
          </p>
        </div>
        <div className="flex items-center gap-2">
          <IconButton
            icon={isEditing ? X : Edit2}
            active={isEditing}
            onClick={() => setIsEditing(!isEditing)}
          />
          <IconButton
            icon={LogOut}
            variant="danger"
            onClick={() => setShowLogoutModal(true)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN: Identity Profile Card */}
        <div className="lg:col-span-4 space-y-4">
          <div className="rounded-3xl p-6 bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-white/10 flex flex-col items-center text-center shadow-xl">
            <div className="relative mb-5">
              <div className="w-28 h-28 rounded-full p-1 bg-gradient-to-tr from-indigo-500 via-purple-500 to-amber-500">
                <div className="relative w-full h-full rounded-full overflow-hidden bg-slate-900 border-2 border-slate-900">
                  <img
                    src={getImageUrl(profile.user?.avatar)}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>

            <h2 className="text-xl font-black text-slate-900 dark:text-white mb-1">
              {profile.user?.name}
            </h2>
            <p className="text-xs font-mono text-slate-400 mb-4">{profile.user?.mobile}</p>

            <div className="flex items-center gap-2 mb-6">
              <span className="px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-indigo-500/15 text-indigo-400 border border-indigo-500/20">
                {profile.user?.role} MEMBER
              </span>
              <span className="text-xs font-mono text-slate-500">
                #{profile.user?.id?.slice(-6).toUpperCase()}
              </span>
            </div>

            {/* Verification Status Badges */}
            <div className="grid grid-cols-2 gap-2.5 w-full">
              <div className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs font-bold text-emerald-400">
                <ShieldCheck size={15} /> Verified
              </div>
              <div className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-xs font-bold text-indigo-400">
                <Sparkles size={14} /> VIP Access
              </div>
            </div>
          </div>

          {/* KYC Credentials Card */}
          <div className="rounded-3xl p-5 bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-white/10 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <IdCard size={15} className="text-indigo-400" /> Identity Documents
              </h3>
              <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                Active
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="p-3 rounded-xl bg-slate-950/50 border border-white/5 flex justify-between items-center">
                <span className="text-slate-400 font-medium">Aadhaar Card</span>
                <span className="font-mono text-slate-200 font-bold">{maskNumber(profile.user?.adharcard)}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950/50 border border-white/5 flex justify-between items-center">
                <span className="text-slate-400 font-medium">PAN Card</span>
                <span className="font-mono text-slate-200 font-bold">{maskNumber(profile.user?.pancard)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Content & Forms */}
        <div className="lg:col-span-8">
          {isEditing ? (
            /* --- EDIT FORM --- */
            <div className="rounded-3xl p-6 sm:p-8 bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-white/10 shadow-xl space-y-6">
              <div className="flex items-center gap-3 pb-4 border-b border-white/10">
                <div className="p-2.5 rounded-xl bg-indigo-500/15 text-indigo-400">
                  <Edit2 size={18} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">Edit Profile Details</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Update your personal contact & KYC information</p>
                </div>
              </div>

              <form onSubmit={handleUpdateProfile} className="space-y-5">
                <div className="flex justify-center mb-4">
                  <div className="w-full max-w-xs">
                    <ImageUploader
                      value={formData.avatar}
                      onChange={(path: string) => setFormData({ ...formData, avatar: path })}
                      folder="avatars"
                      label="Profile Picture"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <ProfileInput
                    label="Full Name"
                    icon={User}
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                  <ProfileInput
                    label="Mobile Number"
                    icon={Smartphone}
                    value={formData.mobile}
                    onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                  />
                </div>

                <ProfileInput
                  label="Email Address"
                  icon={Mail}
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <ProfileInput
                    label="Aadhaar Card No"
                    icon={IdCard}
                    value={formData.adharcard}
                    onChange={(e) => setFormData({ ...formData, adharcard: e.target.value })}
                  />
                  <ProfileInput
                    label="PAN Card No"
                    icon={IdCard}
                    value={formData.pancard}
                    onChange={(e) => setFormData({ ...formData, pancard: e.target.value })}
                  />
                </div>

                <ProfileInput
                  label="Residential Address"
                  icon={Landmark}
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                />

                {/* Password Change Box */}
                <div className="p-4 rounded-2xl bg-slate-950/60 border border-white/10 space-y-3">
                  <h4 className="text-xs font-bold text-white flex items-center gap-2">
                    <Lock size={14} className="text-amber-400" /> Change Password (Optional)
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <ProfileInput
                      type="password"
                      label="New Password"
                      icon={Lock}
                      placeholder="••••••••"
                      value={formData.newPassword}
                      onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                    />
                    <div className={!formData.newPassword ? 'opacity-50 pointer-events-none' : ''}>
                      <ProfileInput
                        type="password"
                        label="Current Password"
                        icon={Lock}
                        placeholder="Current password"
                        value={formData.currentPassword}
                        onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <ActionButton type="button" variant="secondary" onClick={() => setIsEditing(false)}>
                    Cancel
                  </ActionButton>
                  <ActionButton type="submit" loading={isSaving}>
                    Save Changes
                  </ActionButton>
                </div>
              </form>
            </div>
          ) : (
            /* --- VIEW MODE --- */
            <div className="space-y-5">
              {/* Stats Grid */}
              <StatsGrid
                tickets={profile.stats?.totalTickets ?? 0}
                wins={profile.stats?.winningTickets ?? 0}
                winRate={winRate}
              />

              {/* Wallet & Referral Quick Actions */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div
                  onClick={() => router.push('/user/transaction/wallet')}
                  className="rounded-3xl p-5 bg-gradient-to-br from-indigo-950/60 via-slate-900 to-slate-950 border border-indigo-500/20 hover:border-indigo-500/40 cursor-pointer transition-all hover:-translate-y-0.5 group shadow-lg"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center">
                      <Wallet size={20} />
                    </div>
                    <span className="text-xs font-bold text-indigo-400 group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                      Statement <ChevronRight size={14} />
                    </span>
                  </div>
                  <div className="text-xs uppercase font-bold text-slate-400">Available Wallet</div>
                  <div className="text-2xl font-black text-white mt-0.5">
                    {formatCurrency(profile.user?.wallet ?? 0)}
                  </div>
                </div>

                <div
                  onClick={() => router.push('/user/referrals')}
                  className="rounded-3xl p-5 bg-gradient-to-br from-violet-950/60 via-slate-900 to-slate-950 border border-violet-500/20 hover:border-violet-500/40 cursor-pointer transition-all hover:-translate-y-0.5 group shadow-lg"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 rounded-xl bg-violet-500/15 text-violet-400 flex items-center justify-center">
                      <Gift size={20} />
                    </div>
                    <span className="text-xs font-bold text-violet-400 group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                      Network <ChevronRight size={14} />
                    </span>
                  </div>
                  <div className="text-xs uppercase font-bold text-slate-400">Referral Code</div>
                  <div className="text-xl font-mono font-black text-white mt-0.5">
                    {profile.user?.referralCode || 'SAWARIYA'}
                  </div>
                </div>
              </div>

              {/* Navigation Hub */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div
                  onClick={() => router.push('/user/tickets')}
                  className="p-4 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-white/10 hover:border-indigo-500/30 cursor-pointer transition-all flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-indigo-500/15 text-indigo-400 flex items-center justify-center">
                      <Ticket size={18} />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">Ticket Vault</h4>
                      <p className="text-[11px] text-slate-400">{profile.stats?.totalTickets} Total</p>
                    </div>
                  </div>
                  <ChevronRight size={16} className="text-slate-400" />
                </div>

                <div
                  onClick={() => router.push('/user/transaction/payments')}
                  className="p-4 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-white/10 hover:border-indigo-500/30 cursor-pointer transition-all flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center">
                      <CreditCard size={18} />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">Payment Ledger</h4>
                      <p className="text-[11px] text-slate-400">Order History</p>
                    </div>
                  </div>
                  <ChevronRight size={16} className="text-slate-400" />
                </div>

                <div
                  onClick={() => router.push('/user/notifications')}
                  className="p-4 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-white/10 hover:border-indigo-500/30 cursor-pointer transition-all flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center">
                      <Bell size={18} />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">Alerts</h4>
                      <p className="text-[11px] text-slate-400">
                        {profile.stats?.unreadNotifications ? `${profile.stats.unreadNotifications} New` : 'All caught up'}
                      </p>
                    </div>
                  </div>
                  <ChevronRight size={16} className="text-slate-400" />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setShowLogoutModal(false)}
        >
          <div
            className="max-w-sm w-full bg-slate-900 border border-white/10 rounded-3xl p-6 text-center space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-12 rounded-2xl bg-rose-500/15 text-rose-400 flex items-center justify-center mx-auto">
              <LogOut size={24} />
            </div>
            <h3 className="text-lg font-black text-white">Sign Out of Sawariya?</h3>
            <p className="text-xs text-slate-400">
              You will need to sign back in with your mobile number to access your ticket vault and wallet.
            </p>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setShowLogoutModal(false)}
                className="flex-1 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white font-bold text-xs transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmLogout}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-lg shadow-rose-600/30 transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
