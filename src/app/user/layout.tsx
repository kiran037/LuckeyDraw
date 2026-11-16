'use client';

import Header from '@/components/LandingUI/Header/Header';
import BottomNav from '@/components/LandingUI/BottomNav';

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-50/60 dark:bg-[#090D16] transition-colors duration-300 flex flex-col">
      <Header />
      
      <main className="flex-1 w-full relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 pb-28 md:pb-16 animate-in fade-in duration-300">
          {children}
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
