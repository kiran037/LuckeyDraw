// src/app/HomePage.tsx
'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api-client';
import { Draw, Ticket } from '@/lib/types';
import LoadingSpinner from '@/components/UserUI/LoadingSpinner';
import ErrorState from '@/components/UserUI/ErrorState';
import Header from '@/components/ClientUI/Header';
import BottomNav from '@/components/UserUI/BottomNav';
import HeroCarousel from '@/components/user/home/HeroCarousel';
import QuickStats from '@/components/user/home/QuickStats';
import LiveDrawsSection from '@/components/user/home/LiveDrawsSection';
import HowItWorks from '@/components/user/home/HowItWorks';
import MyTicketsSection from '@/components/user/home/MyTicketsSection';
import WinnersLeaderboard from '@/components/user/home/WinnersLeaderboard';
import TrustIndicators from '@/components/user/home/TrustIndicators';
import FAQSection from '@/components/user/home/FAQSection';
import RulesGuidelines from '@/components/user/home/RulesGuidelines';

interface HomeData {
  stats: {
    activeDraws: number;
    totalPrizePool: number;
    happyWinners: number;
    userTickets?: number;
  };
  liveDraws: Draw[];
  
  // UPDATED TICKET DEFINITION
  userTickets: (Omit<Ticket, 'draw'> & {
    draw: {
      id: string;
      title: string;
      status: string;
      bannerImage: string | null; // Added
      endTime: string;            // Added
      resultAt?: string;          // Added
      productImage?: string | null; // Added
    } | null;
  })[];

  recentWinners: Array<{
    id: string;
    userName: string;
    userAvatar: string | null;
    drawTitle: string;
    productName: string;
    declaredAt: string;
  }>;
  isLoggedIn: boolean;
}

// REFINED: Ambient Background Glow
// Darker, subtler, and positioned to not interfere with reading
const BackgroundGlow = () => (
  <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none select-none">
    {/* Deep Purple Top Left - Reduced Opacity */}
    <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-purple-900/20 rounded-full blur-[120px]" />
    
    {/* Deep Indigo Bottom Right - Reduced Opacity */}
    <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-indigo-900/15 rounded-full blur-[120px]" />
    
    {/* Very subtle center fill to prevent pitch black void */}
    <div className="absolute top-[30%] left-[50%] -translate-x-1/2 w-[800px] h-[800px] bg-blue-900/05 rounded-full blur-[100px]" />
  </div>
);

export default function HomePage() {
  const [data, setData] = useState<HomeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadHomeData = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await api.get<HomeData>('/user/home');
        if (!response.success) {
          setError(response.error || 'Failed to load data');
          setLoading(false);
          return;
        }
        setData(response.data || null);
      } catch (err) {
        setError('Failed to load data');
      }
      setLoading(false);
    };
    void loadHomeData();
  }, []);

  if (loading) return (
    <div className="min-h-screen bg-[#0B0E14] flex items-center justify-center">
      <BackgroundGlow />
      <LoadingSpinner />
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-[#0B0E14] flex items-center justify-center">
      <BackgroundGlow />
      <ErrorState message={error} onRetry={() => window.location.reload()} />
    </div>
  );

  if (!data) return <ErrorState message="No data available" />;

  return (
    <div className="min-h-screen bg-[#0B0E14] text-white selection:bg-purple-500/30 font-sans">
      <BackgroundGlow />
      <Header />
      
      {/* Main Container - Adjusted spacing for mobile clarity */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8 flex flex-col gap-8 sm:gap-12 pb-32">
        
        {/* 1. Hero Section */}
        <section className="w-full">
          <HeroCarousel />
        </section>

{/* 2. Stats - Kept close to Hero for context */}
<section className="-mt-2 sm:mt-0">
  {data.stats && (
    <QuickStats stats={data.stats} isLoggedIn={data.isLoggedIn} />
  )}
</section>

        {/* 3. Live Draws - The Main Action */}
        <section>
          <LiveDrawsSection draws={data.liveDraws} />
        </section>

        {/* 4. My Tickets (Conditional) */}
        {data.isLoggedIn && data.userTickets.length > 0 && (
          <section className="animate-in fade-in slide-in-from-bottom-4 duration-700">
             <MyTicketsSection tickets={data.userTickets} />
          </section>
        )}

        {/* 6. Social Proof (Winners & Trust) */}
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <WinnersLeaderboard winners={data.recentWinners} />
          </div>
          <div className="flex flex-col gap-6 justify-center">
            <TrustIndicators />
            
            {/* Simple CTA Box */}
            <div className="bg-gradient-to-br from-purple-900/20 to-pink-900/20 rounded-2xl p-6 border border-white/5 text-center">
              <h3 className="font-bold text-white mb-2">Need Help?</h3>
              <p className="text-xs text-gray-400 mb-4">Our support team is available 24/7 to assist you with your tickets.</p>
              <button className="text-xs font-bold text-white bg-white/10 px-4 py-2 rounded-lg hover:bg-white/20 transition-colors">
                Contact Support
              </button>
            </div>

                {/* 5. How It Works - Visual Break */}
        <section className="py-2">
          <HowItWorks />
        </section>
          </div>
        </div>

        {/* 7. Information (FAQ & Rules) */}
        <div className="border-t border-white/5 pt-8 grid md:grid-cols-2 gap-8">
          <section>
            <FAQSection />
          </section>
          <section>
            <RulesGuidelines />
          </section>
        </div>

      </main>

      <BottomNav />
    </div>
  );
}