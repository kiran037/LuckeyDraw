'use client';

import Header from '@/components/Header/Header';
import BottomNav from '@/components/User/BottomNav';

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0B0E14] transition-colors duration-300">
      <Header />
      <BottomNav />
      <main className="relative w-full">
        <div className="max-w-7xl mx-auto">
      
          <div className="p-4 sm:p-6 lg:p-8 pt-6 pb-32 md:pb-12 md:pl-24 animate-in fade-in slide-in-from-bottom-2 duration-500">
            {children}
          </div>
        </div>
      </main>
      
    </div>
  );
}