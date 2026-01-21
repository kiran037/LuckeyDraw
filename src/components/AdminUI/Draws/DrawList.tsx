"use client";

import { useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { Edit2, Trash2, Calendar, Ticket, Loader2 } from "lucide-react";
import { Badge } from "@/components/AdminUI/ui/Badge";
import { getImageUrl } from "@/lib/image-helper";
import { Button } from "../ui/Button";

interface DrawMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface DrawStats {
  sold: number;
  percentage: number;
  productCount: number;
}

interface DrawItem {
  id: string;
  title: string;
  bannerImage: string | null;
  entryFee: number;
  status: string;
  startTime: string;
  endTime: string;
  maxTickets: number;
  stats: DrawStats;
}

interface DrawListProps {
  draws: DrawItem[];
  meta: DrawMeta;
}

export default function DrawList({ draws }: DrawListProps) {
  const [deleting, setDeleting] = useState<string | null>(null);

  const handleDelete = async (id: string, soldCount: number) => {
    if (soldCount > 0) {
      alert("Cannot delete draws with active tickets");
      return;
    }

    if (!confirm("Are you sure you want to delete this draw?")) return;

    setDeleting(id);
    try {
      const res = await fetch(`/api/admin/draws/${id}`, { method: "DELETE" });
      
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to delete");
      }

      window.location.reload();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error deleting draw";
      alert(message);
    } finally {
      setDeleting(null);
    }
  };

  const getStatusColor = (status: string): "default" | "success" | "danger" | "neutral" => {
    switch (status) {
      case 'LIVE':
        return 'success';
      case 'CANCELLED':
        return 'danger';
      case 'ENDED':
        return 'neutral';
      default:
        return 'default';
    }
  };

  if (!draws || draws.length === 0) {
    return (
      <div className="text-center py-20 bg-white dark:bg-zinc-900 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-zinc-100 dark:bg-zinc-800 mb-4">
          <Ticket className="w-6 h-6 text-zinc-400" />
        </div>
        <h3 className="text-sm font-medium text-zinc-900 dark:text-zinc-100">No draws created</h3>
        <p className="text-xs text-zinc-500 mt-1">Get started by creating your first raffle.</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-zinc-50/50 dark:bg-zinc-950/50 text-zinc-500 border-b border-zinc-100 dark:border-zinc-800">
            <tr>
              <th className="px-5 py-3 font-medium">Draw Details</th>
              <th className="px-5 py-3 font-medium">Status</th>
              <th className="px-5 py-3 font-medium">Participation</th>
              <th className="px-5 py-3 font-medium">Timeline</th>
              <th className="px-5 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {draws.map((draw) => {
              const isDeleting = deleting === draw.id;
              const canDelete: boolean = draw.stats.sold === 0;

              return (
                <tr key={draw.id} className="group hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-md bg-zinc-100 dark:bg-zinc-800 overflow-hidden flex-shrink-0 border border-zinc-200 dark:border-zinc-700">
                        {draw.bannerImage ? (
                          <img 
                            src={getImageUrl(draw.bannerImage)} 
                            alt={draw.title}
                            className="w-full h-full object-cover" 
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-zinc-400 text-xs">
                            No img
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-zinc-900 dark:text-zinc-100 line-clamp-1">{draw.title}</p>
                        <p className="text-xs text-zinc-500">
                          ₹{draw.entryFee} • {draw.stats.productCount} Prize{draw.stats.productCount !== 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <Badge variant={getStatusColor(draw.status)} size="sm" className="capitalize">
                      {draw.status.toLowerCase()}
                    </Badge>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="w-32">
                      <div className="flex justify-between text-xs mb-1.5">
                        <span className="text-zinc-700 dark:text-zinc-300 font-medium">{draw.stats.percentage}%</span>
                        <span className="text-zinc-400">{draw.stats.sold}/{draw.maxTickets}</span>
                      </div>
                      <div className="h-1.5 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-zinc-900 dark:bg-white rounded-full transition-all" 
                          style={{ width: `${Math.min(draw.stats.percentage, 100)}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex flex-col text-xs text-zinc-500 gap-0.5">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-3 h-3" />
                        {format(new Date(draw.endTime), "MMM d, yyyy")}
                      </span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <div className="flex items-center justify-end gap-1 transition-opacity">
                      <Link href={`/admin/draws/${draw.id}`}>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </Button>
                      </Link>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-zinc-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                        onClick={() => handleDelete(draw.id, draw.stats.sold)}
                        disabled={isDeleting || !canDelete}
                        title={!canDelete ? "Cannot delete draws with sold tickets" : "Delete draw"}
                      >
                        {isDeleting ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Trash2 className="w-3.5 h-3.5" />
                        )}
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}