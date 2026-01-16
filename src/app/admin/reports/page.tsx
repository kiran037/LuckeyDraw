import Link from "next/link";
import { BarChart3, DollarSign, Users, Trophy, TrendingUp, FileText } from "lucide-react";
import { Card } from "@/components/AdminUI/ui/Card";

const reportCards = [
  {
    title: "Draw Performance",
    description: "View ticket sales, revenue, and completion rates for each draw",
    icon: BarChart3,
    href: "/admin/reports/draws",
    color: "bg-blue-500",
    stats: "Track active & completed draws"
  },
  {
    title: "Sales Report",
    description: "Analyze payment transactions, revenue trends, and transaction history",
    icon: DollarSign,
    href: "/admin/reports/sales",
    color: "bg-green-500",
    stats: "Revenue & transactions"
  },
  {
    title: "User Analytics",
    description: "Monitor user activity, spending patterns, and engagement metrics",
    icon: Users,
    href: "/admin/reports/users",
    color: "bg-purple-500",
    stats: "User spending & activity"
  },
  {
    title: "Winners Report",
    description: "View all declared winners, prizes distributed, and winner details",
    icon: Trophy,
    href: "/admin/reports/winners",
    color: "bg-amber-500",
    stats: "Prize distribution"
  },
];

export default function ReportsPage() {
  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <FileText className="w-6 h-6 text-zinc-700 dark:text-zinc-300" />
          <h1 className="text-xl font-bold text-zinc-900 dark:text-white">Reports & Analytics</h1>
        </div>
        <p className="text-sm text-zinc-500">
          Comprehensive insights into your raffle performance, sales, users, and winners
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {reportCards.map((card) => {
          const Icon = card.icon;
          return (
            <Link key={card.href} href={card.href}>
              <div className="group bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 hover:shadow-md hover:border-zinc-300 dark:hover:border-zinc-700 transition-all cursor-pointer h-full">
                <div className="flex items-start gap-4">
                  <div className={`${card.color} w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-1 group-hover:text-zinc-700 dark:group-hover:text-zinc-300">
                      {card.title}
                    </h3>
                    <p className="text-xs text-zinc-500 line-clamp-2 mb-2">
                      {card.description}
                    </p>
                    <div className="flex items-center gap-1 text-xs text-zinc-400">
                      <TrendingUp className="w-3 h-3" />
                      <span>{card.stats}</span>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="What can you track?">
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center flex-shrink-0">
                <BarChart3 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">Draw Performance</p>
                <p className="text-xs text-zinc-500">Ticket sales progress, revenue per draw, completion rates</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-green-50 dark:bg-green-900/20 flex items-center justify-center flex-shrink-0">
                <DollarSign className="w-4 h-4 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">Financial Reports</p>
                <p className="text-xs text-zinc-500">Total revenue, payment methods, transaction history</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center flex-shrink-0">
                <Users className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">User Insights</p>
                <p className="text-xs text-zinc-500">Top spenders, user activity, engagement metrics</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center flex-shrink-0">
                <Trophy className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">Winners Overview</p>
                <p className="text-xs text-zinc-500">Prize distribution, winner details, declaration history</p>
              </div>
            </div>
          </div>
        </Card>

        <Card title="Report Features">
          <div className="space-y-3 text-sm text-zinc-600 dark:text-zinc-400">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-zinc-400" />
              <span>Filter by date ranges and status</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-zinc-400" />
              <span>Search and sort data dynamically</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-zinc-400" />
              <span>View detailed breakdowns and metrics</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-zinc-400" />
              <span>Real-time data updates</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-zinc-400" />
              <span>Paginated results for better performance</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}