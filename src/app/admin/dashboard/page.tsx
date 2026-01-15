// // src/app/admin/dashboard/page.tsx
import StatCard from "@/components/AdminUI/StatCard";
import { Gift, Users, Ticket, TrendingUp } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { Card, Badge } from "@/components/ui";

export default async function DashboardPage() {
  const currentUser = await getCurrentUser();
  
  const [
    totalDraws,
    totalUsers,
    totalTickets,
    approvedPayments,
    recentPayments,
  ] = await Promise.all([
    prisma.draw.count(),
    prisma.user.count(),
    prisma.ticket.count(),
    prisma.payment.aggregate({
      _sum: { amount: true },
      where: { status: "APPROVED" },
    }),
    prisma.payment.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { name: true } },
        draw: { select: { title: true } },
      },
    }),
  ]);

  const totalRevenue = approvedPayments._sum.amount || 0;

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "APPROVED":
        return "success";
      case "PENDING":
        return "warning";
      case "REJECTED":
        return "danger";
      default:
        return "default";
    }
  };

  return (
    <div className="space-y-8 max-w-7xl">
      {/* Welcome Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Welcome back, {currentUser?.name}! 👋
        </h1>
        <p className="text-gray-600">
          Here's what's happening with your draws today
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Users"
          value={totalUsers}
          change="+8.2%"
          changeType="increase"
          icon={Users}
        />
        <StatCard
          title="Total Draws"
          value={totalDraws}
          change="+12.5%"
          changeType="increase"
          icon={Gift}
        />
        <StatCard
          title="Tickets Sold"
          value={totalTickets}
          change="+23.1%"
          changeType="increase"
          icon={Ticket}
        />
        <StatCard
          title="Total Revenue"
          value={`₹${(totalRevenue / 1000).toFixed(1)}k`}
          change="+36.8%"
          changeType="increase"
          icon={TrendingUp}
        />
      </div>

      {/* Recent Activity */}
      <Card>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-gray-900">Recent Payments</h2>
        </div>
        
        {recentPayments.length > 0 ? (
          <div className="space-y-3">
            {recentPayments.map((payment) => (
              <div
                key={payment.id.toString()}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
              >
                <div className="flex-1">
                  <p className="font-semibold text-gray-900 text-sm">
                    {payment.user.name}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {payment.draw.title}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="font-bold text-gray-900">₹{payment.amount}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(payment.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge variant={getStatusVariant(payment.status)}>
                    {payment.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            <p>No recent payments</p>
          </div>
        )}
      </Card>

      {/* Admin Table */}
      {currentUser?.role === "ADMIN" && recentPayments.length > 0 && (
        <Card>
          <h2 className="text-lg font-bold text-gray-900 mb-6">
            Payment Details
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-3 px-4 text-xs font-bold text-gray-600 uppercase">
                    User
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-bold text-gray-600 uppercase">
                    Draw
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-bold text-gray-600 uppercase">
                    Transaction
                  </th>
                  <th className="text-right py-3 px-4 text-xs font-bold text-gray-600 uppercase">
                    Amount
                  </th>
                  <th className="text-center py-3 px-4 text-xs font-bold text-gray-600 uppercase">
                    Status
                  </th>
                  <th className="text-right py-3 px-4 text-xs font-bold text-gray-600 uppercase">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody>
                {recentPayments.map((payment) => (
                  <tr
                    key={payment.id.toString()}
                    className="border-b border-gray-50 hover:bg-gray-50 transition-colors"
                  >
                    <td className="py-4 px-4 text-sm font-semibold text-gray-900">
                      {payment.user.name}
                    </td>
                    <td className="py-4 px-4 text-sm text-gray-600">
                      {payment.draw.title}
                    </td>
                    <td className="py-4 px-4 text-sm text-gray-600 font-mono">
                      {payment.transactionId}
                    </td>
                    <td className="py-4 px-4 text-sm font-bold text-gray-900 text-right">
                      ₹{payment.amount}
                    </td>
                    <td className="py-4 px-4 text-center">
                      <Badge variant={getStatusVariant(payment.status)}>
                        {payment.status}
                      </Badge>
                    </td>
                    <td className="py-4 px-4 text-sm text-gray-600 text-right">
                      {new Date(payment.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}