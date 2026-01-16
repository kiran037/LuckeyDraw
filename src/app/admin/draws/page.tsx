export const dynamic = "force-dynamic";

import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/AdminUI/ui/Button";
import DrawList from "@/components/AdminUI/Draws/DrawList";
import { headers, cookies } from "next/headers";

async function getDraws() {
  const headerList = await headers();
  const cookieStore = await cookies();
  const host = headerList.get("host");
  const protocol = process.env.NODE_ENV === "development" ? "http" : "https";
  
  try {
    const res = await fetch(`${protocol}://${host}/api/admin/draws?limit=10`, {
      cache: "no-store",
      headers: { Cookie: cookieStore.toString() }
    });
    
    if (!res.ok) return { draws: [], meta: { total: 0, page: 1, limit: 10, totalPages: 0 } };
    
    const json = await res.json();
    return json; 
  } catch (e) {
    return { draws: [], meta: { total: 0, page: 1, limit: 10, totalPages: 0 } };
  }
}

export default async function DrawsPage() {
  const data = await getDraws();

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-zinc-900 dark:text-white">Draws</h1>
          <p className="text-sm text-zinc-500">Manage your raffles and ticket sales.</p>
        </div>
        <Link href="/admin/draws/create">
          <Button size="sm" className="w-full sm:w-auto">
            <Plus className="w-4 h-4 mr-2" />
            Create Draw
          </Button>
        </Link>
      </div>

      <DrawList draws={data.draws} meta={data.meta} />
    </div>
  );
}