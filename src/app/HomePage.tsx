'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api-client';
import { Draw, Ticket } from '@/lib/types';

// New UI Components
import { PageLoader, PageError } from '@/components/LandingUI/HomePrimitives';
import Header from '@/components/LandingUI/Header/Header';
import BottomNav from '@/components/LandingUI/BottomNav';

// Feature Components
import HeroCarousel from '@/components/LandingUI/User/home/HeroCarousel';
import QuickStats from '@/components/LandingUI/User/home/QuickStats';
import LiveDrawsSection from '@/components/LandingUI/User/home/LiveDrawsSection';
import MyTicketsSection from '@/components/LandingUI/User/home/MyTicketsSection';
import WinnersLeaderboard from '@/components/LandingUI/User/home/WinnersLeaderboard';
import HowItWorks from '@/components/LandingUI/User/home/HowItWorks';
import FAQSection from '@/components/LandingUI/User/home/FAQSection';

interface HomeData {
  stats: {
    activeDraws: number;
    totalPrizePool: number;
    happyWinners: number;
    userTickets?: number;
  };
  liveDraws: Draw[];
  userTickets: (Omit<Ticket, 'draw'> & {
    draw: {
      id: string;
      title: string;
      status: string;
      bannerImage: string | null;
      endTime: string;
      resultAt?: string;
      productImage?: string | null;
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

export default function HomePage() {
  const [data, setData] = useState<HomeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadHomeData = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fix: Use generic type correctly
        const response = await api.get<HomeData>('/user/home');
        if (response.success && response.data) {
          setData(response.data);
        } else {
          setError(response.message || 'Failed to load data');
        }
      } catch (err) {
        setError('Connection failed');
      } finally {
        setLoading(false);
      }
    };
    void loadHomeData();
  }, []);

  if (loading) return <PageLoader />;
  if (error) return <PageError message={error} onRetry={() => window.location.reload()} />;
  if (!data) return <PageError message="No data available" />;

  return (
    <div className="min-h-screen bg-[#F5F5F7] dark:bg-[#0B0E14] text-gray-900 dark:text-white pb-24 transition-colors duration-300 font-sans">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-10 sm:space-y-16">
        
        {/* 1. Hero & Stats */}
        <div className="space-y-6">
          <HeroCarousel />
          {data.stats && <QuickStats stats={data.stats} isLoggedIn={data.isLoggedIn} />}
        </div>

        {/* 2. Live Action */}
        <section>
          <LiveDrawsSection draws={data.liveDraws} />
        </section>

        {/* 3. Personal Dashboard (If User) */}
        {data.isLoggedIn && data.userTickets.length > 0 && (
          <section className="animate-in fade-in slide-in-from-bottom-4 duration-700">
             <MyTicketsSection tickets={data.userTickets} />
          </section>
        )}

        {/* 4. Social Proof & Info Grid */}
        <div className="grid lg:grid-cols-12 gap-8 lg:gap-12">
          
          {/* Left: Winners (8 cols) */}
          <div className="lg:col-span-8 space-y-10">
            <section>
              <WinnersLeaderboard winners={data.recentWinners} />
            </section>
            
            <section className="bg-white dark:bg-[#151925] rounded-3xl p-6 sm:p-8 border border-gray-100 dark:border-white/5 shadow-sm">
              <HowItWorks />
            </section>
          </div>

          {/* Right: Support & FAQ (4 cols) */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-gradient-to-br from-purple-600 to-indigo-600 rounded-3xl p-6 text-white shadow-xl shadow-purple-500/20">
              <h3 className="font-bold text-lg mb-2">Need Assistance?</h3>
              <p className="text-sm text-purple-100 mb-4 leading-relaxed">
                Our support team is available 24/7 to help you with payments or tickets.
              </p>
              <button className="w-full py-3 bg-white text-purple-600 font-bold rounded-xl text-sm hover:bg-purple-50 transition-colors">
                Chat Support
              </button>
            </div>

            <section>
               <FAQSection />
            </section>
          </div>
        </div>

      </main>

      <BottomNav />
    </div>
  );
}