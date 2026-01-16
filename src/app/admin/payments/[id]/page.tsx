export const dynamic = "force-dynamic";

import PaymentDetail from "@/components/AdminUI/Payments/PaymentDetail";
import { headers, cookies } from "next/headers";

async function getPayment(id: string) {
  const headerList = await headers();
  const cookieStore = await cookies();
  const host = headerList.get("host");
  const protocol = process.env.NODE_ENV === "development" ? "http" : "https";

  try {
    const res = await fetch(`${protocol}://${host}/api/admin/payments/${id}`, {
      cache: "no-store",
      headers: { Cookie: cookieStore.toString() }
    });

    if (!res.ok) return null;
    
    const json = await res.json();
    return json.payment; 
  } catch (e) {
    return null;
  }
}

export default async function PaymentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const payment = await getPayment(id);

  if (!payment) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Payment Not Found</h2>
          <p className="text-zinc-500 text-sm mt-1">The payment you are looking for does not exist or has been deleted.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto animate-in fade-in duration-500">
      <PaymentDetail payment={payment} />
    </div>
  );
}