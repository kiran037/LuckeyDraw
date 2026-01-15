"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { PageHeader, Card, Badge, Button } from "@/components/ui";
import { Plus, Edit } from "lucide-react";

type DrawStatus = "DRAFT" | "LIVE" | "CLOSED" | "RESULT_DECLARED";

interface Draw {
  id: string;
  title: string;
  entryFee: number;
  maxTickets: number;
  ticketCount: number;
  status: DrawStatus;
}

export default function DrawsPage() {
  const [draws, setDraws] = useState<Draw[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const res = await fetch("/api/admin/draws", {
        credentials: "include",
      });
      const json = await res.json();
      if (json.success) setDraws(json.data);
      setLoading(false);
    })();
  }, []);

  const badgeVariant = (status: DrawStatus) => {
    if (status === "LIVE") return "success";
    if (status === "DRAFT") return "warning";
    if (status === "CLOSED") return "danger";
    return "default";
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Lucky Draws"
        description="Manage all lucky draws"
        action={
          <Button asChild>
            <Link href="/admin/draws/new" className="flex gap-2">
              <Plus size={18} />
              Add Draw
            </Link>
          </Button>
        }
      />

      <Card>
        <table className="w-full">
          <thead>
            <tr className="border-b text-xs uppercase text-gray-600">
              <th className="px-4 py-3 text-left">Title</th>
              <th className="px-4 py-3 text-right">Entry</th>
              <th className="px-4 py-3 text-right">Max</th>
              <th className="px-4 py-3 text-right">Sold</th>
              <th className="px-4 py-3 text-center">Status</th>
              <th className="px-4 py-3 text-center">Action</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={6} className="py-6 text-center">
                  Loading…
                </td>
              </tr>
            )}

            {!loading &&
              draws.map((d) => (
                <tr key={d.id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-4 font-semibold">{d.title}</td>
                  <td className="px-4 py-4 text-right">₹{d.entryFee}</td>
                  <td className="px-4 py-4 text-right">{d.maxTickets}</td>
                  <td className="px-4 py-4 text-right">{d.ticketCount}</td>
                  <td className="px-4 py-4 text-center">
                    <Badge variant={badgeVariant(d.status)}>
                      {d.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-4 text-center">
                    <Button asChild size="sm" variant="ghost">
                      <Link href={`/admin/draws/${d.id}`}>
                        <Edit size={16} /> Edit
                      </Link>
                    </Button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}