export const dynamic = "force-dynamic";

import { headers, cookies } from "next/headers";
import { ChevronLeft, Users, Award } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/AdminUI/ui/Button";
import { format } from "date-fns";

async function getUsersReport() {
  const headerList = await headers();
  const cookieStore = await cookies();
  const host = headerList.get("host");
  const protocol = process.env.NODE_ENV === "development" ? "http" : "https";
  
  try {
    const res = await fetch(`${protocol}://${host}/api/admin/reports/users?limit=50&sortBy=spend`, {
      cache: "no-store",
      headers: { Cookie: cookieStore.toString() }
    });
    
    if (!res.ok) return { data: [], meta: { total: 0, page: 1, limit: 50, totalPages: 0 } };
    
    return await res.json();
  } catch (e) {
    return { data: [], meta: { total: 0, page: 1, limit: 50, totalPages: 0 } };
  }
}

export default async function UsersReportPage() {
  const report = await getUsersReport();

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/admin/reports">
            <Button variant="outline" size="icon" className="h-8 w-8">
              <ChevronLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-zinc-700 dark:text-zinc-300" />
              <h1 className="text-xl font-bold text-zinc-900 dark:text-white">User Analytics</h1>
            </div>
            <p className="text-sm text-zinc-500">User spending and activity overview</p>
          </div>
        </div>
      </div>

      {report.data.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-zinc-900 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl">
          <p className="text-sm text-zinc-500">No user data available</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-zinc-50/50 dark:bg-zinc-950/50 text-zinc-500 border-b border-zinc-100 dark:border-zinc-800">
                <tr>
                  <th className="px-5 py-3 font-medium">Rank</th>
                  <th className="px-5 py-3 font-medium">User</th>
                  <th className="px-5 py-3 font-medium">Contact</th>
                  <th className="px-5 py-3 font-medium">Total Spent</th>
                  <th className="px-5 py-3 font-medium">Tickets</th>
                  <th className="px-5 py-3 font-medium">Transactions</th>
                  <th className="px-5 py-3 font-medium">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {report.data.map((user: {
                  id: string;
                  name: string;
                  contact: { email: string | null; mobile: string };
                  joinedAt: string;
                  stats: {
                    totalTickets: number;
                    totalTransactions: number;
                    totalSpent: number;
                  };
                }, index: number) => {
                  const isTopSpender = index < 3;
                  
                  return (
                    <tr key={user.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2">
                          {isTopSpender && (
                            <Award className={`w-4 h-4 ${
                              index === 0 ? "text-amber-500" : 
                              index === 1 ? "text-zinc-400" : 
                              "text-amber-700"
                            }`} />
                          )}
                          <span className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                            #{index + 1}
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <p className="font-medium text-zinc-900 dark:text-zinc-100">{user.name}</p>
                      </td>
                      <td className="px-5 py-3.5">
                        <div>
                          <p className="text-sm text-zinc-900 dark:text-zinc-100">{user.contact.mobile}</p>
                          {user.contact.email && (
                            <p className="text-xs text-zinc-500 truncate max-w-[200px]">{user.contact.email}</p>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="font-bold text-green-600 dark:text-green-400">
                          ₹{user.stats.totalSpent.toLocaleString()}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                          {user.stats.totalTickets}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="text-sm text-zinc-900 dark:text-zinc-100">
                          {user.stats.totalTransactions}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="text-sm text-zinc-600 dark:text-zinc-400">
                          {format(new Date(user.joinedAt), "MMM d, yyyy")}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}