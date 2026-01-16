export const dynamic = "force-dynamic";

import { Filter } from "lucide-react";
import PaymentList from "@/components/AdminUI/Payments/PaymentList";
import { headers, cookies } from "next/headers";

async function getPayments() {
  const headerList = await headers();
  const cookieStore = await cookies();
  const host = headerList.get("host");
  const protocol = process.env.NODE_ENV === "development" ? "http" : "https";
  
  try {
    const res = await fetch(`${protocol}://${host}/api/admin/payments?limit=50`, {
      cache: "no-store",
      headers: { Cookie: cookieStore.toString() }
    });
    
    if (!res.ok) {
      return { 
        payments: [], 
        meta: { total: 0, page: 1, limit: 50, totalPages: 0 } 
      };
    }
    
    const json = await res.json();
    return json; 
  } catch (e) {
    return { 
      payments: [], 
      meta: { total: 0, page: 1, limit: 50, totalPages: 0 } 
    };
  }
}

export default async function PaymentsPage() {
  const data = await getPayments();

  const pendingCount = data.payments.filter((p: { status: string }) => p.status === "PENDING").length;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-zinc-900 dark:text-white">Payments</h1>
          <p className="text-sm text-zinc-500">
            Review and approve payment transactions.
            {pendingCount > 0 && (
              <span className="ml-2 inline-flex items-center gap-1 text-amber-600 dark:text-amber-400">
                <Filter className="w-3 h-3" />
                {pendingCount} pending review
              </span>
            )}
          </p>
        </div>
      </div>

      <PaymentList payments={data.payments} meta={data.meta} />
    </div>
  );
}