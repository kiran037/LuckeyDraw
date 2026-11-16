export const dynamic = "force-dynamic";

import { headers, cookies } from "next/headers";
import { ChevronLeft, BarChart3 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/AdminUI/ui/Button";
import { Badge } from "@/components/AdminUI/ui/Badge";
import { format } from "date-fns";

async function getDrawsReport() {
  const headerList = await headers();
  const cookieStore = await cookies();
  const host = headerList.get("host");
  const protocol = process.env.NODE_ENV === "development" ? "http" : "https";
  
  try {
    const res = await fetch(`${protocol}://${host}/api/admin/reports/draws?limit=50`, {
      cache: "no-store",
      headers: { Cookie: cookieStore.toString() }
    });
    
    if (!res.ok) return { data: [], meta: { total: 0, page: 1, limit: 50, totalPages: 0 } };
    
    return await res.json();
  } catch {
    return { data: [], meta: { total: 0, page: 1, limit: 50, totalPages: 0 } };
  }
}

export default async function DrawsReportPage() {
  const report = await getDrawsReport();

  const getStatusColor = (status: string): "default" | "success" | "danger" | "neutral" => {
    switch (status) {
      case 'LIVE': return 'success';
      case 'CLOSED':
      case 'RESULT_DECLARED': return 'neutral';
      default: return 'default';
    }
  };

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
              <BarChart3 className="w-5 h-5 text-zinc-700 dark:text-zinc-300" />
              <h1 className="text-xl font-bold text-zinc-900 dark:text-white">Draw Performance</h1>
            </div>
            <p className="text-sm text-zinc-500">Analyze ticket sales and revenue by draw</p>
          </div>
        </div>
      </div>

      {report.data.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-zinc-900 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl">
          <p className="text-sm text-zinc-500">No draw data available</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-zinc-50/50 dark:bg-zinc-950/50 text-zinc-500 border-b border-zinc-100 dark:border-zinc-800">
                <tr>
                  <th className="px-5 py-3 font-medium">Draw</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium">Entry Fee</th>
                  <th className="px-5 py-3 font-medium">Tickets</th>
                  <th className="px-5 py-3 font-medium">Progress</th>
                  <th className="px-5 py-3 font-medium">Revenue</th>
                  <th className="px-5 py-3 font-medium">Winners</th>
                  <th className="px-5 py-3 font-medium">End Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {report.data.map((draw: {
                  id: string;
                  title: string;
                  status: string;
                  entryFee: number;
                  dates: { start: string; end: string };
                  stats: {
                    totalTickets: number;
                    soldTickets: number;
                    progress: number;
                    totalRevenue: number;
                    winnersDeclared: number;
                  };
                }) => (
                  <tr key={draw.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30 transition-colors">
                    <td className="px-5 py-3.5">
                      <p className="font-medium text-zinc-900 dark:text-zinc-100 line-clamp-1">{draw.title}</p>
                    </td>
                    <td className="px-5 py-3.5">
                      <Badge variant={getStatusColor(draw.status)} size="sm" className="capitalize">
                        {draw.status.toLowerCase().replace('_', ' ')}
                      </Badge>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="font-semibold text-zinc-900 dark:text-zinc-100">₹{draw.entryFee}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="text-sm">
                        <span className="font-medium text-zinc-900 dark:text-zinc-100">{draw.stats.soldTickets}</span>
                        <span className="text-zinc-500"> / {draw.stats.totalTickets}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-2 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-blue-600 rounded-full transition-all" 
                            style={{ width: `${Math.min(draw.stats.progress, 100)}%` }}
                          />
                        </div>
                        <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400 min-w-[3ch]">
                          {draw.stats.progress}%
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="font-bold text-green-600 dark:text-green-400">₹{draw.stats.totalRevenue.toLocaleString()}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="text-sm text-zinc-900 dark:text-zinc-100">{draw.stats.winnersDeclared}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="text-sm text-zinc-600 dark:text-zinc-400">
                        {format(new Date(draw.dates.end), "MMM d, yyyy")}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}