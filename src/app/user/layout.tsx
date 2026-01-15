// src/app/user/layout.tsx
'use client';

import BottomNav from '@/components/UserUI/BottomNav'; // This is your ResponsiveNav

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#09090b] text-white">
      {/* 
        Responsive Navigation 
        - Fixed at Bottom on Mobile
        - Fixed at Left on Desktop
      */}
      <BottomNav />

      {/* Main Content Wrapper */}
      <main className="relative min-h-screen pb-32 md:pb-10 md:pl-32">
        <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}