export const dynamic = "force-dynamic";

import { headers, cookies } from "next/headers";
import TicketsPageClient from "@/components/AdminUI/Tickets/TicketsPageClient";

async function getTickets() {
  const headerList = await headers();
  const cookieStore = await cookies();
  const host = headerList.get("host");
  const protocol = process.env.NODE_ENV === "development" ? "http" : "https";
  
  try {
    const res = await fetch(`${protocol}://${host}/api/admin/tickets?limit=50`, {
      cache: "no-store",
      headers: { Cookie: cookieStore.toString() }
    });
    
    if (!res.ok) {
      return { 
        tickets: [], 
        meta: { total: 0, page: 1, limit: 50, totalPages: 0 } 
      };
    }
    
    const json = await res.json();
    return json; 
  } catch (e) {
    return { 
      tickets: [], 
      meta: { total: 0, page: 1, limit: 50, totalPages: 0 } 
    };
  }
}

export default async function TicketsPage() {
  const data = await getTickets();

  return <TicketsPageClient initialData={data} />;
}