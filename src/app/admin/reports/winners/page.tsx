export const dynamic = "force-dynamic";

import { headers, cookies } from "next/headers";
import { ChevronLeft, Trophy } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/AdminUI/ui/Button";
import { getImageUrl } from "@/lib/image-helper";
import { format } from "date-fns";

async function getWinnersReport() {
  const headerList = await headers();
  const cookieStore = await cookies();
  const host = headerList.get("host");
  const protocol = process.env.NODE_ENV === "development" ? "http" : "https";
  
  try {
    const res = await fetch(`${protocol}://${host}/api/admin/reports/winners?limit=50`, {
      cache: "no-store",
      headers: { Cookie: cookieStore.toString() }
    });
    
    if (!res.ok) return { data: [], meta: { total: 0, page: 1, limit: 50, totalPages: 0 } };
    
    return await res.json();
  } catch (e) {
    return { data: [], meta: { total: 0, page: 1, limit: 50, totalPages: 0 } };
  }
}

export default async function WinnersReportPage() {
  const report = await getWinnersReport();

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
              <Trophy className="w-5 h-5 text-zinc-700 dark:text-zinc-300" />
              <h1 className="text-xl font-bold text-zinc-900 dark:text-white">Winners Report</h1>
            </div>
            <p className="text-sm text-zinc-500">All declared winners and prizes distributed</p>
          </div>
        </div>
      </div>

      {report.data.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-zinc-900 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl">
          <Trophy className="w-12 h-12 text-zinc-400 mx-auto mb-4" />
          <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">No winners declared yet</p>
          <p className="text-xs text-zinc-500 mt-1">Winners will appear here once draws are completed</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-zinc-50/50 dark:bg-zinc-950/50 text-zinc-500 border-b border-zinc-100 dark:border-zinc-800">
                <tr>
                  <th className="px-5 py-3 font-medium">Winner</th>
                  <th className="px-5 py-3 font-medium">Prize</th>
                  <th className="px-5 py-3 font-medium">Draw</th>
                  <th className="px-5 py-3 font-medium">Ticket Code</th>
                  <th className="px-5 py-3 font-medium">Declared By</th>
                  <th className="px-5 py-3 font-medium">Declared At</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {report.data.map((winner: {
                  id: string;
                  user: {
                    id: string;
                    name: string;
                    email: string | null;
                    mobile: string;
                    avatar: string | null;
                  };
                  drawproduct: {
                    id: string;
                    name: string;
                    image: string | null;
                  };
                  draw: {
                    id: string;
                    title: string;
                  };
                  ticket: {
                    ticketCode: string;
                  };
                  admin: {
                    name: string;
                  };
                  declaredAt: string;
                }) => (
                  <tr key={winner.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden flex-shrink-0">
                          {winner.user.avatar ? (
                            <img src={getImageUrl(winner.user.avatar)} alt={winner.user.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-zinc-400 text-xs font-semibold">
                              {winner.user.name.charAt(0).toUpperCase()}
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-zinc-900 dark:text-zinc-100">{winner.user.name}</p>
                          <p className="text-xs text-zinc-500">{winner.user.mobile}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded bg-zinc-100 dark:bg-zinc-800 overflow-hidden flex-shrink-0">
                          {winner.drawproduct.image ? (
                            <img src={getImageUrl(winner.drawproduct.image)} alt={winner.drawproduct.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Trophy className="w-4 h-4 text-zinc-400" />
                            </div>
                          )}
                        </div>
                        <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{winner.drawproduct.name}</p>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <p className="text-sm text-zinc-900 dark:text-zinc-100 line-clamp-1">{winner.draw.title}</p>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="text-xs font-mono bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded text-zinc-900 dark:text-zinc-100">
                        {winner.ticket.ticketCode}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <p className="text-sm text-zinc-900 dark:text-zinc-100">{winner.admin.name}</p>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="text-sm">
                        <p className="text-zinc-900 dark:text-zinc-100">
                          {format(new Date(winner.declaredAt), "MMM d, yyyy")}
                        </p>
                        <p className="text-xs text-zinc-500">
                          {format(new Date(winner.declaredAt), "h:mm a")}
                        </p>
                      </div>
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