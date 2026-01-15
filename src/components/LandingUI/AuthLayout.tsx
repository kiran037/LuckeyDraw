'use client';

import Link from 'next/link';

export default function AuthLayout({ children, title, subtitle }: { children: React.ReactNode, title: string, subtitle: string }) {
  return (
    <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden bg-gray-50 dark:bg-[#0B0E14] transition-colors duration-300">
      {/* Background Blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-500/20 rounded-full blur-[100px] animate-pulse-slow pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-pink-500/20 rounded-full blur-[100px] animate-pulse-slow pointer-events-none" />

      <div className="w-full max-w-md p-4 relative z-10">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block mb-6">
            <span className="text-2xl font-black tracking-tight text-gray-900 dark:text-white">
              SAWA<span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-500">RIYA</span>
            </span>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{title}</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">{subtitle}</p>
        </div>
        
        {children}
      </div>
    </div>
  );
}