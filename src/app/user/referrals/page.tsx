'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { api } from '@/lib/api-client';
import {
  Users, Copy, Check, Share2, Sparkles, Gift,
  ChevronLeft, Loader2, Calendar, HeartHandshake
} from 'lucide-react';

interface ReferredUser {
  id: string;
  name: string;
  mobile: string;
  joinedAt: string;
}

interface ProfileData {
  user: {
    referralCode?: string;
  };
}

export default function ReferredUsersPage() {
  const router = useRouter();
  const [data, setData] = useState<ReferredUser[]>([]);
  const [referralCode, setReferralCode] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const [refRes, profRes] = await Promise.all([
          api.get<ReferredUser[]>('/user/referrals'),
          api.get<ProfileData>('/user/profile'),
        ]);

        if (refRes.success && Array.isArray(refRes.data)) {
          setData(refRes.data);
        }
        if (profRes.success && profRes.data?.user?.referralCode) {
          setReferralCode(profRes.data.user.referralCode);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  const handleCopy = () => {
    if (!referralCode) return;
    navigator.clipboard.writeText(referralCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareWhatsApp = () => {
    const text = `Join Sawariya Lucky Draw and win luxury bikes, smartphones & cash prizes! Use my referral code: *${referralCode}* to get started: ${window.location.origin}/signin?mode=register&ref=${referralCode}`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
          <Loader2 className="w-6 h-6 text-indigo-500 animate-spin" />
        </div>
        <p className="text-sm font-semibold text-slate-400">Loading referral program...</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Top Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-900/60 dark:bg-slate-900/80 border border-white/10 hover:border-white/20 text-slate-300 hover:text-white transition-all active:scale-95"
          aria-label="Go back"
        >
          <ChevronLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <Gift className="text-indigo-500" size={24} />
            Refer & Earn Rewards
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Invite friends to Sawariya Lucky Draw and earn bonus commission on every draw entry
          </p>
        </div>
      </div>

      {/* Hero Referral Code Showcase */}
      <div className="relative overflow-hidden rounded-3xl p-6 sm:p-8 bg-gradient-to-br from-indigo-950 via-slate-900 to-violet-950/50 border border-indigo-500/30 shadow-2xl">
        <div className="absolute top-0 right-0 w-72 h-72 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-bold uppercase tracking-wider">
              <Sparkles size={13} /> Your Unique Invitation Code
            </span>
            <div className="flex items-center justify-center md:justify-start gap-3 pt-2">
              <div className="font-mono text-3xl sm:text-4xl font-black text-white tracking-widest bg-slate-950/80 px-5 py-2.5 rounded-2xl border border-white/15 shadow-inner">
                {referralCode || 'SAWARIYA'}
              </div>
              <button
                onClick={handleCopy}
                className="p-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 transition-all active:scale-95 flex items-center justify-center"
                title="Copy Referral Code"
              >
                {copied ? <Check size={20} className="text-emerald-300" /> : <Copy size={20} />}
              </button>
            </div>
            {copied && (
              <p className="text-xs text-emerald-400 font-semibold">Code copied to clipboard!</p>
            )}
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
            <button
              onClick={handleShareWhatsApp}
              className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 transition-all active:scale-95"
            >
              <Share2 size={16} /> Share on WhatsApp
            </button>
          </div>
        </div>
      </div>

      {/* How It Works Steps */}
      <div className="space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400">How Referrals Work</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-white/10 space-y-2">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center font-black text-base">
              1
            </div>
            <h3 className="font-bold text-slate-900 dark:text-white text-sm">Share Invitation</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Send your personal referral code or direct invite link to friends and contacts.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-white/10 space-y-2">
            <div className="w-10 h-10 rounded-xl bg-violet-500/10 text-violet-400 flex items-center justify-center font-black text-base">
              2
            </div>
            <h3 className="font-bold text-slate-900 dark:text-white text-sm">Friends Register</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Your invited members sign up and enter your code during initial registration.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-white/10 space-y-2">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center font-black text-base">
              3
            </div>
            <h3 className="font-bold text-slate-900 dark:text-white text-sm">Earn Together</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Receive special cashback & referral points every time your network participates.
            </p>
          </div>
        </div>
      </div>

      {/* Referred Members List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <Users size={16} className="text-indigo-400" />
            Your Network ({data.length})
          </h2>
          <span className="text-xs font-semibold text-emerald-400">
            {data.length} Total Recruits
          </span>
        </div>

        {data.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 bg-white/40 dark:bg-slate-900/40 rounded-3xl border-2 border-dashed border-slate-200 dark:border-white/10 text-center px-4">
            <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-3">
              <HeartHandshake size={26} />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">No Referred Friends Yet</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mt-1">
              Share your referral code via WhatsApp or social media to start building your network.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {data.map((u) => (
              <motion.div
                key={u.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between p-4 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-white/10"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-indigo-500/15 text-indigo-400 border border-indigo-500/20 flex items-center justify-center font-bold text-sm">
                    {u.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">{u.name}</h4>
                    <p className="text-xs font-mono text-slate-500 dark:text-slate-400">
                      Mobile: {u.mobile}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Joined</span>
                  <span className="text-xs font-semibold text-slate-300 flex items-center gap-1 justify-end">
                    <Calendar size={12} className="text-slate-400" />
                    {new Date(u.joinedAt).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
