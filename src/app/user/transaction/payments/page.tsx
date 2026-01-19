'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api-client';
import { Loader2, CheckCircle, XCircle, Clock } from 'lucide-react';

interface PaymentTx {
  id: string;
  amount: number;
  status: string;
  method: string;
  gateway: string;
  drawTitle: string;
  remark?: string | null;
  createdAt: string;
}
interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}
export default function PaymentTransactionPage() {
  const [data, setData] = useState<PaymentTx[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    async function load() {
      const res = await api.get<ApiResponse<PaymentTx[]>>(
        '/user/transaction/payments'
      );

      if (res.success && Array.isArray(res.data)) {
        setData(res.data);
      }
    }
    load().finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-purple-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0B0E14] p-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-black mb-6">Payment History</h1>

        {data.length === 0 ? (
          <p className="text-sm text-gray-500">No payments found</p>
        ) : (
          <div className="space-y-3">
            {data.map(p => (
              <div key={p.id}
                className="bg-white dark:bg-[#151922] border border-gray-200
                           dark:border-white/10 rounded-xl p-4 flex justify-between">
                <div>
                  <p className="font-bold text-sm">{p.drawTitle}</p>
                  <p className="text-[11px] text-gray-500">
                    {new Date(p.createdAt).toLocaleString()}
                  </p>
                  {p.status === 'REJECTED' && p.remark && (
                    <p className="text-[11px] text-red-500 mt-1">
                      Reason: {p.remark}
                    </p>
                  )}
                </div>

                <div className="text-right">
                  <p className="font-black text-sm">₹{p.amount}</p>
                  <div className="flex items-center gap-1 text-xs">
                    {p.status === 'APPROVED' && <CheckCircle size={14} className="text-emerald-500" />}
                    {p.status === 'REJECTED' && <XCircle size={14} className="text-red-500" />}
                    {p.status === 'PENDING' && <Clock size={14} className="text-yellow-500" />}
                    <span>{p.status}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
