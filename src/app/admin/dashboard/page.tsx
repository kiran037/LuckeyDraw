"use client";

import { useEffect, useState } from "react";
import { StatsGrid } from "@/components/AdminUI/Dashboard/StatsGrid";
import { RevenueChart } from "@/components/AdminUI/Dashboard/RevenueChart";
import { RecentActivity } from "@/components/AdminUI/Dashboard/RecentActivity";
import { Loader2 } from "lucide-react";

// ... (Keep your existing interfaces StatsData, AnalyticsData, ActivityData here) ...
interface StatsData {
  revenue: { total: number; today: number };
  users: { total: number; newToday: number };
  tickets: { total: number; soldToday: number };
  draws: { active: number };
  actionItems: { pendingPayments: number };
}

interface AnalyticsData {
  date: string;
  amount: number;
}

interface ActivityData {
  users: Array<{ id: string; name: string; email: string; avatar: string | null; createdAt: string }>;
  transactions: Array<{ 
    id: string; 
    amount: number; 
    status: string; 
    createdAt: string; 
    user: { name: string };
    draw: { title: string };
  }>;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [analytics, setAnalytics] = useState<AnalyticsData[] | null>(null);
  const [activity, setActivity] = useState<ActivityData | null>(null);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [statsRes, analyticsRes, activityRes] = await Promise.all([
          fetch("/api/admin/dashboard/stats"),
          fetch("/api/admin/dashboard/analytics"),
          fetch("/api/admin/dashboard/activity")
        ]);

        if (!statsRes.ok || !analyticsRes.ok || !activityRes.ok) {
          throw new Error("One or more dashboard services failed");
        }

        const statsData = await statsRes.json();
        const analyticsData = await analyticsRes.json();
        const activityData = await activityRes.json();

        // Debugging: Check console to see if files are swapped
        console.log("Stats API:", statsData);
        console.log("Analytics API:", analyticsData);
        console.log("Activity API:", activityData);

        // FIXED: Safe navigation using ?.
        setStats(statsData?.kpi || null);
        setAnalytics(analyticsData?.charts?.revenueOverTime || []);
        setActivity(activityData?.activity || null);

      } catch (err) {
        console.error("Dashboard Load Error:", err);
        setError("Failed to load dashboard data.");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (error) {
    return (
      <div className="flex h-[80vh] items-center justify-center flex-col gap-4">
        <p className="text-red-500 font-medium">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-zinc-900 text-white rounded-lg text-sm"
        >
          Retry
        </button>
      </div>
    );
  }

  // ... (Keep the rest of your return JSX exactly as it was) ...
  return (
    <div className="p-6 md:p-8 max-w-[1600px] mx-auto space-y-8 animate-in fade-in duration-500">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
            Overview
          </h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Welcome back. Here's what's happening today.
          </p>
        </div>
        
        {loading && (
          <div className="flex items-center text-sm text-zinc-400">
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Updating...
          </div>
        )}
      </div>

      <StatsGrid data={stats} />
      <RevenueChart data={analytics} />
      <RecentActivity data={activity} />
    </div>
  );
}