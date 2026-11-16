'use client';

import Link from 'next/link';
import { Trophy, ShieldCheck, Lock, Award, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="w-full bg-white dark:bg-[#090D16] border-t border-slate-200/80 dark:border-white/[0.08] mt-16 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-10">

          {/* Col 1 & 2: Brand & Mission */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-2.5 select-none">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center shadow-md shadow-primary/20">
                <Trophy size={18} className="text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-black tracking-tight text-slate-900 dark:text-white leading-none">
                  Sawariya
                </span>
                <span className="text-[10px] text-slate-400 font-bold tracking-widest uppercase">
                  Lucky Draw
                </span>
              </div>
            </Link>

            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed max-w-sm">
              India&apos;s leading consumer rewards and digital contest platform.
              Experience 100% cryptographically fair draws, premium physical prizes,
              and instant verified payouts.
            </p>

            {/* Trust Pills */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-semibold border border-emerald-500/20">
                <ShieldCheck size={14} />
                <span>CSPRNG Verified</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-xs font-semibold border border-indigo-500/20">
                <Lock size={13} />
                <span>SSL Encrypted</span>
              </div>
            </div>
          </div>

          {/* Col 3: Quick Navigation */}
          <div>
            <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider mb-4">
              Explore
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400">
              <li>
                <Link href="/user/draws" className="hover:text-primary transition-colors">
                  Live Draws
                </Link>
              </li>
              <li>
                <Link href="/user/winners" className="hover:text-primary transition-colors">
                  Hall of Fame
                </Link>
              </li>
              <li>
                <Link href="/user/tickets" className="hover:text-primary transition-colors">
                  Ticket Locker
                </Link>
              </li>
              <li>
                <Link href="/#how-it-works" className="hover:text-primary transition-colors">
                  How It Works
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Account & Wallet */}
          <div>
            <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider mb-4">
              User Hub
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400">
              <li>
                <Link href="/user/transaction/wallet" className="hover:text-primary transition-colors">
                  Wallet & Ledger
                </Link>
              </li>
              <li>
                <Link href="/user/transaction/payments" className="hover:text-primary transition-colors">
                  Payment History
                </Link>
              </li>
              <li>
                <Link href="/user/referrals" className="hover:text-primary transition-colors">
                  Referral Rewards
                </Link>
              </li>
              <li>
                <Link href="/user/profile" className="hover:text-primary transition-colors">
                  My Profile & KYC
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 5: Support & Security */}
          <div>
            <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider mb-4">
              Fair Play
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400">
              <li className="flex items-center gap-1.5">
                <Award size={14} className="text-amber-500" />
                <span>Zero Manipulation</span>
              </li>
              <li>
                <Link href="/#faq" className="hover:text-primary transition-colors">
                  Frequently Asked Questions
                </Link>
              </li>
              <li>
                <span className="text-slate-400 dark:text-slate-500 text-xs">
                  24/7 Support Hotline
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-6 border-t border-slate-100 dark:border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400 dark:text-slate-500">
          <p>© {new Date().getFullYear()} Sawariya Lucky Draw. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Built with integrity & transparency <Heart size={12} className="text-red-500 fill-red-500" />
          </p>
        </div>
      </div>
    </footer>
  );
}
